import React, {useState} from 'react';

import {Sparkles} from '@gravity-ui/icons';
import {Button, Flex, Icon} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {useChatActivity} from '../../../../../hooks/useChatActivity';
import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../../../types';
import {type ChatGeneration, createChatActivityStore} from '../../../../../utils/chatActivity';

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
 * With loading state
 */
export const LoadingState: Story = {
    args: {
        messages: addActionsToMessages(mockMessages.slice(0, -1)),
        status: 'submitted',
        showActionsOnHover: true,
    },
    render: (args) => {
        return <ChatContainer {...args} onSendMessage={async () => {}} />;
    },
    decorators: defaultDecorators,
};

/**
 * With error
 */
export const ErrorState: Story = {
    args: {
        messages: addActionsToMessages(mockMessages.slice(0, -1)),
        status: 'error',
        error: new Error('Failed to send message. Please try again.'),
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);

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
 * Full example with realistic streaming via fetch API
 */
export const FullStreamingExample: Story = {
    args: {
        messages: [],
        chats: mockChats,
        activeChat: mockChats[0],
        showHistory: true,
        showNewChat: true,
        welcomeConfig: {
            image: <Icon data={Sparkles} size={48} />,
            title: 'AI Streaming Chat',
            description: 'Experience real-time streaming responses',
            suggestionTitle: 'Try these prompts:',
            suggestions: mockSuggestions,
        },
        showActionsOnHover: true,
    },
    render: (args) => {
        const initialChat = mockChats[0];
        const [messages, setMessages] = useState<TChatMessage[]>(
            addActionsToMessages(mockChatMessages[initialChat.id] || []),
        );
        const [activeChat, setActiveChat] = useState<ChatType | null>(initialChat);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [controller, setController] = useState<AbortController | null>(null);
        const isProcessingRef = React.useRef(false);

        const handleSendMessage = async (data: TSubmitData) => {
            if (
                isProcessingRef.current ||
                status === 'streaming' ||
                status === 'streaming_loading' ||
                status === 'submitted'
            ) {
                return;
            }

            isProcessingRef.current = true;

            // Add user message
            const timestamp = Date.now();
            const userMessageId = `user-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Show submitted state first
            setStatus('submitted');
            const abortController = new AbortController();
            setController(abortController);

            try {
                // In real app, this would be a fetch to API
                // const response = await fetch('/api/chat/stream', {
                //     method: 'POST',
                //     headers: {'Content-Type': 'application/json'},
                //     body: JSON.stringify({message: data.content}),
                //     signal: abortController.signal,
                // });

                // Simulate streaming for demo
                const assistantMessageId = `assistant-${timestamp + 1}-${Math.random().toString(36).substr(2, 9)}`;
                const fullResponse = `This is a detailed response to your question: "${data.content}"\n\nIn a production environment, this text would be streamed from an AI model in real-time. The streaming provides several benefits:\n\n1. **Better User Experience**: Users see the response as it's being generated\n2. **Lower Perceived Latency**: The wait feels shorter when content appears incrementally\n3. **Ability to Cancel**: Users can stop generation if they have enough information\n4. **Resource Efficiency**: Responses can be processed as they arrive\n\nThe implementation would use Server-Sent Events (SSE) or streaming fetch API to receive chunks of text from the backend, updating the message content in real-time.`;

                // Wait a bit before starting streaming
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Start streaming
                setStatus('streaming');

                // Create empty assistant message
                setMessages((prev) => [
                    ...prev,
                    {
                        id: assistantMessageId,
                        role: 'assistant',
                        content: ' ',
                        timestamp: new Date().toISOString(),
                        actions: createMessageActions(assistantMessageId, 'assistant'),
                    },
                ]);

                // Simulate word-by-word streaming
                const words = fullResponse.split(' ');
                for (let i = 0; i < words.length; i++) {
                    if (abortController.signal.aborted) {
                        break;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 50));
                    const currentText = words.slice(0, i + 1).join(' ');

                    setMessages((prev) => {
                        const assistantMessageExists = prev.some(
                            (msg) => msg.id === assistantMessageId,
                        );
                        if (!assistantMessageExists) {
                            return prev;
                        }
                        return prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content: currentText,
                                  }
                                : msg,
                        );
                    });
                }
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    // In real app, error handling would be here
                    // console.error('Streaming error:', error);
                }
            } finally {
                setStatus('ready');
                setController(null);
                isProcessingRef.current = false;
            }
        };

        const handleCancel = async () => {
            controller?.abort();
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
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * Embedded in page with tall content and streaming.
 * Chat is placed in a sidebar; main content has large height and is scrollable.
 * When long text streams in the chat, only the chat panel scrolls — the main page does not jump.
 */
export const EmbeddedInPageWithStreaming: Story = {
    args: {
        messages: [],
        showActionsOnHover: true,
        welcomeConfig: {
            title: 'Sidebar Chat',
            description: 'Send a message to see streaming. Only the chat area scrolls.',
            suggestionTitle: 'Try:',
            suggestions: [{id: '1', title: 'Stream a long response'}],
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
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

            setStatus('streaming');

            const assistantMessageId = (Date.now() + 1).toString();
            const fullResponse = [
                'This is a simulated long streaming response. When the chat is embedded in an application,',
                'the scroll logic must only scroll the chat container, not the main page.',
                'Using containerRef.scrollTo({ top: scrollHeight, behavior }) ensures that only the message list',
                'container scrolls to the bottom, so the main content stays in place and there is no jerking.',
                '',
                '**Before the fix**, scrollIntoView on the end element could scroll all scrollable ancestors',
                '(including the document), which caused the whole page to jump during streaming.',
                '',
                '**After the fix**, we explicitly scroll only the container element that holds the messages.',
                'The main content on the left can stay scrolled at any position while the chat streams.',
                '',
                'You can scroll the left column up or down and then send a message — only the chat panel',
                'will scroll to show the new content.',
            ].join('\n\n');

            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: '',
                    actions: createMessageActions(assistantMessageId, 'assistant'),
                },
            ]);

            const words = fullResponse.split(' ');
            for (let i = 0; i < words.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 80));
                const currentText = words.slice(0, i + 1).join(' ');
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessageId ? {...msg, content: currentText} : msg,
                    ),
                );
            }

            setStatus('ready');
        };

        const handleCancel = async () => {
            setStatus('ready');
        };

        const tallContent = Array.from({length: 30}, (_, i) => (
            <p key={i}>
                Main application content paragraph {i + 1}. This area has large height so the page
                is scrollable. When the chat on the right streams a long response, only the chat
                container should scroll — this column must not move.
            </p>
        ));

        return (
            <div
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: 24,
                        borderRight: '1px solid var(--g-color-line-generic, #e5e5e5)',
                    }}
                >
                    <h2 style={{marginTop: 0}}>Main content (tall, scrollable)</h2>
                    {tallContent}
                </div>
                <div
                    style={{
                        width: 420,
                        flexShrink: 0,
                        position: 'sticky',
                        top: 0,
                        alignSelf: 'flex-start',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    }}
                >
                    <ChatContainer
                        {...args}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onCancel={handleCancel}
                        status={status}
                    />
                </div>
            </div>
        );
    },
    decorators: [
        (Story) => (
            <div style={{minHeight: '100vh', overflow: 'visible'}}>
                <Story />
            </div>
        ),
    ],
};

