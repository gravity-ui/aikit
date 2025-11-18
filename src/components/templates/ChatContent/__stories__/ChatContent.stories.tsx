/* eslint-disable no-console */
import {useState} from 'react';

import {CircleInfo} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ChatContent} from '..';
import {BaseMessageAction} from '../../../../components/molecules/BaseMessage';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea';
import {TMessage} from '../../../../types/messages';

import MDXDocs from './Docs.mdx';

export default {
    title: 'templates/ChatContent',
    component: ChatContent,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof ChatContent>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="600px" height="800px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const sampleActions = [
    {
        type: BaseMessageAction.Copy,
        onClick: () => console.log('Copy clicked'),
    },
    {
        type: BaseMessageAction.Edit,
        onClick: () => console.log('Edit clicked'),
    },
    {
        type: BaseMessageAction.Retry,
        onClick: () => console.log('Retry clicked'),
    },
    {
        type: BaseMessageAction.Like,
        onClick: () => console.log('Like clicked'),
    },
    {
        type: BaseMessageAction.Unlike,
        onClick: () => console.log('Unlike clicked'),
    },
    {
        type: BaseMessageAction.Delete,
        onClick: () => console.log('Delete clicked'),
    },
];

// Sample messages for stories
const sampleMessages: TMessage[] = [
    {
        id: '1',
        role: 'user',
        content: 'Hello! Can you help me with React?',
        timestamp: '2024-01-01T12:00:00Z',
        actions: sampleActions,
    },
    {
        id: '2',
        role: 'assistant',
        content: 'Of course! I would be happy to help you with React. What would you like to know?',
        timestamp: '2024-01-01T12:00:05Z',
        actions: sampleActions,
    },
    {
        id: '3',
        role: 'user',
        content: 'How do I use hooks?',
        timestamp: '2024-01-01T12:01:00Z',
        actions: sampleActions,
    },
    {
        id: '4',
        role: 'assistant',
        content:
            'React Hooks are functions that let you use state and other React features without writing a class. The most commonly used hooks are:\n\n1. **useState** - for managing component state\n2. **useEffect** - for side effects\n3. **useContext** - for consuming context\n\nWould you like examples of how to use any of these?',
        timestamp: '2024-01-01T12:01:10Z',
        actions: sampleActions,
    },
];

// Sample suggestions for empty state
const sampleSuggestions = [
    {id: '1', title: 'Explain React hooks'},
    {id: '2', title: 'How to use TypeScript with React?'},
    {id: '3', title: 'Best practices for component structure'},
    {id: '4', title: 'State management options'},
];

