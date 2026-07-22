import {useState} from 'react';

import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';

import {assistantMessage, defaultDecorators, userMessage} from './shared';

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
