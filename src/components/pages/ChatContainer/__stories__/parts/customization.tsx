import {useState} from 'react';

import {ChatContainer} from '../..';
import type {TChatMessage, TSubmitData} from '../../../../../types';

import {type Story, defaultDecorators, mockChats, mockMessages, mockSuggestions} from './shared';

/**
 * With custom texts (flat `texts` prop)
 */
export const WithCustomTexts: Story = {
    args: {
        messages: [],
        texts: {
            headerTitle: 'My Custom AI Assistant',
            emptyStateTitle: 'Hello!',
            emptyStateDescription: 'How can I help you today?',
            emptyStateSuggestionsTitle: 'Quick actions:',
            promptPlaceholder: 'Ask me anything...',
            disclaimerText: 'Custom disclaimer text here.',
        },
        welcomeConfig: {
            suggestions: mockSuggestions.slice(0, 2),
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        return <ChatContainer {...args} messages={messages} onSendMessage={handleSendMessage} />;
    },
    decorators: defaultDecorators,
};

/**
 * With component props override
 */
export const WithComponentPropsOverride: Story = {
    args: {
        messages: mockMessages,
        headerProps: {
            titlePosition: 'center',
        },
        promptInputProps: {
            view: 'full',
            maxLength: 2000,
        },
        disclaimerProps: {
            className: 'custom-disclaimer',
            text: 'Custom disclaimer text with className and variant override',
            variant: 'caption-2',
        },
        historyProps: {
            groupBy: 'none',
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        return <ChatContainer {...args} messages={messages} onSendMessage={handleSendMessage} />;
    },
    decorators: defaultDecorators,
};

/**
 * Unified `qa`: string sets root only (backward compatible).
 */
export const WithQaString: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
        },
        qa: 'integration-chat-root',
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} />,
    decorators: defaultDecorators,
};

/**
 * Unified `qa`: `{ prefix }` opt-in for `${prefix}-${slot}` on major slots.
 */
export const WithQaPrefix: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
        },
        qa: {prefix: 'chat-pre'},
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} />,
    decorators: defaultDecorators,
};

/**
 * Unified `qa`: explicit map for integration tests.
 */
export const WithQaExplicit: Story = {
    args: {
        messages: mockMessages,
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        contextItems: [{id: 'qa-demo', content: 'Context', onRemove: () => {}}],
        promptInputProps: {
            view: 'full',
        },
        qa: {
            root: 'qa-chat-root',
            header: 'qa-chat-header',
            content: 'qa-chat-content',
            messageList: 'qa-chat-message-list',
            promptInput: 'qa-chat-prompt',
            promptInputHeader: 'qa-chat-prompt-header',
            promptInputBody: 'qa-chat-prompt-body',
            promptInputFooter: 'qa-chat-prompt-footer',
            submitButton: 'qa-chat-submit',
            disclaimer: 'qa-chat-disclaimer',
            history: 'qa-chat-history',
        },
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} />,
    decorators: defaultDecorators,
};

/**
 * Unified flat `texts` overrides for labels and copy.
 */
export const WithTexts: Story = {
    args: {
        messages: [],
        chats: [],
        showHistory: true,
        showNewChat: true,
        welcomeConfig: {
            showDefaultTitle: false,
            showDefaultDescription: false,
            suggestions: [{id: '1', title: 'Pick me'}],
            showMore: () => {},
        },
        texts: {
            headerTitle: 'E2E Header Title',
            emptyStateTitle: 'E2E Welcome Title',
            emptyStateDescription: 'E2E Welcome description',
            emptyStateSuggestionsTitle: 'E2E Suggestions header',
            emptyStateShowMoreText: 'E2E Show more',
            promptPlaceholder: 'E2E Placeholder text',
            promptSuggestTitle: 'E2E Prompt suggests title',
            submitSendTooltip: 'E2E Send tooltip',
            submitCancelTooltip: 'E2E Cancel tooltip',
            disclaimerText: 'E2E Disclaimer copy',
            historySearchPlaceholder: 'E2E History search ph',
            historyEmptyPlaceholder: 'E2E No chats yet',
            historyEmptyFilteredPlaceholder: 'E2E No search results',
        },
        promptInputProps: {
            view: 'full',
            suggestionsProps: {
                showSuggestions: true,
                suggestions: [{id: 's1', title: 'E2E Suggestion chip'}],
            },
        },
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} />,
    decorators: defaultDecorators,
};

/**
 * `texts.submitButtonCancelableText` in streaming (cancelable submit) state.
 */
export const WithTextsStreaming: Story = {
    args: {
        messages: [
            {
                id: 'e2e-stream-1',
                role: 'user',
                content: 'Hello',
            },
        ],
        status: 'streaming',
        promptInputProps: {
            view: 'full',
        },
        texts: {
            submitButtonCancelableText: 'E2E Stop streaming',
        },
    },
    render: (args) => (
        <ChatContainer {...args} onSendMessage={async () => {}} onCancel={async () => {}} />
    ),
    decorators: defaultDecorators,
};

/**
 * `texts.errorText` overrides MessageList error alert body.
 */
export const WithTextsError: Story = {
    args: {
        messages: mockMessages.slice(0, 1),
        status: 'error',
        error: new Error('Original error message'),
        promptInputProps: {
            view: 'full',
        },
        texts: {
            errorText: 'E2E Custom error surface',
        },
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} onRetry={() => {}} />,
    decorators: defaultDecorators,
};
