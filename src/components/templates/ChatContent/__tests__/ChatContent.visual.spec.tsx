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

    test('should render with full prompt input', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.WithFullPromptInput />);

        await expectScreenshot();
    });

    test('should render with streaming state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.WithStreamingState />);

        await expectScreenshot();
    });

    test('should render with disabled input', async ({mount, expectScreenshot}) => {
        await mount(<ChatContentStories.WithDisabledInput />);

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

        // Check that user message appeared
        await expect(page.getByText('Explain React hooks')).toBeVisible();
    });

    test('should show context indicator in full prompt input', async ({mount, page}) => {
        await mount(<ChatContentStories.WithFullPromptInput />);

        // Check for context indicator presence (take first found element)
        const contextIndicator = page.locator('[class*="context-indicator"]').first();
        await expect(contextIndicator).toBeVisible();
    });

    test('should show cancel button in streaming state', async ({mount, page}) => {
        await mount(<ChatContentStories.WithStreamingState />);

        // Enter text in the field to activate cancel button
        const textarea = page.getByRole('textbox');
        await textarea.fill('Test message');

        // Check for cancel button presence in streaming state with text
        // Button has class g-aikit-submit-button_cancelable_true
        const cancelButton = page.locator('[class*="submit-button"][class*="cancelable"]');
        await expect(cancelButton).toBeVisible();
    });

    test('should disable input when disabled prop is true', async ({mount, page}) => {
        await mount(<ChatContentStories.WithDisabledInput />);

        // Check that submit button is in disabled state
        const submitButton = page.locator('[class*="submit-button"]');
        await expect(submitButton).toBeVisible();

        // Verify that button is disabled
        await expect(submitButton).toBeDisabled();
    });

    test('should scroll long conversation content', async ({mount, page}) => {
        await mount(<ChatContentStories.LongConversation />);

        // Check for scrollable content presence
        const contentArea = page.locator('[class*="chat-content__content"]');
        await expect(contentArea).toBeVisible();

        // Check that there are multiple messages (use specific class selector)
        const messages = page.locator('.g-aikit-base-message');

        // LongConversation should have 8 messages
        await expect(messages).toHaveCount(8);
    });
});
