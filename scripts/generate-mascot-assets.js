/* eslint-env node */
const fs = require('node:fs/promises');
const path = require('node:path');

const {transform} = require('@svgr/core');
const prettier = require('prettier');

const assetsDir = path.resolve(__dirname, '../src/components/pages/ChatContainer/assets');
const outputDir = path.join(assetsDir, 'generated');

async function generateMascotAssets() {
    const prettierConfig = await prettier.resolveConfig(assetsDir);
    await fs.mkdir(outputDir, {recursive: true});

    const files = (await fs.readdir(assetsDir)).filter((file) => file.endsWith('.svg')).sort();
    for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const svg = await fs.readFile(filePath, 'utf8');
        const replaceAttrValues = {};
        // Each instance prefixes gradient and clip IDs, including references to those IDs.
        for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) {
            replaceAttrValues[id] = '{`${props.id}-' + id + '`}';
            replaceAttrValues[`url(#${id})`] = '{`url(#${props.id}-' + id + ')`}';
        }
        const componentName = file
            .replace(/\.svg$/, '')
            .split('-')
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join('');
        const component = await transform(
            svg,
            {
                plugins: ['@svgr/plugin-jsx'],
                typescript: true,
                jsxRuntime: 'automatic',
                dimensions: false,
                replaceAttrValues,
                runtimeConfig: false,
            },
            {componentName, filePath, caller: {name: 'aikit-mascot-assets'}},
        );
        const source = await prettier.format(
            `// Generated from ../${file}. Edit the SVG source instead.\n${component}`,
            {...prettierConfig, parser: 'typescript'},
        );
        const outputPath = path.join(outputDir, file.replace(/\.svg$/, '.tsx'));
        const previousSource = await fs.readFile(outputPath, 'utf8').catch((error) => {
            if (error.code === 'ENOENT') {
                return undefined;
            }
            throw error;
        });
        // Avoid triggering Storybook rebuilds when the source assets have not changed.
        if (previousSource !== source) {
            const temporaryPath = `${outputPath}.${process.pid}.tmp`;
            await fs.writeFile(temporaryPath, source);
            await fs.rename(temporaryPath, outputPath);
        }
    }
}

generateMascotAssets().catch((error) => {
    process.stderr.write(`${error.stack}\n`);
    process.exitCode = 1;
});
