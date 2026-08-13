/** @jest-environment node */

import transform from '@diplodoc/transform';
import type {ExtendedPluginWithCollect, MarkdownIt} from '@diplodoc/transform/lib/typings';

import {MARKDOWN_CODE_BLOCKS_ENV_KEY, markdownCodeBlockPlugin} from '../markdownCodeBlockPlugin';
import {mergeMarkdownTransformOptions} from '../markdownUtils';

describe('markdownCodeBlockPlugin', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    test('collects normalized metadata and marks only fenced code blocks', () => {
        const content = [
            '`inline`',
            '',
            '```SQL',
            'SELECT 1;',
            '```',
            '',
            '~~~yQl showLineNumbers',
            'SELECT 2;',
            '~~~',
            '',
            '```',
            'plain',
            '',
            '```',
        ].join('\n');

        const {result} = transform(
            content,
            mergeMarkdownTransformOptions({plugins: [markdownCodeBlockPlugin]}),
        );

        expect(
            (result as {[MARKDOWN_CODE_BLOCKS_ENV_KEY]?: unknown})[MARKDOWN_CODE_BLOCKS_ENV_KEY],
        ).toEqual([
            {code: 'SELECT 1;', language: 'sql'},
            {code: 'SELECT 2;', language: 'yql'},
            {code: 'plain\n'},
        ]);
        expect(result.html.match(/data-aikit-code-block/g)).toHaveLength(3);
        expect(result.html).toContain('yfm-clipboard-inline-code');
    });

    test('composes with a custom fence renderer without reparsing markdown', () => {
        const customFencePlugin = ((md: MarkdownIt) => {
            const defaultRender = md.renderer.rules.fence;
            // eslint-disable-next-line no-param-reassign
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const rendered = defaultRender?.(tokens, idx, options, env, self) ?? '';

                return `<section data-custom-fence>${rendered.replace(
                    'class="yfm-clipboard"',
                    'class="custom-before yfm-clipboard custom-after"',
                )}</section>`;
            };
        }) as ExtendedPluginWithCollect;

        const {result} = transform(
            '```TypeScript extra\nconst answer = 42;\n```',
            mergeMarkdownTransformOptions({
                plugins: [customFencePlugin, markdownCodeBlockPlugin],
            }),
        );

        expect(result.html).toContain('<section data-custom-fence>');
        expect(result.html).toContain('data-aikit-code-block');
        expect(
            (result as {[MARKDOWN_CODE_BLOCKS_ENV_KEY]?: unknown})[MARKDOWN_CODE_BLOCKS_ENV_KEY],
        ).toEqual([{code: 'const answer = 42;', language: 'typescript'}]);
    });
});
