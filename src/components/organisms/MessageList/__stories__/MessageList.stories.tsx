/* eslint-disable no-console */
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import type {
    ActionPopupContext,
    TAssistantMessage,
    TMessageContent,
    TUserMessage,
} from '../../../../types/messages';
import {BaseMessageActionType} from '../../../../types/messages';
import {
    type MessageContentComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../utils/messageTypeRegistry';
import {FeedbackForm} from '../../../molecules/FeedbackForm';

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
                type: BaseMessageActionType.Edit,
                onClick: (message: TUserMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Edit user message:', message.id);
                },
            },
            {
                type: BaseMessageActionType.Delete,
                onClick: (message: TUserMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Delete user message:', message.id);
                },
            },
        ];

        const assistantActions = [
            {
                type: BaseMessageActionType.Copy,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Copy assistant message:', message.id);
                },
            },
            {
                type: BaseMessageActionType.Like,
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
                                        actionType: 'custom',
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

export const WithUserRating: StoryObj<MessageListProps> = {
    render: (args) => {
        const assistantActions = [
            {
                type: BaseMessageActionType.Copy,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Copy:', message.id);
                },
            },
            {
                type: BaseMessageActionType.Like,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Like:', message.id);
                },
            },
            {
                type: BaseMessageActionType.Unlike,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Unlike:', message.id);
                },
            },
        ];

        return (
            <ShowcaseItem title="With User Rating">
                <ContentWrapper width="480px">
                    <MessageList
                        {...args}
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content: 'Compare these two answers.',
                            },
                            {
                                id: 'assistant-like',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:01Z',
                                content: 'This message is rated as liked (filled thumb up).',
                                userRating: 'like',
                            },
                            {
                                id: 'assistant-dislike',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:02Z',
                                content: 'This message is rated as disliked (filled thumb down).',
                                userRating: 'dislike',
                            },
                        ]}
                        assistantActions={assistantActions}
                        status="ready"
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

