/* eslint-disable no-console */
import type {StoryObj} from '@storybook/react-webpack5';

import {ChatContainer} from '../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import type {ChatType, TChatMessage} from '../../../../../types';

export type Story = StoryObj<typeof ChatContainer>;

export const defaultDecorators = [
    (Story) => (
        <ContentWrapper height="800px" width="600px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

// Mock data
export const mockSuggestions = [
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

export const mockChats: ChatType[] = [
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
export const mockChatMessages: Record<string, TChatMessage[]> = {
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
export const mockMessages: TChatMessage[] = mockChatMessages['1'];

/**
 * Create message actions with handlers
 * @param messageId - Message identifier
 * @param role - Message role (user or assistant)
 * @returns Array of message actions
 */
export const createMessageActions = (messageId: string, role: 'user' | 'assistant') => {
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
                actionType: 'dislike',
                onClick: () => console.log(`Dislike message ${messageId}`),
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
export const addActionsToMessages = (messages: TChatMessage[]): TChatMessage[] => {
    return messages.map((msg) => ({
        ...msg,
        actions: createMessageActions(msg.id || 'unknown', msg.role),
    }));
};
