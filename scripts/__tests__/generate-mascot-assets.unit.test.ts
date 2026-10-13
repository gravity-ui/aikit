/** @jest-environment node */
import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {promisify} from 'node:util';

const runNode = promisify(execFile);
const generatorPath = resolve(__dirname, '../generate-mascot-assets.js');

async function generateMascotAssets(options: {assetsDir: string; check?: boolean}) {
    // Run in Node's normal module loader, as the CLI does; Prettier uses ESM internally.
    await runNode(process.execPath, [
        '-e',
        `const {generateMascotAssets} = require(process.argv[1]);
        generateMascotAssets(JSON.parse(process.argv[2])).catch(error => {
            process.stderr.write(error.message);
            process.exitCode = 1;
        });`,
        generatorPath,
        JSON.stringify(options),
    ]);
}

const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>';

describe('mascot asset generation', () => {
    let assetsDir: string;

    beforeEach(async () => {
        assetsDir = await mkdtemp(join(tmpdir(), 'aikit-mascot-generation-'));
        await writeFile(join(assetsDir, 'idle.svg'), svg);
    });

    afterEach(async () => {
        await rm(assetsDir, {recursive: true, force: true});
    });

    it('reports missing output without creating the generated directory', async () => {
        await expect(generateMascotAssets({assetsDir, check: true})).rejects.toThrow('idle.tsx');
        await expect(stat(join(assetsDir, 'generated'))).rejects.toMatchObject({code: 'ENOENT'});
    });

    it('reports changed and stale files without rewriting or deleting them', async () => {
        const outputDir = join(assetsDir, 'generated');
        await mkdir(outputDir);
        await writeFile(join(outputDir, 'idle.tsx'), 'manually changed');
        await writeFile(join(outputDir, 'removed.tsx'), 'stale component');

        await expect(generateMascotAssets({assetsDir, check: true})).rejects.toThrow(
            'idle.tsx, removed.tsx',
        );
        await expect(readFile(join(outputDir, 'idle.tsx'), 'utf8')).resolves.toBe(
            'manually changed',
        );
        await expect(readFile(join(outputDir, 'removed.tsx'), 'utf8')).resolves.toBe(
            'stale component',
        );
    });

    it('regenerates renamed assets and removes only stale generated components', async () => {
        const outputDir = join(assetsDir, 'generated');
        await generateMascotAssets({assetsDir});
        await rename(join(assetsDir, 'idle.svg'), join(assetsDir, 'reading.svg'));
        await writeFile(join(outputDir, 'notes.txt'), 'keep this file');

        await expect(generateMascotAssets({assetsDir, check: true})).rejects.toThrow(
            'idle.tsx, reading.tsx',
        );
        await generateMascotAssets({assetsDir});
        await expect(generateMascotAssets({assetsDir, check: true})).resolves.toBeUndefined();
        expect((await readdir(outputDir)).sort()).toEqual(['notes.txt', 'reading.tsx']);
    });
});
