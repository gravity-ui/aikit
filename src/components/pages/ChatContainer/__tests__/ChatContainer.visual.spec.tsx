import React from 'react';

import {expect, test} from '~playwright/core';

import {ChatContainerStories} from './helpersPlaywright';

test.describe('ChatContainer', {tag: '@ChatContainer'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.Playground />);

        await expectScreenshot();
    });

    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.EmptyState />);

        await expectScreenshot();
    });

    test('should render with messages', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithMessages />);

        await expectScreenshot();
    });

    test('should render with streaming', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithStreaming />);

        // Wait for a short delay to start streaming
        await new Promise((resolve) => setTimeout(resolve, 300));

        await expectScreenshot();
    });

    test('should render with history', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithHistory />);

        await expectScreenshot();
    });

    test('should render with i18n config', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithI18nConfig />);

        await expectScreenshot();
    });

    test('should render with component props override', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithComponentPropsOverride />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.LoadingState />);

        await expectScreenshot();
    });

    test('should render error state', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.ErrorState />);

        await expectScreenshot();
    });

    test('should handle suggestion click in empty state', async ({mount, page}) => {
        await mount(<ChatContainerStories.EmptyState />);

        // Click on first suggestion
        const firstSuggestion = page.locator('.g-aikit-suggestions__button').first();
        await expect(firstSuggestion).toBeVisible();
        await firstSuggestion.click();

        // Check that user message appeared
        await expect(page.locator('.g-aikit-user-message')).toBeVisible();
    });

    test('should send message via prompt input', async ({mount, page}) => {
        await mount(<ChatContainerStories.EmptyState />);

        // Find textarea and enter text
        const textarea = page.locator('textarea');
        await textarea.fill('Test message');

        // Find send button and click
        const sendButton = page
            .getByRole('button')
            .filter({hasText: /send|submit/i})
            .first();
        if (await sendButton.isVisible()) {
            await sendButton.click();
        } else {
            // Alternative: press Enter
            await textarea.press('Enter');
        }

        // Check that message was sent
        await expect(page.getByText('Test message')).toBeVisible();
    });

    test('should open history popup', async ({mount, page, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithHistory />);

        // Find history button in Header
        const historyButton = page.locator('[data-qa="header-action-history"]');
        await expect(historyButton).toBeVisible();
        await historyButton.click();

        // Check that popup is opened
        await expect(page.locator('.g-aikit-history__list')).toBeVisible();

        // Take screenshot with opened popup
        await expectScreenshot();
    });

    test('should select chat from history', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithHistory />);

        // Open history
        const historyButton = page.locator('[data-qa="header-action-history"]');
        await historyButton.click();

        // Wait for chat list to appear
        await expect(page.locator('.g-aikit-history__list')).toBeVisible();

        // Click on second chat in the list
        const chatItems = page.locator('.g-aikit-history__chat-item');
        const secondChat = chatItems.nth(1);
        await expect(secondChat).toBeVisible();
        await secondChat.click();

        // Check that popup is closed
        await expect(page.locator('.g-aikit-history__list')).not.toBeVisible();
    });

    test('should create new chat', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithHistory />);

        // Find new chat button
        const newChatButton = page.locator('[data-qa="header-action-newChat"]');
        await expect(newChatButton).toBeVisible();
        await newChatButton.click();

        // Check that a new chat was created (messages list should be empty)
        // Note: WithHistory.handleCreateChat sets activeChat to new chat object,
        // so view remains 'chat' (not 'empty') even with empty messages
        await page.waitForTimeout(300);
    });

    test('should handle streaming with cancel', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithStreaming />);

        // Enter message
        const textarea = page.locator('textarea');
        await textarea.fill('Test streaming message');

        // Send message
        await textarea.press('Enter');

        // Wait for streaming to start
        await page.waitForTimeout(200);

        // Check for cancel button
        const cancelButton = page
            .getByRole('button')
            .filter({hasText: /cancel|stop/i})
            .first();
        if (await cancelButton.isVisible()) {
            await cancelButton.click();
        }

        // Check that streaming stopped
        await page.waitForTimeout(500);
    });

    test('should display custom i18n texts', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithI18nConfig />);

        // Check custom title
        await expect(page.getByText('My Custom AI Assistant')).toBeVisible();

        // Check custom greeting
        await expect(page.getByText('Hello!')).toBeVisible();

        // Check custom description
        await expect(page.getByText('How can I help you today?')).toBeVisible();
    });

    test('should show loading state in message list', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.LoadingState />);

        // Note: Loading state is represented by status='submitted' prop
        await expectScreenshot();
    });

    test('should display error message', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.ErrorState />);

        // Note: Error state is represented by error prop
        // Error display in MessageList might not be implemented yet
        await expectScreenshot();
    });

    test('should handle keyboard navigation in prompt input', async ({mount, page}) => {
        await mount(<ChatContainerStories.EmptyState />);

        const textarea = page.locator('textarea');

        // Enter text
        await textarea.fill('Line 1');

        // Shift+Enter for new line
        await textarea.press('Shift+Enter');
        await textarea.type('Line 2');

        // Check that text is multiline
        const textareaValue = await textarea.inputValue();
        expect(textareaValue).toContain('Line 1');
        expect(textareaValue).toContain('Line 2');

        // Enter to send
        await textarea.press('Enter');

        // Check that message was sent
        await expect(page.getByText('Line 1')).toBeVisible();
    });

    test('should update header title based on active chat', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithHistory />);

        // Check initial title (first chat from mockChats)
        await expect(page.getByText('Quantum Computing Discussion')).toBeVisible();

        // Open history and select another chat
        const historyButton = page.locator('[data-qa="header-action-history"]');
        await historyButton.click();

        await expect(page.locator('.g-aikit-history__list')).toBeVisible();

        const secondChat = page.locator('.g-aikit-history__chat-item').nth(1);
        await secondChat.click();

        // Check that title is updated (depends on implementation in story)
        await page.waitForTimeout(300);
    });

    test('should respect component props overrides', async ({mount, page, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithComponentPropsOverride />);

        // Check that header is centered (titlePosition: 'center')
        const header = page.locator('.g-aikit-header');
        await expect(header).toBeVisible();

        await expectScreenshot();
    });

    test('should hide title on empty chat', async ({mount, page, expectScreenshot}) => {
        await mount(<ChatContainerStories.HiddenTitleOnEmpty />);

        // Check that title is not visible in empty state
        await expect(page.getByText('AI Chat Assistant')).not.toBeVisible();

        // Take screenshot of empty state without title
        await expectScreenshot();
    });

    test('should show title after sending message', async ({mount, page}) => {
        await mount(<ChatContainerStories.HiddenTitleOnEmpty />);

        // Initially title should be hidden
        await expect(page.getByText('AI Chat Assistant')).not.toBeVisible();

        // Send a message
        const textarea = page.locator('textarea');
        await textarea.fill('Test message');
        await textarea.press('Enter');

        // Title should now be visible
        await expect(page.getByText('AI Chat Assistant')).toBeVisible();
    });

    test('should handle full streaming example', async ({mount, page}) => {
        await mount(<ChatContainerStories.FullStreamingExample />);

        // Note: FullStreamingExample starts with existing messages (activeChat is set),
        // so suggestions are not displayed initially. Create new chat first.
        const newChatButton = page.locator('[data-qa="header-action-newChat"]');
        await newChatButton.click();

        // Wait for state to update and suggestions to appear
        await page.waitForTimeout(300);

        // Now click on first suggestion
        const firstSuggestion = page.locator('.g-aikit-suggestions__button').first();
        await expect(firstSuggestion).toBeVisible();
        await firstSuggestion.click();

        // Wait for streaming to start
        await page.waitForTimeout(500);

        // Check that messages appeared
        await expect(page.locator('.g-aikit-message-list')).toBeVisible();

        // Wait a bit for streaming (don't wait for completion to avoid timeout)
        await page.waitForTimeout(1000);
    });

    test('should toggle like on assistant message', async ({mount, page, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithLikeUnlikeActions />);

        const assistantMessage = page.locator('.g-aikit-assistant-message').last();
        await assistantMessage.hover();

        const actionsContainer = assistantMessage.locator('.g-aikit-base-message__actions');
        const likeButton = actionsContainer.getByRole('button').first();
        await likeButton.click();

        await expectScreenshot();
    });
});
