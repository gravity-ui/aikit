import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TMessageContent, TUserMessage} from '../../../../types/messages';
import {
    type MessageContentComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../utils/messageTypeRegistry';
import {BaseMessageAction} from '../../../molecules/BaseMessage';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/MessageList',
    component: MessageList,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        messages: {
            control: 'object',
            description: 'Array of messages to render',
        },
        messageRendererRegistry: {
            control: false,
            description: 'Custom message renderer registry',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show action buttons on hover for all messages',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp for all messages',
        },
        showAvatar: {
            control: 'boolean',
            description: 'Show avatar for user messages',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

const defaultDecorators = [
    (StoryComponent: StoryFn) => (
        <Showcase>
            <StoryComponent />
        </Showcase>
    ),
];

const userMessage: TUserMessage = {
    id: '1',
    role: 'user',
    timestamp: '2024-01-01T00:00:00Z',
    content: 'Hello, how are you?',
};

const assistantMessage: TAssistantMessage = {
    id: '2',
    role: 'assistant',
    timestamp: '2024-01-01T00:00:01Z',
    content: 'Hi! I am doing well, thank you for asking.',
};

export const Playground: StoryFn<MessageListProps> = (args) => (
    <ContentWrapper width="480px">
        <MessageList {...args} />
    </ContentWrapper>
);
Playground.args = {
    messages: [userMessage, assistantMessage],
};

export const WithSubmittedStatus: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Submitted Status">
            <ContentWrapper width="480px">
                <MessageList {...args} messages={[userMessage]} status="submitted" />
            </ContentWrapper>
        </ShowcaseItem>
    ),
};

export const WithErrorMessage: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Error Message">
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    messages={[userMessage]}
                    status="error"
                    // eslint-disable-next-line no-console
                    onRetry={() => console.log('retry')}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
};

const toolIcon = <Icon data={Pencil} />;
const toolHeaderContent = (
    <Text color="secondary" variant="body-1">
        expectScreenshotFixture.ts
    </Text>
);

export const WithToolMessage: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Tool Message">
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    messages={[
                        {
                            role: 'user',
                            content:
                                'Analyze the project and suggest a better solution to implement a feature-name',
                        },
                        {
                            role: 'assistant',
                            content: [
                                {
                                    type: 'text',
                                    data: {
                                        text: "I'll scan the SCSS structure: global styles and mixins, theme files, and a couple of component styles. I'll also search for the custom Sass function usage and theming patterns.",
                                    },
                                },
                                {
                                    type: 'tool',
                                    data: {
                                        toolName: 'Reading',
                                        status: 'success',
                                        toolIcon,
                                        expandable: true,
                                        headerContent: toolHeaderContent,
                                    },
                                },

                                {
                                    type: 'text',
                                    data: {
                                        text: "Absolutely! Here are some suggestions for improving the SCSS structure: \n\n- Consider organizing global styles and mixins into separate directories for better modularity. \n- Group theme files and component styles to simplify maintenance. \n- Use consistent naming patterns for custom Sass functions and variables. \n- Leverage nesting carefully to avoid deeply nested selectors and improve readability. \n- Document theming patterns to ease onboarding for new contributors.\n\nLet me know if you'd like examples or more details on any point!",
                                    },
                                },
                            ],
                        },
                    ]}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

interface ChartMessageData {
    chartData: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            color?: string;
        }>;
    };
    chartType: 'line' | 'bar' | 'pie';
}

type ChartMessageContent = TMessageContent<'chart', ChartMessageData>;

const ChartMessageView: React.FC<MessageContentComponentProps<ChartMessageContent>> = ({part}) => {
    const {chartData, chartType} = part.data;
    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
            }}
        >
            <div style={{marginBottom: '8px', fontWeight: 'bold'}}>Chart: {chartType}</div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Labels: {chartData.labels.join(', ')}
            </div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Datasets: {chartData.datasets.length}
            </div>
        </div>
    );
};

