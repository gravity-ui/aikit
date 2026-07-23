/* eslint-disable no-console */
import React, {useState} from 'react';

import {Gear, Star} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import type {
    ChatStatus,
    ChatType,
    TAssistantMessage,
    TChatMessage,
    TSubmitData,
} from '../../../../../types';
import {BaseMessageActionType} from '../../../../../types/messages';
import type {ActionPopupContext, DefaultMessageAction} from '../../../../../types/messages';
import {FeedbackForm} from '../../../../molecules/FeedbackForm';

import {type Story, defaultDecorators, mockChatMessages, mockChats, mockMessages} from './shared';

/**
 * Static additional actions for Header - extracted outside component
 * to prevent creating new array on each render
 */
const headerAdditionalActionsConfig = [
    {
        icon: <Icon data={Gear} size={16} />,
        label: 'Settings',
        onClick: () => console.log('Settings clicked'),
        view: 'flat' as const,
    },
    {
        icon: <Icon data={Star} size={16} />,
        label: 'Favorites',
        onClick: () => console.log('Favorites clicked'),
        view: 'flat' as const,
    },
];

/**
 * Static actions for user messages with custom "Add to favorites" action
 */
const customUserActions = [
    {
        actionType: 'copy',
        onClick: () => console.log('Copy user message'),
    },
    {
        actionType: 'edit',
        onClick: () => console.log('Edit user message'),
    },
    {
        actionType: 'custom',
        icon: <Icon data={Star} size={16} />,
        label: 'Add to favorites',
        onClick: () => console.log('Add user message to favorites'),
    },
];

/**
 * Static actions for assistant messages with custom "Add to favorites" action
 */
const customAssistantActions = [
    {
        actionType: 'copy',
        onClick: () => console.log('Copy assistant message'),
    },
    {
        actionType: 'like',
        onClick: () => console.log('Like assistant message'),
    },
    {
        actionType: 'dislike',
        onClick: () => console.log('Dislike assistant message'),
    },
    {
        actionType: 'custom',
        icon: <Icon data={Star} size={16} />,
        label: 'Add to favorites',
        onClick: () => console.log('Add assistant message to favorites'),
    },
];

/**
 * Add custom actions to messages based on role
 * @param messages - Array of messages
 * @returns Array of messages with custom actions added
 */
const addCustomActionsToMessages = (messages: TChatMessage[]): TChatMessage[] => {
    return messages.map((msg) => ({
        ...msg,
        actions: msg.role === 'user' ? customUserActions : customAssistantActions,
    }));
};

/**
 * With Additional Actions
 * Demonstrates passing additional actions to Header and custom actions to BaseMessage
 */
