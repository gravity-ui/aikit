/* eslint-disable no-console */
import React, {useState} from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {
    ActionPopupContext,
    TAssistantMessage,
    TUserMessage,
} from '../../../../../types/messages';
import {BaseMessageActionType} from '../../../../../types/messages';
import {FeedbackForm} from '../../../../molecules/FeedbackForm';

import {defaultDecorators} from './shared';

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
                type: BaseMessageActionType.Dislike,
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
                type: BaseMessageActionType.Dislike,
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
