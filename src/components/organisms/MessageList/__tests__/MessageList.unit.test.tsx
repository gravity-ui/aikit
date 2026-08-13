import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';

import type {TChatMessage, TextMessageContent} from '../../../../types/messages';
import {
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../utils/messageTypeRegistry';

jest.mock('@diplodoc/mdx-extension', () => ({
    isWithMdxArtifacts: jest.fn(),
    mdxPlugin: jest.fn(),
    useMdx: jest.fn(() => null),
}));

jest.mock('../../../../hooks/useMarkdownTransform', () => ({
    useMarkdownTransform: jest.fn(() => ({
        html: [
            '<div class="yfm-clipboard" data-aikit-code-block>',
            '<pre><code>SELECT 1;</code></pre>',
            '<button class="yfm-clipboard-button" aria-label="Copy"></button>',
            '</div>',
        ].join(''),
        codeBlocks: [{code: 'SELECT 1;', language: 'sql'}],
    })),
}));

const {MessageList} = jest.requireActual<typeof import('../MessageList')>('../MessageList');

Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: jest.fn(),
});
Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
    },
});

describe('MessageList markdown code block actions', () => {
    test('resolves actions for user markdown and assistant text only', () => {
        const messages: TChatMessage[] = [
            {
                id: 'user-markdown',
                role: 'user',
                content: '```sql\nSELECT 1;\n```',
                format: 'markdown',
            },
            {
                id: 'assistant-text',
                role: 'assistant',
                content: '```sql\nSELECT 1;\n```',
            },
            {
                id: 'assistant-thinking',
                role: 'assistant',
                content: {
                    type: 'thinking',
                    data: {content: '```sql\nSELECT 1;\n```', status: 'thought'},
                },
            },
            {
                id: 'assistant-tool',
                role: 'assistant',
                content: {
                    type: 'tool',
                    data: {toolName: 'example', bodyContent: '```sql\nSELECT 1;\n```'},
                },
            },
        ];

        render(
            <MessageList
                messages={messages}
                getMarkdownCodeBlockActions={(message) => ({
                    render: () => <button type="button">Open {message.id}</button>,
                })}
            />,
        );

        expect(screen.getByRole('button', {name: 'Open user-markdown'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Open assistant-text'})).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {name: 'Open assistant-thinking'}),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'Open assistant-tool'})).not.toBeInTheDocument();
    });

    test('preserves the resolver in the virtualized list', () => {
        const message: TChatMessage = {
            id: 'virtualized-user-markdown',
            role: 'user',
            content: '```sql\nSELECT 1;\n```',
            format: 'markdown',
        };

        render(
            <MessageList
                messages={[message]}
                virtualized
                getMarkdownCodeBlockActions={(resolvedMessage) => ({
                    render: () => <button type="button">Open {resolvedMessage.id}</button>,
                })}
            />,
        );

        expect(
            screen.getByRole('button', {name: 'Open virtualized-user-markdown'}),
        ).toBeInTheDocument();
    });

    test('does not inject actions into a custom text renderer', () => {
        const messageRendererRegistry = createMessageRendererRegistry();
        registerMessageRenderer<TextMessageContent>(messageRendererRegistry, 'text', {
            component: () => <div>Custom text renderer</div>,
        });
        const message: TChatMessage = {
            id: 'custom-assistant-text',
            role: 'assistant',
            content: '```sql\nSELECT 1;\n```',
        };

        render(
            <MessageList
                messages={[message]}
                messageRendererRegistry={messageRendererRegistry}
                getMarkdownCodeBlockActions={(resolvedMessage) => ({
                    render: () => <button type="button">Open {resolvedMessage.id}</button>,
                })}
            />,
        );

        expect(screen.getByText('Custom text renderer')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {name: 'Open custom-assistant-text'}),
        ).not.toBeInTheDocument();
    });
});
