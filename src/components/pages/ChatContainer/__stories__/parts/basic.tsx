/* eslint-disable no-console */
import {useCallback, useEffect, useRef, useState} from 'react';

import {Sparkles} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {ChatContainer} from '../..';
import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../../../types';

import {
    type Story,
    addActionsToMessages,
    createMessageActions,
    createMessageId,
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
            const userMessageId = createMessageId('user');
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                timestamp: new Date().toISOString(),
                actions: createMessageActions(userMessageId, 'user'),
            };

            setMessages((prev) => [...prev, userMessage]);

            // Simulate streaming
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 500));

            const assistantMessageId = createMessageId('assistant');
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
            const userMessageId = createMessageId('user');
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Simulate streaming
            setStatus('streaming');

            const assistantMessageId = createMessageId('assistant');
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
 * Generates a long message history so the virtualized list has enough rows to window.
 */
const createLargeHistory = (count: number): TChatMessage[] =>
    Array.from({length: count}, (_, i) => {
        const id = `seed-${i}`;
        const isUser = i % 2 === 0;
        return isUser
            ? {
                  id,
                  role: 'user' as const,
                  content: `User message #${i + 1}: can you help me with task ${i + 1}?`,
                  timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
                  actions: createMessageActions(id, 'user'),
              }
            : {
                  id,
                  role: 'assistant' as const,
                  content: `Assistant response #${i + 1}: sure, here is a detailed answer for task ${i + 1}. ${'More context. '.repeat((i % 5) + 1)}`,
                  timestamp: new Date(Date.now() - (count - i) * 60000 + 30000).toISOString(),
                  actions: createMessageActions(id, 'assistant'),
              };
    });

/**
 * Virtualized message list with streaming.
 *
 * Mirrors `WithStreaming`, but seeds a large history and enables `messageListConfig.virtualized`
 * so react-window renders only a window of rows. The list stays pinned to the bottom while the
 * assistant response streams in word by word (unless the user scrolls up).
 */
export const WithVirtualizedStreaming: Story = {
    args: {
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(() => createLargeHistory(200));
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessageId = createMessageId('user');
            const userMessage: TChatMessage = {
                id: userMessageId,
                role: 'user',
                content: data.content,
                actions: createMessageActions(userMessageId, 'user'),
            };
            setMessages((prev) => [...prev, userMessage]);

            // Simulate streaming
            setStatus('streaming');

            const assistantMessageId = createMessageId('assistant');
            const fullResponse =
                'This is a simulated streaming response inside a virtualized list. As the text streams in word by word, the windowed list keeps a constant number of DOM nodes while staying pinned to the bottom.';

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

            // Simulate word-by-word streaming
            const words = fullResponse.split(' ');
            for (let i = 0; i < words.length; i++) {
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
                messageListConfig={{virtualized: true}}
            />
        );
    },
    decorators: defaultDecorators,
};

/** Total wall-clock duration of the simulated streaming response in the comparison story. */
const COMPARISON_STREAM_DURATION_MS = 20000;

const COMPARISON_RESPONSE = (
    'This is a simulated streaming response that runs for about twenty seconds so you can ' +
    'compare the plain and virtualized rendering paths under a long stream. As the text streams ' +
    'in word by word, the list stays pinned to the bottom unless you scroll up, and scrolling to ' +
    'the top loads older messages without making the viewport jump. '
).repeat(4);

/** Numbered seed message so the load-previous handler can derive the next older batch by id. */
const createNumberedMessage = (num: number): TChatMessage => {
    const id = `seed-${num}`;
    const isUser = num % 2 === 1;
    return isUser
        ? {
              id,
              role: 'user',
              content: `User message ${num}`,
              actions: createMessageActions(id, 'user'),
          }
        : {
              id,
              role: 'assistant',
              content: `Assistant response ${num}. ${'A longer paragraph that makes the message tall enough to scroll within it. '.repeat(4)}`,
              actions: createMessageActions(id, 'assistant'),
          };
};

/**
 * One side of {@link VirtualizationComparison}. Seeds a numbered history, prepends 10 older
 * messages whenever the load-more trigger scrolls into view, and auto-starts a single ~20s
 * streaming response on mount so both the load and streaming behaviors are visible without typing.
 */
