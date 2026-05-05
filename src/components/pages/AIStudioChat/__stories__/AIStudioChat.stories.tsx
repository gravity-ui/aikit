import {useEffect} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {AIStudioChat} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import type {TChatMessage} from '../../../../types';

import MDXDocs from './Docs.mdx';

export default {
    title: 'pages/AIStudioChat',
    component: AIStudioChat,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof AIStudioChat>;

const defaultDecorators = [
    (Story) => {
        const MockFetch = () => {
            useEffect(() => {
                const originalFetch = globalThis.fetch;

                const createSseResponse = (fullText: string) => {
                    const encoder = new TextEncoder();
                    const chunks: string[] = [];
                    for (let i = 0; i < fullText.length; i += 24) {
                        chunks.push(fullText.slice(i, i + 24));
                    }

                    const stream = new ReadableStream<Uint8Array>({
                        start(controller) {
                            for (const chunk of chunks) {
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({
                                            type: 'response.output_text.delta',
                                            delta: chunk,
                                        })}\n\n`,
                                    ),
                                );
                            }
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            controller.close();
                        },
                    });

                    return new Response(stream, {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/event-stream',
                        },
                    });
                };

                globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
                    const url = typeof input === 'string' ? input : input.toString();
                    if (!url.endsWith('/api/chat')) {
                        return originalFetch(input as never, init);
                    }

                    try {
                        const body = init?.body ? JSON.parse(String(init.body)) : {};
                        const messages = Array.isArray(body.messages) ? body.messages : [];
                        const last = messages[messages.length - 1];

                        let content = '';
                        if (last && typeof last.content === 'string') {
                            content = last.content;
                        } else if (Array.isArray(last?.content)) {
                            content = String(
                                last.content.find((p: {type?: string}) => p.type === 'text')
                                    ?.text ?? '',
                            );
                        }

                        const fileNames = Array.isArray(body.fileNames)
                            ? (body.fileNames as string[])
                            : [];

                        const fileList = fileNames.map((n) => `\`${n}\``).join(', ');
                        const reply =
                            fileNames.length > 0
                                ? `I received ${fileNames.length} file(s): ${fileList}.${content ? ` You also wrote: "${content}".` : ''}`
                                : `Mock reply to: "${content}"`;

                        return createSseResponse(reply);
                    } catch {
                        return createSseResponse('Mock reply.');
                    }
                };

                return () => {
                    globalThis.fetch = originalFetch;
                };
            }, []);

            return (
                <ContentWrapper height="800px" width="600px">
                    <Story />
                </ContentWrapper>
            );
        };

        return <MockFetch />;
    },
] satisfies Story['decorators'];

const mockMessages: TChatMessage[] = [
    {
        id: '1',
        role: 'user',
        content: 'What is quantum computing?',
    },
    {
        id: '2',
        role: 'assistant',
        content:
            'Quantum computing is a revolutionary approach to computation that leverages quantum mechanics principles. Unlike classical computers using bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously.\n\nKey concepts:\n1. **Superposition** — qubits can be in multiple states at once\n2. **Entanglement** — qubits can be correlated beyond classical limits\n3. **Interference** — amplifies correct answers and cancels wrong ones',
    },
    {
        id: '3',
        role: 'user',
        content: 'Can you give me a real-world example?',
    },
    {
        id: '4',
        role: 'assistant',
        content:
            'One of the most promising applications is cryptography. Quantum computers can factor large numbers exponentially faster than classical computers, which could break current encryption standards like RSA.\n\nOther real-world applications include:\n- **Drug discovery** — simulating molecular interactions\n- **Optimization** — solving complex logistics problems\n- **Machine learning** — accelerating training algorithms',
    },
];

/**
 * Interactive playground with all configurable props.
 * Set apiUrl to a real OpenAI-compatible streaming endpoint to enable sending messages.
 */
export const Playground: Story = {
    args: {
        apiUrl: '/api/chat',
        showHistory: false,
        showNewChat: false,
        showActionsOnHover: true,
    },
    decorators: defaultDecorators,
};

/**
 * Chat pre-populated with an existing conversation.
 * Demonstrates how to restore a session using the initialMessages prop.
 */
export const WithInitialMessages: Story = {
    args: {
        apiUrl: '/api/chat',
        initialMessages: mockMessages,
        showActionsOnHover: true,
    },
    decorators: defaultDecorators,
};

/**
 * Chat with history panel and new chat button enabled.
 * The history is managed internally — chats are created automatically on first message.
 */
export const WithHistory: Story = {
    args: {
        apiUrl: '/api/chat',
        showHistory: true,
        showNewChat: true,
        initialMessages: mockMessages,
        showActionsOnHover: true,
    },
    decorators: defaultDecorators,
};

/**
 * Chat with a custom welcome screen including suggestions.
 */
export const WithWelcomeConfig: Story = {
    args: {
        apiUrl: '/api/chat',
        welcomeConfig: {
            title: 'How can I help you today?',
            description: 'Ask me anything — I am here to assist.',
            suggestions: [
                {id: '1', title: 'Explain quantum computing in simple terms'},
                {id: '2', title: 'Write a poem about the ocean'},
                {id: '3', title: 'Help me debug my JavaScript code'},
                {id: '4', title: 'Summarize recent AI developments'},
            ],
        },
        showActionsOnHover: true,
    },
    decorators: defaultDecorators,
};

// Gradient SVG used as a mock image attachment in stories
const MOCK_IMAGE_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+PGNpcmNsZSBjeD0iMTQwIiBjeT0iMTMwIiByPSI0MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjxwb2x5Z29uIHBvaW50cz0iMjIwLDE4MCAyOTAsMjQwIDE1MCwyNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz48cmVjdCB4PSIyNTAiIHk9IjgwIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+';

const messagesWithFiles: TChatMessage[] = [
    {
        id: 'f-1',
        role: 'user',
        content: 'Can you analyze this image and the attached document?',
        images: [MOCK_IMAGE_DATA_URL],
        fileAttachments: [{id: 'doc-1', name: 'report.pdf', mimeType: 'application/pdf'}],
    },
    {
        id: 'f-2',
        role: 'assistant',
        content:
            'I can see the image you attached — it appears to be a gradient illustration with geometric shapes. Regarding the PDF document `report.pdf`, I would need its content to analyze it properly.\n\nWhat specific aspects of the image or document would you like me to focus on?',
    },
    {
        id: 'f-3',
        role: 'user',
        content: 'Here are two more screenshots for comparison.',
        images: [MOCK_IMAGE_DATA_URL, MOCK_IMAGE_DATA_URL],
    },
    {
        id: 'f-4',
        role: 'assistant',
        content:
            'Both screenshots look very similar — they share the same gradient background and layout. The composition uses a purple-to-indigo gradient with white geometric overlays: a circle in the upper-left, a triangle in the center-right, and a rounded rectangle in the top-right corner.',
    },
];

/**
 * Chat with pre-populated messages that include image attachments and file chips.
 * Demonstrates how images render as inline previews and file attachments as chips.
 */
export const WithFileAttachments: Story = {
    args: {
        apiUrl: '/api/chat',
        initialMessages: messagesWithFiles,
        showActionsOnHover: true,
    },
    decorators: defaultDecorators,
};

/**
 * Chat configured with a system prompt and custom i18n labels.
 */
export const WithSystemPrompt: Story = {
    args: {
        apiUrl: '/api/chat',
        systemPrompt:
            'You are a helpful coding assistant. Always include code examples in your answers.',
        initialMessages: mockMessages,
        showActionsOnHover: true,
        i18nConfig: {
            header: {
                defaultTitle: 'Code Assistant',
            },
            promptInput: {
                placeholder: 'Ask a coding question...',
            },
        },
    },
    decorators: defaultDecorators,
};
