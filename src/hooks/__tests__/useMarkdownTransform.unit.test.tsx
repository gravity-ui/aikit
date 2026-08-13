import {renderHook} from '@testing-library/react';

import {MARKDOWN_CODE_BLOCKS_ENV_KEY} from '../../utils/markdownCodeBlockPlugin';

const mockTransform = jest.fn((content: string) => {
    const matches = Array.from(content.matchAll(/(?:```|~~~)([^\n]*)\n([\s\S]*?)\n(?:```|~~~)/g));
    const codeBlocks = matches.map((match) => {
        const language = match[1].trim().split(/\s+/, 1)[0]?.toLowerCase();

        return {
            code: match[2],
            ...(language ? {language} : {}),
        };
    });

    return {
        result: {
            html: codeBlocks.map(() => '<div data-aikit-code-block></div>').join(''),
            [MARKDOWN_CODE_BLOCKS_ENV_KEY]: codeBlocks,
        },
    };
});

jest.mock('@diplodoc/mdx-extension', () => ({
    isWithMdxArtifacts: jest.fn(),
}));
jest.mock('@diplodoc/transform', () => ({
    __esModule: true,
    default: mockTransform,
}));
jest.mock('@diplodoc/transform/dist/js/yfm.js', () => ({}));
jest.mock('../../utils/parse-blocks', () => ({
    parseMarkdownIntoBlocks: jest.fn((content: string) => {
        const secondBlockStart = content.indexOf('~~~');

        return secondBlockStart === -1
            ? [content]
            : [content.slice(0, secondBlockStart), content.slice(secondBlockStart)];
    }),
}));

const {useMarkdownTransform} =
    jest.requireActual<typeof import('../useMarkdownTransform')>('../useMarkdownTransform');

describe('useMarkdownTransform code block metadata', () => {
    beforeEach(() => {
        mockTransform.mockClear();
    });

    test('keeps metadata aligned across cached streaming and full-content MDX transforms', () => {
        const firstBlock = '```SQL\nSELECT 1;\n```\n\n';
        const secondBlock = '~~~yQl\nSELECT 2;\n~~~';

        const {result, rerender} = renderHook(
            ({content, enableMdx}) => useMarkdownTransform(content, undefined, enableMdx),
            {initialProps: {content: firstBlock, enableMdx: false}},
        );

        expect(result.current.codeBlocks).toEqual([{code: 'SELECT 1;', language: 'sql'}]);
        expect(mockTransform.mock.calls.map(([content]) => content)).toEqual([firstBlock]);

        rerender({content: firstBlock + secondBlock, enableMdx: false});

        expect(result.current.codeBlocks).toEqual([
            {code: 'SELECT 1;', language: 'sql'},
            {code: 'SELECT 2;', language: 'yql'},
        ]);
        expect(result.current.html.match(/data-aikit-code-block/g)).toHaveLength(2);
        expect(mockTransform.mock.calls.map(([content]) => content)).toEqual([
            firstBlock,
            secondBlock,
        ]);

        rerender({content: firstBlock + secondBlock, enableMdx: true});

        expect(result.current.codeBlocks).toEqual([
            {code: 'SELECT 1;', language: 'sql'},
            {code: 'SELECT 2;', language: 'yql'},
        ]);
        expect(result.current.html.match(/data-aikit-code-block/g)).toHaveLength(2);
        expect(mockTransform).toHaveBeenLastCalledWith(
            firstBlock + secondBlock,
            expect.any(Object),
        );
    });
});