export const WithRatingBlock: StoryObj<MessageListProps> = {
    render: () => {
        const [rating, setRating] = useState<number | undefined>(undefined);

        return (
            <ShowcaseItem title="With Rating Block">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content:
                                    'I am ready to create a virtual machine `my-cheap-vm` with the following characteristics...',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:01Z',
                                content:
                                    'Virtual machine my-cheap-vm has been successfully created.',
                            },
                        ]}
                        ratingBlockProps={{
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
                            onChange: setRating,
                        }}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithRatingBlockLowRating: StoryObj<MessageListProps> = {
    render: () => {
        const [rating, setRating] = useState<number>(2);

        return (
            <ShowcaseItem title="With Rating Block - Low Rating">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content:
                                    'I am ready to create a virtual machine `my-cheap-vm` with the following characteristics...',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:01Z',
                                content:
                                    'Virtual machine my-cheap-vm has been successfully created.',
                            },
                        ]}
                        ratingBlockProps={{
                            title: (
                                <>
                                    What went wrong?{' '}
                                    <a href="#feedback" onClick={(e) => e.preventDefault()}>
                                        Go to survey
                                    </a>
                                </>
                            ),
                            value: rating,
                            onChange: setRating,
                        }}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithRatingBlockCustomSize: StoryObj<MessageListProps> = {
    render: () => {
        const [rating, setRating] = useState<number>(4);

        return (
            <ShowcaseItem title="With Rating Block - Custom Size">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        messages={[userMessage, assistantMessage]}
                        ratingBlockProps={{
                            title: 'How was your experience?',
                            value: rating,
                            onChange: setRating,
                            size: 'm',
                        }}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithRatingBlockHidden: StoryObj<MessageListProps> = {
    render: () => (
        <ShowcaseItem title="With Rating Block Hidden">
            <ContentWrapper width="480px" height="400px" display="flex">
                <MessageList
                    messages={[userMessage, assistantMessage]}
                    ratingBlockProps={{
                        title: 'Rate the assistant:',
                        value: 3,
                        onChange: () => {},
                        visible: false,
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithRatingBlockManyMessages: StoryObj<MessageListProps> = {
    render: () => {
        const [rating, setRating] = useState<number | undefined>(undefined);

        // Generate many messages to demonstrate sticky behavior
        const manyMessages: Array<TUserMessage | TAssistantMessage> = [];
        for (let i = 0; i < 20; i++) {
            manyMessages.push({
                id: `user-${i}`,
                role: 'user',
                timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
                content: `User message ${i + 1}: Can you help me with task number ${i + 1}?`,
            });
            manyMessages.push({
                id: `assistant-${i}`,
                role: 'assistant',
                timestamp: new Date(Date.now() - (20 - i) * 60000 + 30000).toISOString(),
                content: `Assistant response ${i + 1}: Sure! I can help you with task number ${i + 1}. Here's a detailed explanation of what you need to do...`,
            });
        }

        return (
            <ShowcaseItem title="With Rating Block - Many Messages (Scroll to see sticky behavior)">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        messages={manyMessages}
                        ratingBlockProps={{
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
                            onChange: setRating,
                        }}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithFeedbackPopup: StoryObj<MessageListProps> = {
    render: () => {
        const [userRating, setUserRating] = useState<'like' | 'dislike' | undefined>();

        const messages: Array<TUserMessage | TAssistantMessage> = [
            {
                id: '1',
                role: 'user',
                timestamp: '2024-01-01T10:00:00Z',
                content: 'Create a virtual machine for VPN',
            },
            {
                id: '2',
                role: 'assistant',
                timestamp: '2024-01-01T10:00:30Z',
                content: `I am ready to create a virtual machine 'my-cheap-vm' with the following specifications:

• Folder: your current console folder — auxiliary
• Availability zone: 'ru-central1-a'
• Platform: Intel Ice Lake
• Image: Ubuntu 22.04 LTS
• Resources: 2 CPU cores, 2 GB RAM
• Boot disk type: 'network-hdd', size 20 GB
• Additional: Preemptible VM
• NAT: Enabled for internet access

Do you confirm the creation?`,
                userRating,
            },
        ];

        const assistantActions = [
            {
                type: BaseMessageActionType.Like,
                onClick: () => {
                    setUserRating('like');
                },
            },
            {
                type: BaseMessageActionType.Unlike,
                onClick: (_message: TAssistantMessage) => {
                    setUserRating('dislike');
                },
                popup: {
                    title: 'What went wrong?',
                    placement: 'bottom-start' as const,
                    getContent: (
                        _message: TAssistantMessage,
                        context: ActionPopupContext,
                    ): React.ReactNode => {
                        const {setContent, setTitle, setSubtitle, closePopup} = context;

                        const handleSubmit = (reasons: string[], comment: string) => {
                            console.log('Feedback submitted:', {reasons, comment});

                            // Change to success state
                            setTitle(undefined);
                            setSubtitle(undefined);
                            setContent(
                                <div>
                                    <Text variant="body-2">Thank you for your feedback!</Text>
                                </div>,
                            );

                            // Auto-close after 2 seconds
                            setTimeout(() => {
                                closePopup();
                            }, 2000);
                        };

                        return (
                            <FeedbackForm
                                options={[
                                    {id: 'no-answer', label: 'No answer'},
                                    {id: 'not-helpful', label: 'Not helpful'},
                                    {id: 'wrong-info', label: 'Wrong information'},
                                    {id: 'other', label: 'Other'},
                                ]}
                                onSubmit={handleSubmit}
                                commentPlaceholder="Tell us more..."
                                submitLabel="Submit"
                            />
                        );
                    },
                },
            },
            {
                type: BaseMessageActionType.Copy,
                onClick: (message: TAssistantMessage) => {
                    const content =
                        typeof message.content === 'string'
                            ? message.content
                            : JSON.stringify(message.content);
                    navigator.clipboard.writeText(content);
                },
            },
        ];

        return (
            <ShowcaseItem title="With Feedback Popup - Click dislike to see feedback form">
                <ContentWrapper width="600px" height="500px" display="flex">
                    <MessageList messages={messages} assistantActions={assistantActions} />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithMultipleActionPopups: StoryObj<MessageListProps> = {
    render: () => {
        const [userRating, setUserRating] = useState<'like' | 'dislike' | undefined>();

        const messages: Array<TUserMessage | TAssistantMessage> = [
            {
                id: '1',
                role: 'user',
                timestamp: '2024-01-01T10:00:00Z',
                content: 'Can you help me with my project?',
            },
            {
                id: '2',
                role: 'assistant',
                timestamp: '2024-01-01T10:00:30Z',
                content:
                    'Sure! I can help you with your project. What specific area do you need assistance with?',
                userRating,
            },
        ];

        const assistantActions = [
            {
                type: BaseMessageActionType.Like,
                onClick: () => {
                    console.log('Like clicked');
                    setUserRating('like');
                },
                popup: {
                    title: 'What did you like?',
                    placement: 'bottom-start' as const,
                    getContent: (
                        _message: TAssistantMessage,
                        context: ActionPopupContext,
                    ): React.ReactNode => {
                        const {setContent, setTitle, closePopup} = context;
                        return (
                            <FeedbackForm
                                options={[
                                    {id: 'helpful', label: 'Helpful'},
                                    {id: 'clear', label: 'Clear explanation'},
                                    {id: 'complete', label: 'Complete answer'},
                                    {id: 'accurate', label: 'Accurate information'},
                                ]}
                                onSubmit={(reasons: string[], comment: string) => {
                                    console.log('Like feedback submitted:', {
                                        reasons,
                                        comment,
                                    });
                                    setTitle(undefined);
                                    setContent(
                                        <div>
                                            <Text variant="body-2">
                                                Thank you for your feedback!
                                            </Text>
                                        </div>,
                                    );
                                    setTimeout(() => {
                                        closePopup();
                                    }, 2000);
                                }}
                                commentPlaceholder="Tell us more..."
                                submitLabel="Submit"
                            />
                        );
                    },
                },
            },
            {
                type: BaseMessageActionType.Unlike,
                onClick: () => {
                    console.log('Dislike clicked');
                    setUserRating('dislike');
                },
                popup: {
                    title: 'What went wrong?',
                    placement: 'bottom-start' as const,
                    getContent: (
                        _message: TAssistantMessage,
                        context: ActionPopupContext,
                    ): React.ReactNode => {
                        const {setContent, setTitle, closePopup} = context;
                        return (
                            <FeedbackForm
                                options={[
                                    {id: 'no-answer', label: 'No answer'},
                                    {id: 'not-helpful', label: 'Not helpful'},
                                    {id: 'wrong-info', label: 'Wrong information'},
                                    {id: 'other', label: 'Other'},
                                ]}
                                onSubmit={(reasons: string[], comment: string) => {
                                    console.log('Dislike feedback submitted:', {
                                        reasons,
                                        comment,
                                    });
                                    setTitle(undefined);
                                    setContent(
                                        <div>
                                            <Text variant="body-2">
                                                Thank you for your feedback!
                                            </Text>
                                        </div>,
                                    );
                                    setTimeout(() => {
                                        closePopup();
                                    }, 2000);
                                }}
                                commentPlaceholder="Tell us more..."
                                submitLabel="Submit"
                            />
                        );
                    },
                },
            },
            {
                actionType: 'report',
                label: 'Report',
                icon: <Icon data={Pencil} size={16} />,
                onClick: () => {
                    console.log('Report clicked');
                },
                popup: {
                    title: 'Report issue',
                    placement: 'bottom-start' as const,
                    getContent: (
                        _message: TAssistantMessage,
                        context: ActionPopupContext,
                    ): React.ReactNode => {
                        const {setContent, setTitle, closePopup} = context;
                        return (
                            <FeedbackForm
                                options={[
                                    {id: 'spam', label: 'Spam'},
                                    {id: 'offensive', label: 'Offensive content'},
                                    {id: 'incorrect', label: 'Incorrect information'},
                                    {id: 'inappropriate', label: 'Inappropriate'},
                                ]}
                                onSubmit={(reasons: string[], comment: string) => {
                                    console.log('Report submitted:', {reasons, comment});
                                    setTitle(undefined);
                                    setContent(
                                        <div>
                                            <Text variant="body-2">Report sent successfully!</Text>
                                        </div>,
                                    );
                                    setTimeout(() => {
                                        closePopup();
                                    }, 2000);
                                }}
                                commentPlaceholder="Describe the issue..."
                                submitLabel="Send Report"
                            />
                        );
                    },
                },
            },
            {
                type: BaseMessageActionType.Copy,
                onClick: (message: TAssistantMessage) => {
                    const content =
                        typeof message.content === 'string'
                            ? message.content
                            : JSON.stringify(message.content);
                    navigator.clipboard.writeText(content);
                    console.log('Content copied:', content);
                },
            },
        ];

        return (
            <ShowcaseItem title="Multiple Action Popups - Different popups for dislike and report actions">
                <ContentWrapper width="600px" height="500px" display="flex">
                    <MessageList messages={messages} assistantActions={assistantActions} />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};
