import React from 'react';

import {expect, test} from '~playwright/core';

import type {TAssistantMessage, TUserMessage} from '../../../../types/messages';
import {BaseMessageAction} from '../../../molecules/BaseMessage';
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
                type: BaseMessageAction.Copy,
                onClick: () => {},
            },
            {
                type: BaseMessageAction.Like,
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
    });
});