export const Playground: Story = {
    args: {
        view: 'empty',
        emptyContainerProps: {
            image: (
                <Icon
                    data={CircleInfo}
                    size={120}
                    style={{color: 'var(--g-color-text-complementary)'}}
                />
            ),
            title: 'Welcome to AI Chat',
            description: 'Start a conversation or choose a suggestion below',
            suggestionTitle: "Don't know where to start? Try this:",
            suggestions: sampleSuggestions,
            onSuggestionClick: (content, id) => {
                console.log('Suggestion clicked:', content, id);
            },
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            bodyProps: {
                placeholder: 'Type your message...',
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const EmptyState: Story = {
    args: {
        view: 'empty',
        emptyContainerProps: {
            title: 'Welcome to AI Assistant',
            description:
                'I can help you with coding questions, explain concepts, and assist with your development tasks.',
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            bodyProps: {
                placeholder: 'Ask me anything...',
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const EmptyStateWithSuggestions: Story = {
    args: {
        view: 'empty',
        emptyContainerProps: {
            image: (
                <Icon
                    data={CircleInfo}
                    size={100}
                    style={{color: 'var(--g-color-text-complementary)'}}
                />
            ),
            title: 'AI Development Assistant',
            description: 'Ask questions, get code suggestions, or explore best practices.',
            suggestionTitle: 'Popular topics:',
            suggestions: sampleSuggestions,
            onSuggestionClick: (content, id) => {
                console.log('Suggestion clicked:', content, id);
            },
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const ChatStateWithMessages: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: sampleMessages,
            showTimestamp: true,
            showAvatar: false,
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            bodyProps: {
                placeholder: 'Type your message...',
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const ChatStateWithActionsOnHover: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: sampleMessages,
            showTimestamp: true,
            showActionsOnHover: true,
            showAvatar: true,
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const WithFullPromptInput: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: sampleMessages.slice(0, 2),
        },
        promptInputProps: {
            view: 'full',
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            headerProps: {
                showContextIndicator: true,
                contextIndicatorProps: {
                    type: 'number',
                    usedContext: 3,
                    maxContext: 10,
                },
            },
            footerProps: {
                showSettings: true,
                showAttachment: true,
                onSettingsClick: () => console.log('Settings clicked'),
                onAttachmentClick: () => console.log('Attachment clicked'),
            },
            bodyProps: {
                placeholder: 'Type your message...',
                minRows: 3,
            },
            topPanel: {
                isOpen: true,
                children: <SwapArea />,
            },
            bottomPanel: {
                isOpen: true,
                children: <SwapArea />,
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const WithStreamingState: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: sampleMessages,
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            onCancel: async () => {
                console.log('Cancelled');
            },
            isStreaming: true,
            disabled: false,
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const WithDisabledInput: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: sampleMessages,
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
            disabled: true,
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};

export const Interactive: Story = {
    render: () => {
        const [view, setView] = useState<'empty' | 'chat'>('empty');
        const [messages, setMessages] = useState<TMessage[]>([]);

        const handleSend = async (data: {content: string}) => {
            // Add user message
            const userMessage: TMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);
            setView('chat');

            // Simulate assistant response
            setTimeout(() => {
                const assistantMessage: TMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `I received your message: "${data.content}". How can I help you further?`,
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }, 1000);
        };

        const handleSuggestionClick = (content: string) => {
            handleSend({content});
        };

        return (
            <ChatContent
                view={view}
                emptyContainerProps={{
                    title: 'Welcome to AI Chat',
                    description: 'Start a conversation or choose a suggestion below',
                    suggestionTitle: 'Try asking:',
                    suggestions: sampleSuggestions,
                    onSuggestionClick: handleSuggestionClick,
                }}
                messageListProps={{
                    messages,
                    showTimestamp: true,
                }}
                promptInputProps={{
                    onSend: handleSend,
                    bodyProps: {
                        placeholder: 'Type your message...',
                    },
                }}
                disclaimerProps={{
                    text: 'AI-generated, for reference only',
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

export const LongConversation: Story = {
    args: {
        view: 'chat',
        messageListProps: {
            messages: [
                ...sampleMessages,
                {
                    id: '5',
                    role: 'user',
                    content: 'Can you show me an example?',
                    timestamp: '2024-01-01T12:02:00Z',
                    actions: sampleActions,
                },
                {
                    id: '6',
                    role: 'assistant',
                    content: `Here's a simple useState example:

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

This component maintains a count state and updates it when the button is clicked.`,
                    timestamp: '2024-01-01T12:02:05Z',
                    actions: sampleActions,
                },
                {
                    id: '7',
                    role: 'user',
                    content: 'What about useEffect?',
                    timestamp: '2024-01-01T12:03:00Z',
                    actions: sampleActions,
                },
                {
                    id: '8',
                    role: 'assistant',
                    content: `useEffect is used for side effects. Here's an example:

\`\`\`tsx
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []); // Empty array means run once on mount

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
\`\`\``,
                    timestamp: '2024-01-01T12:03:10Z',
                    actions: sampleActions,
                },
            ],
            showTimestamp: true,
            showActionsOnHover: true,
        },
        promptInputProps: {
            onSend: async (data) => {
                console.log('Sending message:', data.content);
            },
        },
        disclaimerProps: {
            text: 'AI-generated, for reference only',
        },
    },
    decorators: defaultDecorators,
};
