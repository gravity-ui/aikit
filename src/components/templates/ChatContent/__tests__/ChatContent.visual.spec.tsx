import React from 'react';

import {expect, test} from '~playwright/core';

import {ChatContentStories} from './helpersPlaywright';

test.describe('ChatContent', {tag: '@ChatContent'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.Playground />);

        await expectScreenshot();
    });

    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.EmptyState />);

        await expectScreenshot();
    });

    test('should render empty state with suggestions', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.EmptyStateWithSuggestions />);

        await expectScreenshot();
    });

    test('should render chat state with messages', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.ChatStateWithMessages />);

        await expectScreenshot();
    });

    test('should render chat state with actions on hover', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.ChatStateWithActionsOnHover />);

        await expectScreenshot();
    });

    test('should render with long messages', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.WithLongMessages />);

        await expectScreenshot();
    });

    test('should render with many messages', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.WithManyMessages />);

        await expectScreenshot();
    });

    test('should render long conversation', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.LongConversation />);

        await expectScreenshot();
    });

    test('should display suggestions in empty state', async ({mount, page}) => {
        await mount(<ChatContentStories.EmptyStateWithSuggestions />);

        // Check for suggestions presence
        await expect(page.getByText('Explain React hooks')).toBeVisible();
        await expect(page.getByText('How to use TypeScript with React?')).toBeVisible();
    });

    test('should display messages in chat state', async ({mount, page}) => {
        await mount(<ChatContentStories.ChatStateWithMessages />);

        // Check for messages presence
        await expect(page.getByText('Hello! Can you help me with React?')).toBeVisible();
        await expect(
            page.getByText('Of course! I would be happy to help you with React.'),
        ).toBeVisible();
    });

    test('should handle suggestion click in interactive story', async ({mount, page}) => {
        await mount(<ChatContentStories.Interactive />);

        // Initially should be in empty state
        await expect(page.getByText('Welcome to AI Chat')).toBeVisible();

        // Click on suggestion
        const suggestionButton = page.getByText('Explain React hooks');
        await expect(suggestionButton).toBeVisible();
        await suggestionButton.click();

        // Check that view switched to chat state and user message appeared
        await expect(page.getByText('Explain React hooks')).toBeVisible();
    });

    test('should display long conversation with multiple messages', async ({mount, page}) => {
        await mount(<ChatContentStories.LongConversation />);

        // Check that there are multiple messages
        const messages = page.locator('.g-aikit-base-message');

        // LongConversation should have 8 messages
        await expect(messages).toHaveCount(8);
    });
});
