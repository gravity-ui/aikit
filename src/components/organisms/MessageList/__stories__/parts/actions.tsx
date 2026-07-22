/* eslint-disable no-console */
import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';
import {BaseMessageActionType} from '../../../../../types/messages';

import {defaultDecorators} from './shared';

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
                type: BaseMessageActionType.Dislike,
                onClick: (message: TAssistantMessage) => {
                    // eslint-disable-next-line no-console
                    console.log('Dislike:', message.id);
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
