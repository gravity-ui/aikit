/* eslint-disable no-console */
import React, {useState} from 'react';

import {Gear, Sparkles, Star} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ChatContainer} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import type {ChatType, TChatMessage, TSubmitData} from '../../../../types';

import MDXDocs from './Docs.mdx';

export default {
    title: 'pages/ChatContainer',
    component: ChatContainer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof ChatContainer>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper height="800px" width="600px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

// Mock data
const mockSuggestions = [
    {
        id: '1',
        title: 'Explain quantum computing in simple terms',
    },
    {
        id: '2',
        title: 'Write a poem about nature',
    },
    {
        id: '3',
        title: 'Help me debug my JavaScript code',
    },
    {
        id: '4',
        title: 'Summarize recent AI developments',
    },
];

const mockChats: ChatType[] = [
    {
        id: '1',
        name: 'Quantum Computing Discussion',
        createTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        lastMessage: 'Thanks for explaining quantum entanglement!',
    },
    {
        id: '2',
        name: 'Poetry Writing Session',
        createTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastMessage: 'That was a beautiful poem about autumn.',
    },
    {
        id: '3',
        name: 'Code Debugging Help',
        createTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        lastMessage: 'The bug was in the async function.',
    },
    {
        id: '4',
        name: 'AI News Summary',
        createTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        lastMessage: 'Thanks for the comprehensive summary!',
    },
];

/**
 * Mock messages for different chats
 * Each chat has its own conversation history
 * Keys correspond to chat IDs from mockChats
 */
const mockChatMessages: Record<string, TChatMessage[]> = {
    '1': [
        {
            id: '1-1',
            role: 'user',
            content: 'What is quantum computing?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
            id: '1-2',
            role: 'assistant',
            content:
                'Quantum computing is a revolutionary approach to computation that leverages the principles of quantum mechanics. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously through a phenomenon called superposition.\n\nKey concepts include:\n1. **Superposition**: Qubits can be in multiple states at once\n2. **Entanglement**: Qubits can be correlated in ways that classical bits cannot\n3. **Quantum Interference**: Used to amplify correct answers and cancel out wrong ones',
            timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
        },
        {
            id: '1-3',
            role: 'user',
            content: 'Can you explain quantum entanglement in simple terms?',
            timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
        },
        {
            id: '1-4',
            role: 'assistant',
            content:
                'Quantum entanglement is like having two magic coins that are mysteriously connected. When you flip one coin and it lands on heads, the other coin - no matter how far away - will instantly land on tails (or vice versa).\n\nIn quantum physics terms:\n- Two particles become "entangled" and share a quantum state\n- Measuring one particle instantly affects the other\n- This happens regardless of the distance between them\n- Einstein called it "spooky action at a distance"\n\nThis phenomenon is fundamental to quantum computing and quantum communication technologies.',
            timestamp: new Date(Date.now() - 1000 * 60 * 57).toISOString(),
        },
    ],
    '2': [
        {
            id: '2-1',
            role: 'user',
            content: 'Write a poem about autumn leaves',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: '2-2',
            role: 'assistant',
            content:
                "Golden whispers fall from trees,\nDancing softly on the breeze,\nCrimsons, ambers, russet bright,\nPainting pathways with their light.\n\nNature's canvas, rich and warm,\nBefore the coming winter storm,\nEach leaf a story, each one told,\nOf seasons passing, growing old.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 60000).toISOString(),
        },
        {
            id: '2-3',
            role: 'user',
            content: 'That was beautiful! Can you write one about winter snow?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 120000).toISOString(),
        },
        {
            id: '2-4',
            role: 'assistant',
            content:
                "Snowflakes drift from silent skies,\nBlankets white before our eyes,\nCrystal diamonds, soft and pure,\nWinter's gentle signature.\n\nFrosted windows, frozen streams,\nLandscapes wrapped in silver dreams,\nQuiet peace in cold embrace,\nNature sleeps in gentle grace.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 180000).toISOString(),
        },
    ],
    '3': [
        {
            id: '3-1',
            role: 'user',
            content:
                "I have a bug in my async function. It's not waiting for the promise to resolve.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
            id: '3-2',
            role: 'assistant',
            content:
                "Let's debug this step by step. The most common issues with async/await are:\n\n1. **Missing await keyword**: Make sure you're using `await` before the promise\n2. **Function not marked as async**: The function must be declared with `async` keyword\n3. **Promise not being returned**: Ensure the function returns a promise\n\nCan you share your code? Here's a common pattern:\n\n```javascript\nasync function fetchData() {\n  const result = await fetch('/api/data');\n  const data = await result.json();\n  return data;\n}\n```",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 60000).toISOString(),
        },
        {
            id: '3-3',
            role: 'user',
            content:
                'Oh! I forgot to mark the parent function as async. That was the issue. Thanks!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 120000).toISOString(),
        },
        {
            id: '3-4',
            role: 'assistant',
            content:
                "Great! That's a very common mistake. Remember: to use `await`, the containing function must be `async`. Also, if you're using `await` in a callback (like in `.map()` or `.forEach()`), make sure to make the callback function async too. Happy coding!",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 180000).toISOString(),
        },
    ],
    '4': [
        {
            id: '4-1',
            role: 'user',
            content: 'What are the latest developments in AI?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
        {
            id: '4-2',
            role: 'assistant',
            content:
                'Recent AI developments include:\n\n**Large Language Models**\n- More efficient training methods\n- Better reasoning capabilities\n- Multimodal models (text, image, audio)\n\n**Computer Vision**\n- Improved object detection and segmentation\n- Real-time video analysis\n- 3D reconstruction from 2D images\n\n**AI Safety**\n- Constitutional AI and alignment research\n- Better interpretability tools\n- Red-teaming and safety testing\n\n**Edge AI**\n- Running models on mobile devices\n- Reduced latency for real-time applications\n- Privacy-preserving local inference',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 60000).toISOString(),
        },
    ],
};