/** Manually controlled requests make parallel and hidden-panel scenarios easy to reproduce. */
export const BackgroundActivity: Story = {
    args: {isMobile: false},
    render: (args) => {
        const [store] = useState(() =>
            createChatActivityStore({accountId: 'storybook', storage: null}),
        );
        const activity = useChatActivity(store);
        const requests = React.useRef(new Map<string, ChatGeneration>());
        const sequence = React.useRef(0);
        const [chats, setChats] = useState(mockChats.slice(0, 2));
        const [activeChat, setActiveChat] = useState<ChatType>(chats[0]);
        const [visible, setVisible] = useState(true);
        const [answers, setAnswers] = useState<Record<string, TChatMessage>>({});
        const answer = answers[activeChat.id];
        const start = () => {
            requests.current.set(activeChat.id, store.startGeneration(activeChat.id));
        };
        const finish = (chatId: string, withText: boolean) => {
            const request = requests.current.get(chatId);
            if (!request) {
                return;
            }
            if (withText) {
                const id = `answer-${++sequence.current}`;
                request.responseReceived(id);
                setAnswers((previous) => ({
                    ...previous,
                    [chatId]: {
                        id,
                        role: 'assistant',
                        content: `Response ${sequence.current} is ready.`,
                    },
                }));
            }
            request.finish();
            requests.current.delete(chatId);
        };
        return (
            <Flex direction="column" style={{height: '100%', gap: 'var(--g-spacing-3)'}}>
                <Flex style={{gap: 'var(--g-spacing-2)'}} wrap>
                    <Button onClick={start}>Start in selected chat</Button>
                    {chats.map((chat, index) => (
                        <Button key={chat.id} onClick={() => finish(chat.id, true)}>
                            Finish chat {index + 1}
                        </Button>
                    ))}
                    <Button onClick={() => finish(activeChat.id, false)}>Stop without text</Button>
                    <Button onClick={() => setVisible(!visible)}>
                        {visible ? 'Hide panel' : 'Show panel'}
                    </Button>
                </Flex>
                <div style={{flex: 1, minHeight: 0, display: visible ? undefined : 'none'}}>
                    <ChatContainer
                        {...args}
                        chats={chats}
                        activeChat={activeChat}
                        messages={answer ? [answer] : []}
                        status={activity.chats[activeChat.id]?.isGenerating ? 'submitted' : 'ready'}
                        chatActivity={{
                            store,
                            isPanelVisible: visible,
                            renderedResponseId: answer?.id,
                        }}
                        onSendMessage={async () => start()}
                        onSelectChat={setActiveChat}
                        onDeleteChat={async (chat) =>
                            setChats((previous) => previous.filter(({id}) => id !== chat.id))
                        }
                    />
                </div>
            </Flex>
        );
    },
    decorators: [
        (Story) => (
            <ContentWrapper
                width="min(600px, 100%)"
                height="calc(100vh - 32px)"
                boxSizing="border-box"
            >
                <Story />
            </ContentWrapper>
        ),
    ],
};
