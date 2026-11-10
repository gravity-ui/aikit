import {render, screen} from '@testing-library/react';

import {UserMessage as DefaultUserMessage} from '../../components/organisms/UserMessage';
import {McpToolRenderer} from '../../components/pages/AIStudioChat/McpToolRenderer';
import {
    AssistantMessage,
    MarkdownProvider,
    type MarkdownRendererProps,
    ThinkingMessage,
    ThinkingMessageGroup,
    UserMessage,
} from '../../custom-markdown';
import {MarkdownContent} from '../MarkdownProvider';

jest.mock('../../components/atoms/MarkdownRenderer', () => ({
    MarkdownRenderer: ({content}: {content: string}) => <div>Built-in: {content}</div>,
}));

jest.mock('uuid', () => ({v4: () => 'test-id'}));

const renderer = jest.fn(({content}: MarkdownRendererProps) => <div>Custom: {content}</div>);

describe('MarkdownProvider', () => {
    beforeEach(() => renderer.mockClear());

    test('routes chat Markdown through the custom renderer', () => {
        render(
            <MarkdownProvider renderer={renderer}>
                <AssistantMessage id="answer" content="Assistant text" />
                <UserMessage content="User text" format="markdown" />
                <ThinkingMessage content="Reasoning text" status="thought" format="markdown" />
                <ThinkingMessageGroup
                    steps={[
                        {id: 'step', type: 'reasoning', status: 'thought', content: 'Step text'},
                    ]}
                    format="markdown"
                    expanded
                />
                <McpToolRenderer
                    part={{
                        type: 'tool',
                        data: {
                            toolName: 'tool',
                            initialExpanded: true,
                            autoCollapseOnSuccess: false,
                            status: 'success',
                            mcpRequest: '{}',
                            mcpResponse: '[]',
                        },
                    }}
                />
            </MarkdownProvider>,
        );

        for (const content of ['Assistant text', 'User text', 'Reasoning text', 'Step text']) {
            expect(screen.getByText(`Custom: ${content}`)).toBeTruthy();
        }
        const contents = renderer.mock.calls.map(([props]) => props.content);
        expect(contents).toContain('```json\n{}\n```');
        expect(contents).toContain('```json\n[]\n```');
    });

    test('passes renderer options through and uses the nearest provider', () => {
        const options: MarkdownRendererProps = {
            content: 'Nested',
            className: 'markdown',
            qa: 'content',
            transformOptions: {breaks: true},
            shouldParseIncompleteMarkdown: true,
            openLinksInNewTab: true,
            mdxOptions: {components: {}},
            mdxContext: {messageId: 'message'},
            extraProps: {'aria-label': 'answer'},
        };
        const outerRenderer = jest.fn(() => null);
        render(
            <MarkdownProvider renderer={outerRenderer}>
                <MarkdownProvider renderer={renderer}>
                    <MarkdownContent {...options} />
                </MarkdownProvider>
            </MarkdownProvider>,
        );
        expect(renderer.mock.calls[0][0]).toEqual(options);
        expect(outerRenderer).not.toHaveBeenCalled();
    });

    test('preserves the built-in renderer for the existing component entry', () => {
        render(<DefaultUserMessage content="Default text" format="markdown" />);
        expect(screen.getByText('Built-in: Default text')).toBeTruthy();
    });

    test('existing component entries respect an explicit provider', () => {
        render(
            <MarkdownProvider renderer={renderer}>
                <DefaultUserMessage content="Override" format="markdown" />
            </MarkdownProvider>,
        );
        expect(screen.getByText('Custom: Override')).toBeTruthy();
        expect(screen.queryByText('Built-in: Override')).toBeNull();
    });
});
