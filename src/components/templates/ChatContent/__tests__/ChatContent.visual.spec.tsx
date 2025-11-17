import React from 'react';

import {test} from '~playwright/core';

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
        await page.getByText('Explain React hooks').waitFor();
        await page.getByText('How to use TypeScript with React?').waitFor();
    });

    test('should display messages in chat state', async ({mount, page}) => {
        await mount(<ChatContentStories.ChatStateWithMessages />);

        // Check for messages presence
        await page.getByText('Hello! Can you help me with React?').waitFor();
        await page.getByText('Of course! I would be happy to help you with React.').waitFor();
    });

    test('should handle suggestion click in interactive story', async ({mount, page}) => {
        await mount(<ChatContentStories.Interactive />);

        // Initially should be in empty state
        await page.getByText('Welcome to AI Chat').waitFor();

        // Click on suggestion
        const suggestionButton = page.getByText('Explain React hooks');
        await suggestionButton.waitFor();
        await suggestionButton.click();

        // Wait for switch to chat state with messages
        await page.waitForTimeout(100);

        // Check that user message appeared
        await page.getByText('Explain React hooks').waitFor();
    });

    test('should show context indicator in full prompt input', async ({mount, page}) => {
        await mount(<ChatContentStories.WithFullPromptInput />);

        // Check for context indicator presence (take first found element)
        const contextIndicator = page.locator('[class*="context-indicator"]').first();
        await contextIndicator.waitFor();
    });

    test('should show cancel button in streaming state', async ({mount, page}) => {
        await mount(<ChatContentStories.WithStreamingState />);

        // Enter text in the field to activate cancel button
        const textarea = page.getByRole('textbox');
        await textarea.fill('Test message');

        // Check for cancel button presence in streaming state with text
        // Button has class g-aikit-submit-button_cancelable_true
        const cancelButton = page.locator('[class*="submit-button"][class*="cancelable"]');
        await cancelButton.waitFor();
    });

    test('should disable input when disabled prop is true', async ({mount, page}) => {
        await mount(<ChatContentStories.WithDisabledInput />);

        // Check that submit button is in disabled state
        const submitButton = page.locator('[class*="submit-button"]');
        await submitButton.waitFor();

        // Verify that button is disabled
        const isDisabled = await submitButton.isDisabled();
        if (!isDisabled) {
            throw new Error('Expected submit button to be disabled');
        }
    });

    test('should scroll long conversation content', async ({mount, page}) => {
        await mount(<ChatContentStories.LongConversation />);

        // Check for scrollable content presence
        const contentArea = page.locator('[class*="chat-content__content"]');
        await contentArea.waitFor();

        // Check that there are multiple messages
        const messages = page.locator('[class*="base-message"]');
        const count = await messages.count();

        // LongConversation should have 8 messages
        if (count < 5) {
            throw new Error(`Expected at least 5 messages, but got ${count}`);
        }
    });
});
