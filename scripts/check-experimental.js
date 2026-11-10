#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const stability = require('../src/components/stability.json');
const pkg = require('../package.json');
const levels = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const entry = read('src/experimental/index.ts');
const catalog = read('docs/COMPONENTS.md');
const llms = read('llms.txt');
const errors = [];

for (const name of Object.keys(stability)) {
    const level = levels.find((candidate) =>
        fs.existsSync(path.join(root, 'src/components', candidate, name)),
    );
    if (!level) {
        errors.push(`Unknown experimental component: ${name}`);
        continue;
    }
    const directory = `src/components/${level}/${name}`;
    if (
        pkg.exports[`./${name}`] ||
        read(`src/components/${level}/index.ts`).includes(`'./${name}'`)
    ) {
        errors.push(`${name} must not have a stable export`);
    }
    if (!entry.includes(`'../components/${level}/${name}'`)) {
        errors.push(`${name} is missing from the experimental entry`);
    }
    if (!read(`${directory}/README.md`).includes('**Experimental.**')) {
        errors.push(`${name} README needs an experimental notice`);
    }
    for (const [label, text] of [
        ['catalog', catalog],
        ['llms.txt', llms],
    ]) {
        const line = text.split('\n').find((value) => value.includes(`[${name}]`));
        if (!line || !line.includes('Experimental')) {
            errors.push(`${name} needs an Experimental marker in ${label}`);
        }
    }
    const stories = fs
        .readdirSync(path.join(root, directory, '__stories__'))
        .filter((file) => file.endsWith('.stories.tsx'));
    for (const file of stories) {
        if (!read(`${directory}/__stories__/${file}`).includes(`title: 'experimental/${name}'`)) {
            errors.push(`${name} needs an experimental Storybook category`);
        }
    }
    const sourceFiles = fs
        .readdirSync(path.join(root, directory))
        .filter((file) => /\.tsx?$/.test(file) && !file.includes('.test.'));
    for (const file of sourceFiles) {
        const source = read(`${directory}/${file}`);
        const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
        for (const declaration of parsed.statements) {
            const exported = declaration.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
            );
            if (!exported || ts.isExportDeclaration(declaration)) {
                continue;
            }
            const names = ts.isVariableStatement(declaration)
                ? declaration.declarationList.declarations.map((item) => item.name.getText(parsed))
                : [declaration.name?.getText(parsed)];
            if (!names.some((value) => value && /^[A-Z]/.test(value))) {
                continue;
            }
            if (!ts.getJSDocTags(declaration).some((tag) => tag.tagName.text === 'experimental')) {
                errors.push(`${file}: ${names.join(', ')} needs @experimental`);
            }
        }
    }
}
if (!pkg.exports['./experimental']) {
    errors.push('Missing ./experimental package export');
}
if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
console.log(`Experimental API boundaries verified (${Object.keys(stability).length} components)`);