export const WithCustomMessageType: StoryObj<MessageListProps<ChartMessageContent>> = {
    render: (args) => {
        const customRegistry: MessageRendererRegistry = createMessageRendererRegistry();
        registerMessageRenderer<ChartMessageContent>(customRegistry, 'chart', {
            component: ChartMessageView,
        });

        return (
            <ShowcaseItem title="With Custom Message Type">
                <ContentWrapper width="480px">
                    <MessageList<ChartMessageContent>
                        {...args}
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content:
                                    'Hi! Can you show me the sales statistics for the first months of the year?',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:02Z',
                                content: [
                                    {
                                        type: 'text',
                                        data: {
                                            text: 'Sure! Here is a bar chart showing sales statistics by month. As you can see, February had the highest sales.',
                                        },
                                    },
                                    {
                                        type: 'chart',
                                        data: {
                                            chartData: {
                                                labels: ['January', 'February', 'March', 'April'],
                                                datasets: [
                                                    {
                                                        label: 'Sales',
                                                        data: [12, 19, 3, 5],
                                                        color: '#0077ff',
                                                    },
                                                ],
                                            },
                                            chartType: 'bar',
                                        },
                                    },
                                ],
                            },
                        ]}
                        messageRendererRegistry={customRegistry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

const streamingText =
    'React Hooks are functions that let you use state and other React features without writing a class. ' +
    'The most commonly used hooks are:\n\n' +
    '1. **useState** - for managing component state\n' +
    '2. **useEffect** - for side effects like data fetching or subscriptions\n' +
    '3. **useContext** - for consuming context values\n' +
    '4. **useCallback** - for memoizing functions\n' +
    '5. **useMemo** - for memoizing computed values\n\n' +
    'Each hook serves a specific purpose and helps you write cleaner, more maintainable React code. ' +
    'Would you like examples of how to use any of these hooks?';

export const WithStreamingMessage: StoryObj<MessageListProps> = {
    render: (args) => {
        const [streamedText, setStreamedText] = useState('');
        const [isStreaming, setIsStreaming] = useState(true);

        useEffect(() => {
            setStreamedText('');
            setIsStreaming(true);
            const resultText = streamingText.repeat(10);

            let currentIndex = 0;
            const interval = setInterval(() => {
                if (currentIndex < resultText.length) {
                    const nextChunk = resultText.slice(0, currentIndex + 1);
                    setStreamedText(nextChunk);
                    currentIndex += Math.floor(Math.random() * 4) + 3;
                } else {
                    setIsStreaming(false);
                    clearInterval(interval);
                }
            }, 20);

            return () => {
                clearInterval(interval);
            };
        }, []);

        const messages: Array<TUserMessage | TAssistantMessage> = [
            {
                id: 'user-1',
                role: 'user',
                timestamp: '2024-01-01T00:00:00Z',
                content: 'Can you explain React Hooks to me?',
            },
            {
                id: 'assistant-1',
                role: 'assistant',
                timestamp: '2024-01-01T00:00:01Z',
                content: streamedText || ' ',
            },
        ];

        return (
            <ShowcaseItem title="With Streaming Message">
                <ContentWrapper width="480px" height="200px" display="flex">
                    <MessageList
                        {...args}
                        messages={messages}
                        status={isStreaming ? 'streaming' : 'ready'}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithDefaultActions: StoryObj<MessageListProps> = {
    render: (args) => {
        const userActions = [
            {
                type: BaseMessageAction.Edit,
                onClick: (message: TUserMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Edit user message:', message.id);
                },
            },
            {
                type: BaseMessageAction.Delete,
                onClick: (message: TUserMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Delete user message:', message.id);
                },
            },
        ];

        const assistantActions = [
            {
                type: BaseMessageAction.Copy,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Copy assistant message:', message.id);
                },
            },
            {
                type: BaseMessageAction.Like,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Like assistant message:', message.id);
                },
            },
        ];

        return (
            <ShowcaseItem title="With Default Actions">
                <ContentWrapper width="480px">
                    <MessageList
                        {...args}
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content: 'Hello! This message has default actions.',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:01Z',
                                content: 'Hi! This message also has default actions.',
                            },
                            {
                                id: 'user-2',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:02Z',
                                content: 'This message has custom actions.',
                                actions: [
                                    {
                                        type: 'custom',
                                        onClick: () => {
                                            // eslint-disable-next-line no-console
                                            console.log('Custom action clicked');
                                        },
                                    },
                                ],
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:01Z',
                                content: 'On stream, the last message does not have actions.',
                            },
                        ]}
                        userActions={userActions}
                        assistantActions={assistantActions}
                        status="streaming"
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithPreviousMessages: StoryObj<MessageListProps> = {
    render: (args) => {
        const createMessage = (num: number): TUserMessage | TAssistantMessage => {
            const isUser = num % 2 === 1;
            return {
                id: `msg-${num}`,
                role: isUser ? ('user' as const) : ('assistant' as const),
                timestamp: `2024-01-01T00:00:${String(num).padStart(2, '0')}Z`,
                content: isUser ? `User message ${num}` : `Assistant response ${num}`,
            };
        };

        const [messages, setMessages] = useState<Array<TUserMessage | TAssistantMessage>>(() =>
            Array.from({length: 10}, (_, i) => createMessage(11 + i)),
        );

        const [hasMore, setHasMore] = useState(true);
        const isLoadingRef = useRef(false);

        const handleLoadPrevious = useCallback(() => {
            if (isLoadingRef.current || !hasMore) {
                return;
            }

            isLoadingRef.current = true;

            setTimeout(() => {
                setMessages((prev) => {
                    const firstMessage = prev[0];
                    if (!firstMessage?.id) {
                        isLoadingRef.current = false;
                        return prev;
                    }

                    const firstNum = parseInt(firstMessage.id.replace('msg-', ''), 10);
                    const startNum = Math.max(1, firstNum - 5);
                    const count = firstNum - startNum;

                    if (count <= 0 || startNum >= firstNum) {
                        setHasMore(false);
                        isLoadingRef.current = false;
                        return prev;
                    }

                    const newMessages = Array.from({length: count}, (_, i) =>
                        createMessage(startNum + i),
                    );

                    if (startNum <= 1) {
                        setHasMore(false);
                    }

                    isLoadingRef.current = false;
                    return [...newMessages, ...prev];
                });
            }, 500);
        }, [hasMore]);

        return (
            <ShowcaseItem title="With Previous Messages Loading">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        {...args}
                        messages={messages}
                        hasPreviousMessages={hasMore}
                        onLoadPreviousMessages={handleLoadPrevious}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};
