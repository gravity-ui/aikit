#!/usr/bin/env node
/**
 * Regenerates the per-component subpath entries inside `package.json#exports`
 * from the on-disk component tree in `src/components/<level>/<Name>/`.
 *
 * Non-component entries (`.`, `./types`, `./hooks`, `./utils`, `./adapters`,
 * `./atoms`, `./molecules`, …, `./styles`, `./themes/*`, `./server/*`,
 * `./package.json`, `./utils/<name>`) are preserved as-is.
 *
 * Run modes:
 *   node scripts/generate-exports.js           # rewrite package.json in place
 *   node scripts/generate-exports.js --check   # exit 1 if regeneration would change anything
 *
 * Used by `npm run generate:exports` and by the husky pre-commit hook.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const COMPONENTS_ROOT = path.join(ROOT, 'src', 'components');
const LEVELS = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];

function listComponents() {
    const result = [];
    for (const level of LEVELS) {
        const dir = path.join(COMPONENTS_ROOT, level);
        const names = fs
            .readdirSync(dir, {withFileTypes: true})
            .filter((e) => e.isDirectory() && /^[A-Z]/.test(e.name))
            .map((e) => e.name)
            .sort();
        for (const name of names) result.push({level, name});
    }
    return result;
}

function makeEntry(level, name) {
    const esm = `./build/esm/components/${level}/${name}/index`;
    const cjs = `./build/cjs/components/${level}/${name}/index`;
    return {
        import: {
            types: `${esm}.d.ts`,
            default: `${esm}.js`,
        },
        require: {
            types: `${cjs}.d.ts`,
            default: `${cjs}.js`,
        },
    };
}

function buildExports(currentExports, components) {
    const generated = {};
    for (const c of components) generated[`./${c.name}`] = makeEntry(c.level, c.name);

    const next = {};
    let inserted = false;
    for (const [key, value] of Object.entries(currentExports)) {
        if (/^\.\/[A-Z]/.test(key)) {
            if (!inserted) {
                for (const [gk, gv] of Object.entries(generated)) next[gk] = gv;
                inserted = true;
            }
            continue;
        }
        next[key] = value;
    }
    if (!inserted) {
        // No component keys yet — append at the end of the exports object.
        for (const [gk, gv] of Object.entries(generated)) next[gk] = gv;
    }
    return next;
}

function serializePackageJson(pkg) {
    return JSON.stringify(pkg, null, 2) + '\n';
}

function main() {
    const check = process.argv.includes('--check');

    const raw = fs.readFileSync(PKG_PATH, 'utf8');
    const pkg = JSON.parse(raw);
    if (!pkg.exports || typeof pkg.exports !== 'object') {
        console.error('package.json has no `exports` object');
        process.exit(1);
    }

    const components = listComponents();
    pkg.exports = buildExports(pkg.exports, components);
    const next = serializePackageJson(pkg);

    if (next === raw) {
        if (check) console.log(`exports in sync (${components.length} components)`);
        return;
    }

    if (check) {
        console.error('package.json#exports is OUT OF SYNC with src/components/.');
        console.error('Run: npm run generate:exports');
        process.exit(1);
    }

    fs.writeFileSync(PKG_PATH, next);
    console.log(
        `Updated package.json#exports — ${components.length} components ` +
            `(${LEVELS.map((l) => `${l}=${components.filter((c) => c.level === l).length}`).join(', ')})`,
    );
}

main();