export const WithAdditionalActions: Story = {
    args: {
        messages: mockMessages,
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        showNewChat: true,
        showActionsOnHover: true,
    },
    render: (args) => {
        const initialChat = mockChats[0];
        const [messages, setMessages] = useState<TChatMessage[]>(() =>
            addCustomActionsToMessages(mockChatMessages[initialChat.id] || []),
        );
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [activeChat, setActiveChat] = useState<ChatType | null>(initialChat);

        const handleSendMessage = async (data: TSubmitData) => {
            const timestamp = Date.now();
            const userMessageId = `user-${timestamp}`;
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
                actions: customUserActions,
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus('streaming');

            // Simulate response
            await new Promise((resolve) => setTimeout(resolve, 500));

            const assistantMessageId = `assistant-${timestamp + 1}`;
            const assistantMessage: TChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: `Response to: "${data.content}". This message demonstrates custom actions including a "Add to favorites" button with a star icon.`,
                timestamp: new Date().toISOString(),
                actions: customAssistantActions,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStatus('ready');
        };

        const handleSelectChat = (chat: ChatType) => {
            setActiveChat(chat);
            const chatMessages = mockChatMessages[chat.id] || [];
            setMessages(addCustomActionsToMessages(chatMessages));
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
                messages={messages}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onCancel={handleCancel}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateChat}
                status={status}
                headerProps={{
                    additionalActions: headerAdditionalActionsConfig,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

const headerMenuItemsConfig = [
    {
        id: 'settings',
        label: 'Settings',
        onClick: () => console.log('Settings clicked'),
    },
    {
        id: 'export',
        label: 'Export chat',
        onClick: () => console.log('Export clicked'),
    },
];

/**
 * With Header overflow menu (menuItems)
 */
export const WithHeaderMenu: Story = {
    args: {
        messages: mockMessages,
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        showNewChat: true,
    },
    render: (args) => {
        const initialChat = mockChats[0];
        const [messages, setMessages] = useState<TChatMessage[]>(
            () => mockChatMessages[initialChat.id] || [],
        );
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [activeChat, setActiveChat] = useState<ChatType | null>(initialChat);

        const handleSendMessage = async (data: TSubmitData) => {
            const timestamp = Date.now();
            const userMessage: TChatMessage = {
                id: `user-${timestamp}`,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 300));
            setMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${timestamp + 1}`,
                    role: 'assistant',
                    content: `Response to: "${data.content}"`,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onCancel={async () => setStatus('ready')}
                onSelectChat={(chat) => {
                    setActiveChat(chat);
                    setMessages(mockChatMessages[chat.id] || []);
                }}
                onCreateChat={() => {
                    setActiveChat(null);
                    setMessages([]);
                }}
                status={status}
                headerProps={{
                    menuItems: headerMenuItemsConfig,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * Like / Dislike actions with local rating state.
 * Only like and dislike actions; rating toggles on repeated click (like → clear, dislike → clear).
 */
export const WithLikeDislikeActions: Story = {
    args: {
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        showNewChat: true,
        showActionsOnHover: true,
    },
    render: (args) => {
        const initialChat = mockChats[0];
        const [messages, setMessages] = useState<TChatMessage[]>(
            () => mockChatMessages[initialChat.id] || [],
        );
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [activeChat, setActiveChat] = useState<ChatType | null>(initialChat);

        const assistantActions = [
            {
                type: BaseMessageActionType.Like,
                onClick: (message: TAssistantMessage) => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === message.id
                                ? {
                                      ...m,
                                      userRating:
                                          (m as TAssistantMessage).userRating === 'like'
                                              ? undefined
                                              : ('like' as const),
                                  }
                                : m,
                        ),
                    );
                },
            },
            {
                type: BaseMessageActionType.Dislike,
                onClick: (message: TAssistantMessage) => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === message.id
                                ? {
                                      ...m,
                                      userRating:
                                          (m as TAssistantMessage).userRating === 'dislike'
                                              ? undefined
                                              : ('dislike' as const),
                                  }
                                : m,
                        ),
                    );
                },
            },
        ];

        const handleSendMessage = async (data: TSubmitData) => {
            const timestamp = Date.now();
            const userMessageId = `user-${timestamp}`;
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus('streaming');

            await new Promise((resolve) => setTimeout(resolve, 500));

            const assistantMessageId = `assistant-${timestamp + 1}`;
            const assistantMessage: TChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: `Response to: "${data.content}". Use like/dislike below — they toggle on second click.`,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStatus('ready');
        };

        const handleSelectChat = (chat: ChatType) => {
            setActiveChat(chat);
            setMessages(mockChatMessages[chat.id] || []);
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
                messages={messages}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onCancel={handleCancel}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateChat}
                status={status}
                messageListConfig={{
                    assistantActions,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithRatingBlock: Story = {
    render: () => {
        const [messages, setMessages] = useState<TChatMessage[]>([
            {
                id: '1',
                role: 'user',
                timestamp: new Date().toISOString(),
                content:
                    'I am ready to create a virtual machine `my-cheap-vm` with the following characteristics: Catalog: auxiliary, Availability zone: ru-central1-a, Platform: Intel Ice Lake.',
            },
            {
                id: '2',
                role: 'assistant',
                timestamp: new Date().toISOString(),
                content: 'Virtual machine my-cheap-vm has been successfully created.',
            },
        ]);

        const [rating, setRating] = useState<number | undefined>(undefined);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const newMessage: TChatMessage = {
                id: String(messages.length + 1),
                role: 'user',
                timestamp: new Date().toISOString(),
                content: data.content,
            };

            setMessages((prev) => [...prev, newMessage]);
            setStatus('streaming');

            setTimeout(() => {
                const assistantResponse: TChatMessage = {
                    id: String(messages.length + 2),
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    content: `Response to: "${data.content}"`,
                };
                setMessages((prev) => [...prev, assistantResponse]);
                setStatus('ready');
            }, 1000);
        };

        const handleRatingChange = (newRating: number) => {
            setRating(newRating);
            console.log('Rating changed:', newRating);
        };

        return (
            <ChatContainer
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
                messageListConfig={{
                    ratingBlockProps: {
                        title:
                            rating && rating <= 2 ? (
                                <>
                                    What went wrong?{' '}
                                    <a href="#feedback" onClick={(e) => e.preventDefault()}>
                                        Go to survey
                                    </a>
                                </>
                            ) : (
                                'Rate the assistant response:'
                            ),
                        value: rating,
                        onChange: handleRatingChange,
                        visible: status === 'ready' && messages.length > 0,
                    },
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithRatingBlockDynamicScenarios: Story = {
    render: () => {
        const [messages, setMessages] = useState<TChatMessage[]>([
            {
                id: '1',
                role: 'user',
                timestamp: new Date().toISOString(),
                content: 'Create a virtual machine with 2 cores and 4GB RAM',
            },
            {
                id: '2',
                role: 'assistant',
                timestamp: new Date().toISOString(),
                content:
                    'Virtual machine has been successfully created with the requested specifications.',
            },
        ]);

        const [rating, setRating] = useState<number | undefined>(undefined);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            // Reset rating on new conversation
            setRating(undefined);

            const newMessage: TChatMessage = {
                id: String(messages.length + 1),
                role: 'user',
                timestamp: new Date().toISOString(),
                content: data.content,
            };

            setMessages((prev) => [...prev, newMessage]);
            setStatus('streaming');

            setTimeout(() => {
                const assistantResponse: TChatMessage = {
                    id: String(messages.length + 2),
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    content: `I've processed your request: "${data.content}". The task has been completed successfully.`,
                };
                setMessages((prev) => [...prev, assistantResponse]);
                setStatus('ready');
            }, 1500);
        };

        const handleRatingChange = (newRating: number) => {
            setRating(newRating);
            console.log('Rating changed:', newRating);
        };

        // Dynamic title based on rating
        const getRatingTitle = (): React.ReactNode => {
            if (!rating) {
                return 'Rate the assistant response:';
            }

            if (rating <= 2) {
                return (
                    <>
                        What went wrong?{' '}
                        <a
                            href="https://forms.example.com/feedback"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                console.log('Survey link clicked');
                            }}
                        >
                            Go to survey
                        </a>
                    </>
                );
            }

            if (rating === 3) {
                return 'Thank you for your feedback. How can we improve?';
            }

            return 'Thank you for your positive feedback!';
        };

        return (
            <ChatContainer
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
                messageListConfig={{
                    ratingBlockProps: {
                        title: getRatingTitle(),
                        value: rating,
                        onChange: handleRatingChange,
                        // Only visible when conversation is complete and ready
                        visible: status === 'ready' && messages.length >= 2,
                    },
                }}
                headerProps={{
                    title: 'Rating Block Dynamic Scenarios Demo',
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithActionPopup: Story = {
    render: () => {
        const [messages, setMessages] = useState<TChatMessage[]>([
            {
                id: '1',
                role: 'user',
                content: 'What is machine learning?',
                timestamp: new Date(Date.now() - 120000).toISOString(),
            },
            {
                id: '2',
                role: 'assistant',
                content:
                    'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
                timestamp: new Date(Date.now() - 60000).toISOString(),
            },
        ]);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus('streaming');

            await new Promise((resolve) => setTimeout(resolve, 500));

            const assistantMessageId = (Date.now() + 1).toString();
            const assistantMessage: TChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: `Response to: "${data.content}"`,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStatus('ready');
        };

        const assistantActions: DefaultMessageAction<TAssistantMessage>[] = [
            {
                type: BaseMessageActionType.Copy,
                onClick: (message) => {
                    const content =
                        typeof message.content === 'string'
                            ? message.content
                            : JSON.stringify(message.content);
                    navigator.clipboard.writeText(content);
                    console.log('Copied message:', message.id);
                },
            },
            {
                type: BaseMessageActionType.Like,
                onClick: (message) => {
                    console.log('Like message:', message.id);
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === message.id && msg.role === 'assistant'
                                ? {...msg, userRating: 'like' as const}
                                : msg,
                        ),
                    );
                },
            },
            {
                type: BaseMessageActionType.Dislike,
                onClick: (message) => {
                    console.log('Dislike message:', message.id);
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === message.id && msg.role === 'assistant'
                                ? {...msg, userRating: 'dislike' as const}
                                : msg,
                        ),
                    );
                },
                popup: {
                    title: 'What went wrong?',
                    placement: 'bottom-start',
                    getContent: (
                        message: TAssistantMessage,
                        context: ActionPopupContext,
                    ): React.ReactNode => {
                        const {setContent, setTitle, setSubtitle, closePopup} = context;

                        const handleSubmit = (reasons: string[], comment: string) => {
                            console.log('Feedback submitted:', {
                                messageId: message.id,
                                reasons,
                                comment,
                            });
                            setTitle(undefined);
                            setSubtitle(undefined);
                            setContent(
                                <div>
                                    <p style={{margin: 0}}>Thank you for your feedback!</p>
                                </div>,
                            );
                            setTimeout(() => {
                                closePopup();
                            }, 2000);
                        };

                        return (
                            <FeedbackForm
                                options={[
                                    {id: 'no-answer', label: 'No answer'},
                                    {id: 'wrong-info', label: 'Wrong info'},
                                    {id: 'not-helpful', label: 'Not helpful'},
                                    {id: 'other', label: 'Other'},
                                ]}
                                commentPlaceholder="Tell us more..."
                                submitLabel="Submit"
                                onSubmit={handleSubmit}
                                qa="feedback-form"
                            />
                        );
                    },
                },
            },
        ];

        return (
            <ChatContainer
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
                messageListConfig={{
                    assistantActions,
                }}
                headerProps={{
                    title: 'Action Popup Demo',
                }}
            />
        );
    },
    decorators: defaultDecorators,
};