// Default messages for first chat
const mockMessages: TChatMessage[] = mockChatMessages['1'];

/**
 * Create message actions with handlers
 * @param messageId - Message identifier
 * @param role - Message role (user or assistant)
 * @returns Array of message actions
 */
const createMessageActions = (messageId: string, role: 'user' | 'assistant') => {
    const actions = [
        {
            actionType: 'copy',
            onClick: () => console.log(`Copy message ${messageId}`),
        },
    ];

    if (role === 'user') {
        actions.push({
            actionType: 'edit',
            onClick: () => console.log(`Edit message ${messageId}`),
        });
    }

    if (role === 'assistant') {
        actions.push(
            {
                actionType: 'like',
                onClick: () => console.log(`Like message ${messageId}`),
            },
            {
                actionType: 'unlike',
                onClick: () => console.log(`Unlike message ${messageId}`),
            },
        );
    }

    return actions;
};

/**
 * Add actions to messages
 * @param messages - Array of messages
 * @returns Array of messages with actions added
 */
const addActionsToMessages = (messages: TChatMessage[]): TChatMessage[] => {
    return messages.map((msg) => ({
        ...msg,
        actions: createMessageActions(msg.id || 'unknown', msg.role),
    }));
};

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
        const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>(
            args.status || 'ready',
        );
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
        const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>(
            'ready',
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
            />
        );
    },
    decorators: defaultDecorators,
};

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
 * With custom i18n configuration
 */
export const WithI18nConfig: Story = {
    args: {
        messages: [],
        i18nConfig: {
            header: {
                defaultTitle: 'My Custom AI Assistant',
            },
            emptyState: {
                title: 'Hello!',
                description: 'How can I help you today?',
                suggestionsTitle: 'Quick actions:',
            },
            promptInput: {
                placeholder: 'Ask me anything...',
            },
            disclaimer: {
                text: 'Custom disclaimer text here.',
            },
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
 * With context items
 */
export const WithContextItems: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);
        const [contextItems, setContextItems] = useState([
            {id: '1', content: 'ChatContainer.tsx', onRemove: () => {}},
            {id: '2', content: 'types.ts', onRemove: () => {}},
            {id: '3', content: 'README.md', onRemove: () => {}},
        ]);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        const handleRemoveContext = (id: string) => {
            setContextItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                contextItems={contextItems.map((item) => ({
                    ...item,
                    onRemove: () => handleRemoveContext(item.id),
                }))}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * With context items and indicator
 */
export const WithContextItemsAndIndicator: Story = {
    args: {
        messages: mockMessages,
        promptInputProps: {
            view: 'full',
            headerProps: {
                showContextIndicator: true,
                contextIndicatorProps: {
                    type: 'percent',
                    usedContext: 75,
                },
            },
        },
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);
        const [contextItems, setContextItems] = useState([
            {id: '1', content: 'file.tsx', onRemove: () => {}},
            {id: '2', content: 'component.tsx', onRemove: () => {}},
        ]);

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
        };

        const handleRemoveContext = (id: string) => {
            setContextItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                contextItems={contextItems.map((item) => ({
                    ...item,
                    onRemove: () => handleRemoveContext(item.id),
                }))}
            />
        );
    },
    decorators: defaultDecorators,
};

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
        const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>(
            'ready',
        );
        const [controller, setController] = useState<AbortController | null>(null);
        const isProcessingRef = React.useRef(false);

        const handleSendMessage = async (data: TSubmitData) => {
            if (isProcessingRef.current || status === 'streaming' || status === 'submitted') {
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
 * Hidden Title on Empty Chat
 * Demonstrates the hideTitleOnEmptyChat prop which hides the header title
 * and preview when the chat is empty (no messages)
 */
export const HiddenTitleOnEmpty: Story = {
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>(
            'ready',
        );

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
                hideTitleOnEmptyChat={true}
                headerProps={{
                    title: 'AI Chat Assistant',
                    preview: <span>Beta</span>,
                }}
                welcomeConfig={{
                    title: 'Welcome to AI Assistant',
                    description:
                        'Ask me anything to get started. The title will appear after you send your first message.',
                    suggestions: mockSuggestions,
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

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
        actionType: 'unlike',
        onClick: () => console.log('Unlike assistant message'),
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
        const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>(
            'ready',
        );
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
