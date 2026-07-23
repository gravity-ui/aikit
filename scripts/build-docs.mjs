// Builds the AI-facing docs tree (cleaned READMEs + guides) into build/docs so an
// agent in a consumer project reads docs matching the installed version from
// node_modules/@gravity-ui/aikit/build/docs. Runs at the end of the build via the
// gulp `copy-docs` task (and `npm run build:docs`). Uses @gravity-ui/readme-validator's
// buildDocs() with a config tailored to this package's layout.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildDocs} from '@gravity-ui/readme-validator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

buildDocs({
    rootDir: ROOT,
    outDir: path.join(ROOT, 'build', 'docs'),
    sources: [
        {
            title: 'Guides',
            kind: 'markdown',
            baseDir: 'docs',
            outPrefix: 'guides',
            nameFromTitle: true,
        },
        {
            title: 'Components',
            kind: 'readme',
            baseDir: 'src/components',
            outPrefix: 'components',
            exclude: ['legacy'],
        },
    ],
});
