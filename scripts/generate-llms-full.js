#!/usr/bin/env node
/**
 * Regenerates llms-full.txt by concatenating README.md and docs/*.md.
 *
 * Run: `node scripts/generate-llms-full.js` (or `npm run generate:llms`).
 *
 * The output is consumer-facing — used by LLM agents that prefer one-shot context
 * over following links from llms.txt. Keep the SOURCES list in sync with what's
 * referenced from llms.txt.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'llms-full.txt');

// Order matters: top-level overview first, then docs in reading order.
const SOURCES = [
    'README.md',
    'docs/GETTING_STARTED.md',
    'docs/ARCHITECTURE.md',
    'docs/COMPONENTS.md',
    'docs/THEMING.md',
    'docs/HOOKS.md',
    'docs/I18N.md',
    'docs/EXAMPLES.md',
    'docs/TROUBLESHOOTING.md',
    'docs/AI_AGENTS.md',
    'docs/PROJECT_STRUCTURE.md',
];

const HEADER = [
    '# @gravity-ui/aikit — full documentation',
    '',
    'This file concatenates the project README and all docs/*.md files for LLM agents that prefer one-shot context over following links.',
    '',
    'Sections are delimited by lines like: --- file: <path> ---',
    '',
].join('\n');

function main() {
    const missing = SOURCES.filter((rel) => !fs.existsSync(path.join(ROOT, rel)));
    if (missing.length > 0) {
        console.error('Missing source files:', missing.join(', '));
        process.exit(1);
    }

    const parts = [HEADER];

    for (const rel of SOURCES) {
        const abs = path.join(ROOT, rel);
        const content = fs.readFileSync(abs, 'utf8').replace(/\s+$/, '');
        parts.push('');
        parts.push(`--- file: ${rel} ---`);
        parts.push('');
        parts.push(content);
        parts.push('');
    }

    const output = parts.join('\n') + '\n';
    fs.writeFileSync(OUTPUT, output);

    const lines = output.split('\n').length;
    const bytes = Buffer.byteLength(output, 'utf8');
    console.log(
        `Wrote ${path.relative(ROOT, OUTPUT)} (${lines} lines, ${(bytes / 1024).toFixed(1)} kB)`,
    );
}

main();