const ChatVirtualizationPanel = ({virtualized, title}: {virtualized: boolean; title: string}) => {
    const [messages, setMessages] = useState<TChatMessage[]>(() =>
        Array.from({length: 20}, (_, i) => createNumberedMessage(31 + i)),
    );
    const [status, setStatus] = useState<ChatStatus>('ready');
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef(false);
    const startedRef = useRef(false);

    const streamResponse = useCallback(async () => {
        setStatus('streaming');

        const assistantMessageId = createMessageId('assistant');
        setMessages((prev) => [
            ...prev,
            {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                actions: createMessageActions(assistantMessageId, 'assistant'),
            },
        ]);

        const words = COMPARISON_RESPONSE.split(' ');
        const delay = Math.max(20, Math.round(COMPARISON_STREAM_DURATION_MS / words.length));

        for (let i = 0; i < words.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            const currentText = words.slice(0, i + 1).join(' ');
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessageId ? {...msg, content: currentText} : msg,
                ),
            );
        }

        setStatus('ready');
    }, []);

    const handleSendMessage = useCallback(
        async (data: TSubmitData) => {
            const userMessageId = createMessageId('user');
            setMessages((prev) => [
                ...prev,
                {
                    id: userMessageId,
                    role: 'user',
                    content: data.content,
                    actions: createMessageActions(userMessageId, 'user'),
                },
            ]);
            await streamResponse();
        },
        [streamResponse],
    );

    const handleLoadPrevious = useCallback(() => {
        if (loadingRef.current || !hasMore) {
            return;
        }
        loadingRef.current = true;

        setTimeout(() => {
            setMessages((prev) => {
                const firstNum = parseInt(prev[0]?.id?.replace('seed-', '') ?? '1', 10) || 1;
                const startNum = Math.max(1, firstNum - 10);
                const count = firstNum - startNum;
                if (count <= 0) {
                    setHasMore(false);
                    return prev;
                }
                const older = Array.from({length: count}, (_, i) =>
                    createNumberedMessage(startNum + i),
                );
                if (startNum <= 1) {
                    setHasMore(false);
                }
                return [...older, ...prev];
            });
            loadingRef.current = false;
        }, 600);
    }, [hasMore]);

    const handleCancel = useCallback(async () => {
        setStatus('ready');
    }, []);

    // Auto-start one streaming response on mount so the ~20s stream is visible without typing.
    useEffect(() => {
        if (startedRef.current) {
            return;
        }
        startedRef.current = true;
        streamResponse();
    }, [streamResponse]);

    return (
        <div style={{flex: 1, minWidth: 0}}>
            <Text variant="subheader-1" as="div">
                {virtualized ? 'Virtualized' : 'Plain'} — {title}
            </Text>
            <div style={{height: '520px'}}>
                <ChatContainer
                    messages={messages}
                    status={status}
                    onSendMessage={handleSendMessage}
                    onCancel={handleCancel}
                    showActionsOnHover
                    messageListConfig={{
                        virtualized,
                        hasPreviousMessages: hasMore,
                        onLoadPreviousMessages: handleLoadPrevious,
                    }}
                />
            </div>
        </div>
    );
};

/**
 * Side-by-side comparison of the plain and virtualized rendering paths inside ChatContainer.
 *
 * Both panels seed a long history, auto-start a ~20s streaming response, and load older messages
 * when scrolled to the top - so the windowed (virtualized) path can be compared against the plain
 * one under streaming and pagination at the same time.
 */
export const VirtualizationComparison: Story = {
    render: () => (
        <div style={{display: 'flex', gap: 16, width: '1040px', height: '560px'}}>
            <ChatVirtualizationPanel virtualized={false} title="loads + ~20s streaming" />
            <ChatVirtualizationPanel virtualized title="loads + ~20s streaming" />
        </div>
    ),
};

/**
 * Markdown links rendered in assistant messages open in a new tab.
 */
export const WithMarkdownLinksInNewTab: Story = {
    args: {
        messages: [
            {
                id: 'assistant-link-1',
                role: 'assistant',
                content:
                    'Here are markdown links: [external docs](https://gravity-ui.com) and [local section](#local-section).',
            },
        ],
        openMarkdownLinksInNewTab: true,
    },
    render: (args) => <ChatContainer {...args} onSendMessage={async () => {}} />,
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
