/* eslint-env node */
const fs = require('node:fs/promises');
const path = require('node:path');

const {transform} = require('@svgr/core');
const prettier = require('prettier');

const defaultAssetsDir = path.resolve(__dirname, '../src/components/pages/ChatContainer/assets');

async function generateMascotAssets({assetsDir = defaultAssetsDir, check = false} = {}) {
    const outputDir = path.join(assetsDir, 'generated');
    const prettierConfig = await prettier.resolveConfig(__filename);
    if (!check) {
        await fs.mkdir(outputDir, {recursive: true});
    }

    const files = (await fs.readdir(assetsDir)).filter((file) => file.endsWith('.svg')).sort();
    const expectedFiles = new Set(files.map((file) => file.replace(/\.svg$/, '.tsx')));
    const outputFiles = await fs.readdir(outputDir).catch((error) => {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    });
    const mismatches = [];
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
        if (check && previousSource !== source) {
            mismatches.push(path.basename(outputPath));
        } else if (previousSource !== source) {
            const temporaryPath = `${outputPath}.${process.pid}.tmp`;
            await fs.writeFile(temporaryPath, source);
            await fs.rename(temporaryPath, outputPath);
        }
    }

    for (const file of outputFiles) {
        if (file.endsWith('.tsx') && !expectedFiles.has(file)) {
            if (check) {
                mismatches.push(file);
            } else {
                await fs.unlink(path.join(outputDir, file));
            }
        }
    }

    if (mismatches.length > 0) {
        throw new Error(
            `Generated mascot assets are out of sync: ${mismatches.sort().join(', ')}. ` +
                'Run npm run generate:mascot and commit the generated files.',
        );
    }
}

module.exports = {generateMascotAssets};

if (require.main === module) {
    generateMascotAssets({check: process.argv.includes('--check')}).catch((error) => {
        process.stderr.write(`${error.stack}\n`);
        process.exitCode = 1;
    });
}
