import React from 'react';

import {expect, test} from '~playwright/core';

import type {TAssistantMessage, TUserMessage} from '../../../../types/messages';
import {BaseMessageActionType} from '../../../molecules/BaseMessage';
import {MessageList} from '../MessageList';

import {MessageListStories} from './helpersPlaywright';

test.describe('MessageList', {tag: '@MessageList'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.Playground />);

        await expectScreenshot();
    });

    test('should render with tool message', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithToolMessage />);

        await expectScreenshot();
    });

    test('should render with custom message type', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithCustomMessageType />);

        await expectScreenshot();
    });

    test('should render with submitted status', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithSubmittedStatus />);

        await expectScreenshot();
    });

    test('should render with error message', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithErrorMessage />);

        await expectScreenshot();
    });

    test('should render with default actions', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithDefaultActions />);

        await expectScreenshot();
    });

    test.describe('actions visibility for assistant messages', () => {
        const assistantActions = [
            {
                type: BaseMessageActionType.Copy,
                onClick: () => {},
            },
            {
                type: BaseMessageActionType.Like,
                onClick: () => {},
            },
        ];

        const createUserMessage = (id: string, content: string): TUserMessage => ({
            id,
            role: 'user',
            content,
            timestamp: '2024-01-01T00:00:00Z',
        });

        const createAssistantMessage = (id: string, content: string): TAssistantMessage => ({
            id,
            role: 'assistant',
            content,
            timestamp: '2024-01-01T00:00:01Z',
        });

        test('should display actions if message is not last', async ({mount, page}) => {
            const messages = [
                createUserMessage('1', 'First message'),
                createAssistantMessage('2', 'Assistant response 1'),
                createAssistantMessage('3', 'Assistant response 2'),
            ];

            await mount(<MessageList messages={messages} assistantActions={assistantActions} />);

            const assistantMessages = page.locator('.g-aikit-assistant-message');
            const firstAssistantMessage = assistantMessages.first();
            const actionsContainer = firstAssistantMessage.locator(
                '.g-aikit-base-message__actions',
            );

            await expect(actionsContainer).toBeVisible();
        });

        test('should not display actions if message is last and status is streaming', async ({
            mount,
            page,
        }) => {
            const messages = [
                createUserMessage('1', 'First message'),
                createAssistantMessage('2', 'Assistant response'),
            ];

            await mount(
                <MessageList
                    messages={messages}
                    assistantActions={assistantActions}
                    status="streaming"
                />,
            );

            const assistantMessages = page.locator('.g-aikit-assistant-message');
            const lastAssistantMessage = assistantMessages.last();
            const actionsContainer = lastAssistantMessage.locator('.g-aikit-base-message__actions');

            await expect(actionsContainer).not.toBeVisible();
        });

        test('should not display actions if message is last and status is submitted', async ({
            mount,
            page,
        }) => {
            const messages = [
                createUserMessage('1', 'First message'),
                createAssistantMessage('2', 'Assistant response'),
            ];

            await mount(
                <MessageList
                    messages={messages}
                    assistantActions={assistantActions}
                    status="submitted"
                />,
            );

            const assistantMessages = page.locator('.g-aikit-assistant-message');
            const lastAssistantMessage = assistantMessages.last();
            const actionsContainer = lastAssistantMessage.locator('.g-aikit-base-message__actions');

            await expect(actionsContainer).not.toBeVisible();
        });

        test('should display actions if message is last and status is ready', async ({
            mount,
            page,
        }) => {
            const messages = [
                createUserMessage('1', 'First message'),
                createAssistantMessage('2', 'Assistant response'),
            ];

            await mount(
                <MessageList
                    messages={messages}
                    assistantActions={assistantActions}
                    status="ready"
                />,
            );

            const assistantMessages = page.locator('.g-aikit-assistant-message');
            const lastAssistantMessage = assistantMessages.last();
            const actionsContainer = lastAssistantMessage.locator('.g-aikit-base-message__actions');

            await expect(actionsContainer).toBeVisible();
        });

        test('should not display actions for message with thinking content', async ({
            mount,
            page,
        }) => {
            const thinkingMessage: TAssistantMessage = {
                id: '1',
                role: 'assistant',
                content: [
                    {
                        type: 'thinking',
                        data: {
                            title: 'Thinking',
                            content: 'AI is thinking about the answer...',
                            status: 'thought',
                        },
                    },
                ],
                timestamp: '2024-01-01T00:00:01Z',
            };

            await mount(
                <MessageList messages={[thinkingMessage]} assistantActions={assistantActions} />,
            );

            const actionsContainer = page.locator('.g-aikit-base-message__actions');

            await expect(actionsContainer).not.toBeVisible();
        });

        test('should display actions for message with thinking and text content', async ({
            mount,
            page,
        }) => {
            const mixedMessage: TAssistantMessage = {
                id: '1',
                role: 'assistant',
                content: [
                    {
                        type: 'thinking',
                        data: {
                            title: 'Thinking',
                            content: 'AI is thinking...',
                            status: 'thought',
                        },
                    },
                    {
                        type: 'text',
                        data: {
                            text: 'Here is my answer',
                        },
                    },
                ],
                timestamp: '2024-01-01T00:00:01Z',
            };

            await mount(
                <MessageList messages={[mixedMessage]} assistantActions={assistantActions} />,
            );

            const actionsContainer = page.locator('.g-aikit-base-message__actions');

            await expect(actionsContainer).toBeVisible();
        });
    });

    test('should render with rating block', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithRatingBlock />);

        await expectScreenshot();
    });

    test('should render with rating block low rating', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithRatingBlockLowRating />);

        await expectScreenshot();
    });

    test('should render with rating block custom size', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithRatingBlockCustomSize />);

        await expectScreenshot();
    });

    test('should render with rating block hidden', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithRatingBlockHidden />);

        await expectScreenshot();
    });

    test('should render with rating block many messages', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithRatingBlockManyMessages />);

        await expectScreenshot();
    });

    test('should handle rating click in rating block', async ({mount, page}) => {
        await mount(<MessageListStories.WithRatingBlock />);

        // Find rating block
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        // Click on 4th star
        const fourthStar = page.locator('[data-qa="star-rating-button-4"]');
        await fourthStar.click();

        // Verify star is selected
        await expect(
            page.locator('[data-qa="star-rating-button-4"][aria-checked="true"]'),
        ).toBeVisible();
    });

    test('should change title on low rating', async ({mount, page}) => {
        await mount(<MessageListStories.WithRatingBlock />);

        // Initially should show default title
        await expect(page.getByText('Rate the assistant response:')).toBeVisible();

        // Click on 2nd star (low rating)
        const secondStar = page.locator('[data-qa="star-rating-button-2"]');
        await secondStar.click();

        // Title should change to low rating message with survey link
        await expect(page.getByText(/What went wrong/)).toBeVisible();
        await expect(page.getByText('Go to survey')).toBeVisible();
    });

    test('should hide rating block when visible is false', async ({mount, page}) => {
        await mount(<MessageListStories.WithRatingBlockHidden />);

        // Rating block should not be visible
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).not.toBeVisible();
    });

    test('should show rating block sticky at bottom when scrolling', async ({mount, page}) => {
        await mount(<MessageListStories.WithRatingBlockManyMessages />);

        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        // Scroll to top
        const messageList = page.locator('.g-aikit-message-list');
        await messageList.evaluate((el) => {
            el.scrollTop = 0;
        });

        await page.waitForTimeout(100);

        // Rating block should still be visible (sticky behavior)
        await expect(ratingBlock).toBeVisible();
    });
});
