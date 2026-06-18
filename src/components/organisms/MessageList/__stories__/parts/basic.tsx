/* eslint-disable no-console */
import {useEffect, useState} from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';
import {BaseMessageActionType} from '../../../../../types/messages';

import {assistantMessage, defaultDecorators, userMessage} from './shared';

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

export const WithExtraInfo: StoryObj<MessageListProps> = {
    render: () => {
        type AssistantWithMeta = TAssistantMessage & {metadata?: {outputTokens?: number}};

        const messages: Array<TUserMessage | TAssistantMessage> = [
            {
                id: 'user-1',
                role: 'user',
                timestamp: '2024-01-01T10:00:00Z',
                content: 'What is the capital of France?',
            },
            {
                id: 'assistant-1',
                role: 'assistant',
                timestamp: '2024-01-01T10:00:05Z',
                content: 'The capital of France is Paris.',
                metadata: {outputTokens: 42},
            },
            {
                id: 'user-2',
                role: 'user',
                timestamp: '2024-01-01T10:00:10Z',
                content: 'And the capital of Germany?',
            },
            {
                id: 'assistant-2',
                role: 'assistant',
                timestamp: '2024-01-01T10:00:15Z',
                content: 'The capital of Germany is Berlin.',
                metadata: {outputTokens: 38},
            },
            {
                id: 'assistant-no-tokens',
                role: 'assistant',
                timestamp: '2024-01-01T10:00:20Z',
                content: 'This message has no token count (metadata.outputTokens is absent).',
            },
        ];

        const assistantActions = [
            {
                type: BaseMessageActionType.Copy,
                onClick: (message: TAssistantMessage) => {
                    const text =
                        typeof message.content === 'string'
                            ? message.content
                            : JSON.stringify(message.content);
                    console.log('Copy:', text);
                },
            },
        ];

        const TokenCount = ({message}: {message: TAssistantMessage}) => {
            const tokens = (message as AssistantWithMeta).metadata?.outputTokens;
            if (tokens === null) {
                return null;
            }
            return (
                <Text variant="caption-2" color="secondary">
                    {tokens} tokens
                </Text>
            );
        };

        return (
            <ShowcaseItem title="Token count via assistantExtraInfo component">
                <ContentWrapper width="600px" height="500px" display="flex">
                    <MessageList
                        messages={messages}
                        assistantActions={assistantActions}
                        assistantExtraInfo={TokenCount}
                        showActionsOnHover={false}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};
