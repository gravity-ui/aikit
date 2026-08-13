import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';

jest.mock('@diplodoc/mdx-extension', () => ({
    isWithMdxArtifacts: jest.fn(),
    mdxPlugin: jest.fn(),
    useMdx: jest.fn(() => null),
}));

const mockTransformResult = {
    html: [
        '<div class="yfm-code-floating-container" data-aikit-code-block>',
        '<pre><code>SELECT 1;</code></pre>',
        '<div class="yfm-code-floating">',
        '<button aria-label="Copy"></button><button aria-label="Wrap"></button>',
        '</div>',
        '</div>',
        '<div class="yfm-code-floating-container" data-aikit-code-block>',
        '<pre><code>SELECT 2;</code></pre>',
        '<div class="yfm-code-floating">',
        '<button aria-label="Copy"></button><button aria-label="Wrap"></button>',
        '</div>',
        '</div>',
    ].join(''),
    codeBlocks: [
        {code: 'SELECT 1;', language: 'sql'},
        {code: 'SELECT 2;', language: 'yql'},
    ],
};
const mockUseMarkdownTransform = jest.fn((_content?: string) => mockTransformResult);

jest.mock('../../../../hooks/useMarkdownTransform', () => ({
    useMarkdownTransform: mockUseMarkdownTransform,
}));

const {MarkdownRenderer} =
    jest.requireActual<typeof import('../MarkdownRenderer')>('../MarkdownRenderer');

describe('MarkdownRenderer code block actions', () => {
    afterEach(() => {
        mockUseMarkdownTransform.mockReset();
        mockUseMarkdownTransform.mockReturnValue(mockTransformResult);
    });

    test('renders an action for each transformed code block', () => {
        const handleAction = jest.fn();

        render(
            <MarkdownRenderer
                content={'```SQL\nSELECT 1;\n```\n\n~~~yQl\nSELECT 2;\n~~~'}
                codeBlockActions={{
                    render: (block) => (
                        <button type="button" onClick={() => handleAction(block)}>
                            Open {block.index}
                        </button>
                    ),
                }}
            />,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Open 0'}));
        fireEvent.click(screen.getByRole('button', {name: 'Open 1'}));

        expect(handleAction).toHaveBeenNthCalledWith(1, {
            code: 'SELECT 1;',
            language: 'sql',
            index: 0,
        });
        expect(handleAction).toHaveBeenNthCalledWith(2, {
            code: 'SELECT 2;',
            language: 'yql',
            index: 1,
        });
        const toolbar = screen.getAllByRole('button', {name: 'Copy'})[0].parentElement;
        expect(toolbar?.children[0].className).toContain('code-block-actions');
        expect(toolbar?.children[1]).toHaveAttribute('aria-label', 'Copy');
        expect(toolbar?.children[2]).toHaveAttribute('aria-label', 'Wrap');
    });

    test('applies always visibility only to blocks with rendered actions', () => {
        const {container} = render(
            <MarkdownRenderer
                content="code"
                codeBlockActions={{
                    render: ({index}) => (index === 1 ? <button type="button">Open</button> : null),
                    visibility: 'always',
                }}
            />,
        );

        const codeBlocks = container.querySelectorAll('[data-aikit-code-block]');
        expect(codeBlocks[0].className).not.toContain('actionsVisible');
        expect(codeBlocks[1].className).toContain('actionsVisible');
        expect(screen.getByRole('button', {name: 'Open'})).toBeTruthy();
        expect(screen.getAllByRole('button', {name: 'Copy'})).toHaveLength(2);
        expect(screen.getAllByRole('button', {name: 'Wrap'})).toHaveLength(2);
    });

    test('supports the legacy clipboard markup without replacing the native copy action', () => {
        mockUseMarkdownTransform.mockReturnValueOnce({
            html: [
                '<div class="yfm-clipboard" data-aikit-code-block>',
                '<pre><code>SELECT 1;</code></pre>',
                '<button class="yfm-clipboard-button" aria-label="Copy"></button>',
                '</div>',
            ].join(''),
            codeBlocks: [{code: 'SELECT 1;', language: 'sql'}],
        });

        const {container} = render(
            <MarkdownRenderer
                content="code"
                codeBlockActions={{render: () => <button type="button">Open</button>}}
            />,
        );

        const codeBlock = container.querySelector('[data-aikit-code-block]');
        const actionMount = codeBlock?.querySelector(
            '.g-aikit-markdown-renderer__code-block-actions',
        );
        const copyButton = screen.getByRole('button', {name: 'Copy'});
        expect(actionMount?.nextElementSibling).toBe(copyButton);
    });

    test('fails closed when parser metadata and marked elements do not match', () => {
        mockUseMarkdownTransform.mockReturnValueOnce({
            ...mockTransformResult,
            codeBlocks: [{code: 'SELECT 1;', language: 'sql'}],
        });

        render(
            <MarkdownRenderer
                content="code"
                codeBlockActions={{render: () => <button type="button">Open</button>}}
            />,
        );

        expect(screen.queryByRole('button', {name: 'Open'})).toBeNull();
    });

    test('replaces stale portals and handlers when the action renderer changes', () => {
        const firstHandler = jest.fn();
        const latestHandler = jest.fn();
        const {rerender} = render(
            <MarkdownRenderer
                content="code"
                codeBlockActions={{
                    render: () => (
                        <button type="button" onClick={firstHandler}>
                            First
                        </button>
                    ),
                }}
            />,
        );

        rerender(
            <MarkdownRenderer
                content="code"
                codeBlockActions={{
                    render: () => (
                        <button type="button" onClick={latestHandler}>
                            Latest
                        </button>
                    ),
                }}
            />,
        );

        expect(screen.queryByRole('button', {name: 'First'})).toBeNull();
        const latestActions = screen.getAllByRole('button', {name: 'Latest'});
        expect(latestActions).toHaveLength(2);
        fireEvent.click(latestActions[0]);
        expect(firstHandler).not.toHaveBeenCalled();
        expect(latestHandler).toHaveBeenCalledTimes(1);

        rerender(<MarkdownRenderer content="code" />);

        expect(screen.queryByRole('button', {name: 'Latest'})).toBeNull();
        expect(document.querySelector('.g-aikit-markdown-renderer__code-block-actions')).toBeNull();
        expect(document.querySelector('.g-aikit-markdown-renderer__code-block')).toBeNull();
    });
});
