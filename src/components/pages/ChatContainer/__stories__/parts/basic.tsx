/* eslint-disable no-console */
import {useState} from 'react';

import {Sparkles} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../../../types';

import {
    type Story,
    addActionsToMessages,
    createMessageActions,
    defaultDecorators,
    mockChatMessages,
    mockChats,
    mockMessages,
    mockSuggestions,
} from './shared';

/**
 * Playground story for interactive testing
 */
export const Playground: Story = {
    args: {
        messages: [],
        chats: mockChats,
        showHistory: true,
        showNewChat: true,
        showFolding: false,
        showClose: false,
        welcomeConfig: {
            title: 'Welcome to AI Chat',
            description: 'Start a conversation by typing a message or selecting a suggestion.',
            suggestionTitle: 'Try asking:',
            suggestions: mockSuggestions,
        },
        showActionsOnHover: true,
    },
    render: (args) => {
        const initialChat = mockChats[0];
        const [messages, setMessages] = useState<TChatMessage[]>(
            addActionsToMessages(mockChatMessages[initialChat.id] || []),
        );
        const [status, setStatus] = useState<ChatStatus>(args.status || 'ready');
        const [activeChat, setActiveChat] = useState<ChatType | null>(initialChat);

        const [foldingState, setFoldingState] = useState<'collapsed' | 'opened'>('opened');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
                actions: createMessageActions(Date.now().toString(), 'user'),
            };

            setMessages((prev) => [...prev, userMessage]);

            // Simulate streaming
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 500));

            const assistantMessageId = (Date.now() + 1).toString();
            const assistantMessage: TChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: `This is a mock response to: "${data.content}". In a real application, this would be a streamed response from an AI model.`,
                timestamp: new Date().toISOString(),
                actions: createMessageActions(assistantMessageId, 'assistant'),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStatus('ready');
        };

        const handleSelectChat = (chat: ChatType) => {
            setActiveChat(chat);
            // Load messages for selected chat
            const chatMessages = mockChatMessages[chat.id] || [];
            setMessages(addActionsToMessages(chatMessages));
        };

        const handleCreateChat = () => {
            setActiveChat(null);
            setMessages([]);
        };

        const handleCancel = async () => {
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                headerProps={{
                    foldingState,
                }}
                messages={messages}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onCancel={handleCancel}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateChat}
                onFold={setFoldingState}
                status={status}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * Empty state with welcome screen
 */
export const EmptyState: Story = {
    args: {
        messages: [],
        welcomeConfig: {
            image: <Icon data={Sparkles} size={48} />,
            title: 'Welcome to AI Chat',
            description: 'Start a conversation by typing a message or selecting a suggestion.',
            suggestionTitle: 'Try asking:',
            suggestions: mockSuggestions,
            showDefaultTitle: false,
            showDefaultDescription: false,
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
 * State with messages
 */
export const WithMessages: Story = {
    args: {
        messages: mockMessages,
        chats: mockChats,
        activeChat: mockChats[0],
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(
            addActionsToMessages(args.messages || []),
        );

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessageId = Date.now().toString();
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        return <ChatContainer {...args} messages={messages} onSendMessage={handleSendMessage} />;
    },
    decorators: defaultDecorators,
};

/**
 * With streaming
 */
export const WithStreaming: Story = {
    args: {
        messages: mockMessages,
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(
            addActionsToMessages(args.messages || []),
        );
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessageId = Date.now().toString();
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Simulate streaming
            setStatus('streaming');

            const assistantMessageId = (Date.now() + 1).toString();
            const fullResponse =
                'This is a simulated streaming response. In a real application, this text would appear word by word as it streams from the AI model. Streaming provides a better user experience for long responses.';

            // Add empty message
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: '',
                    actions: createMessageActions(assistantMessageId, 'assistant'),
                },
            ]);

            // Simulate word-by-word streaming with a streaming_loading pause in the middle
            const words = fullResponse.split(' ');
            const pauseIndex = Math.floor(words.length / 2);

            for (let i = 0; i < words.length; i++) {
                // Pause streaming at the midpoint: switch to streaming_loading for 5 seconds
                if (i === pauseIndex) {
                    setStatus('streaming_loading');
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    setStatus('streaming');
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
                const currentText = words.slice(0, i + 1).join(' ');
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessageId
                            ? {
                                  ...msg,
                                  content: currentText,
                              }
                            : msg,
                    ),
                );
            }

            setStatus('ready');
        };

        const handleCancel = async () => {
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                onCancel={handleCancel}
                status={status}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * With history
 */
export const WithHistory: Story = {
    args: {
        messages: mockMessages,
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(
            addActionsToMessages(args.messages || []),
        );
        const [chats, setChats] = useState<ChatType[]>(args.chats || []);
        const [activeChat, setActiveChat] = useState<ChatType | null>(args.activeChat || null);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessageId = Date.now().toString();
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        const handleSelectChat = (chat: ChatType) => {
            setActiveChat(chat);
            // Load messages for selected chat
            const chatMessages = mockChatMessages[chat.id] || [];
            setMessages(addActionsToMessages(chatMessages));
        };

        const handleCreateChat = () => {
            const newChat: ChatType = {
                id: Date.now().toString(),
                name: 'New Chat',
                createTime: new Date().toISOString(),
            };
            setChats((prev) => [newChat, ...prev]);
            setActiveChat(newChat);
            setMessages([]);
        };

        const handleDeleteChat = (chat: ChatType) => {
            setChats((prev) => prev.filter((c) => c.id !== chat.id));
            if (activeChat?.id === chat.id) {
                setActiveChat(null);
                setMessages([]);
            }
            return Promise.resolve();
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                chats={chats}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateChat}
                onDeleteChat={handleDeleteChat}
                headerProps={{
                    onHistoryToggle: (open) => console.log(`onHistoryToggle: ${open}`),
                }}
            />
        );
    },
    decorators: defaultDecorators,
};
