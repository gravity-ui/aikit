import {useState} from 'react';

import {Sparkles} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import type {ChatStatus, TChatMessage, TSubmitData} from '../../../../../types';

import {type Story, defaultDecorators, mockSuggestions} from './shared';

/**
 * Empty state with text wrapping enabled
 * Demonstrates usage of wrapText prop for long suggestion titles
 */
export const EmptyStateWithTextWrap: Story = {
    args: {
        messages: [],
        welcomeConfig: {
            image: <Icon data={Sparkles} size={48} />,
            title: 'Welcome to AI Chat',
            description: 'Start a conversation by typing a message or selecting a suggestion.',
            suggestionTitle: 'Try these longer prompts:',
            suggestions: [
                {
                    id: '1',
                    title: 'Can you explain quantum computing in simple terms with practical examples?',
                },
                {
                    id: '2',
                    title: 'Write a creative and emotional poem about the beauty of nature in different seasons',
                },
                {
                    id: '3',
                    title: 'Help me understand and debug complex asynchronous JavaScript code patterns',
                },
            ],
            wrapText: true,
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
 * Empty state with custom React elements
 * Demonstrates usage of React elements for title and description
 */
export const EmptyStateWithCustomElements: Story = {
    args: {
        messages: [],
        welcomeConfig: {
            image: <Icon data={Sparkles} size={48} />,
            title: (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Icon data={Sparkles} size={24} />
                    <span>Welcome to AI Chat</span>
                </div>
            ),
            description: (
                <div>
                    <p style={{margin: '0 0 8px 0'}}>
                        Get started by selecting a suggestion below or typing your own message.
                    </p>
                    <strong>Available 24/7 for your questions</strong>
                </div>
            ),
            suggestionTitle: 'Try asking:',
            suggestions: mockSuggestions,
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
 * Empty state with centered alignment
 * Demonstrates usage of alignment prop in welcomeConfig
 */
export const EmptyStateWithCenteredAlignment: Story = {
    args: {
        messages: [],
        welcomeConfig: {
            image: <Icon data={Sparkles} size={48} />,
            title: 'Welcome to AI Chat',
            description: 'Start a conversation by typing a message or selecting a suggestion.',
            suggestionTitle: 'Try asking:',
            suggestions: mockSuggestions,
            alignment: {
                image: 'center',
                title: 'center',
                description: 'center',
            },
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
 * Hidden Title on Empty Chat
 * Demonstrates the hideTitleOnEmptyChat prop which hides the header title
 * and preview when the chat is empty (no messages)
 */
export const HiddenTitleOnEmpty: Story = {
    args: {
        messages: [],
        hideTitleOnEmptyChat: true,
        headerProps: {
            title: 'AI Chat Assistant',
            preview: <span>Beta</span>,
        },
        welcomeConfig: {
            title: 'Welcome to AI Assistant',
            description:
                'Ask me anything to get started. The title will appear after you send your first message.',
            suggestions: mockSuggestions,
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const timestamp = Date.now();
            const userMessage: TChatMessage = {
                id: `user-${timestamp}`,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus('submitted');

            // Simulate response after a short delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const assistantMessage: TChatMessage = {
                id: `assistant-${timestamp + 1}`,
                role: 'assistant',
                content: `This is a response to: "${data.content}"`,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                status={status}
            />
        );
    },
    decorators: defaultDecorators,
};
