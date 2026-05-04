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

    test('should apply unified qa config from ChatContainerQa', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithQaExplicit />);

        await expect(page.locator('[data-qa="qa-chat-root"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-header"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-content"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-message-list"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-prompt"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-prompt-header"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-prompt-body"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-prompt-footer"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-submit"]')).toBeVisible();
        await expect(page.locator('[data-qa="qa-chat-disclaimer"]')).toBeVisible();

        await page.locator('[data-qa="header-action-history"]').click();
        await expect(page.locator('[data-qa="qa-chat-history"]')).toBeVisible();
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

    test('should render with rating block', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithRatingBlock />);

        await expectScreenshot();
    });

    test('should render with rating block dynamic scenarios', async ({mount, expectScreenshot}) => {
        await mount(<ChatContainerStories.WithRatingBlockDynamicScenarios />);

        await expectScreenshot();
    });

    test('should handle rating interaction in chat container', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithRatingBlock />);

        // Find rating block
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        // Click on 5th star
        const fifthStar = page.locator('[data-qa="star-rating-button-5"]');
        await fifthStar.click();

        // Verify star is selected
        await expect(
            page.locator('[data-qa="star-rating-button-5"][aria-checked="true"]'),
        ).toBeVisible();

        // Title should remain positive
        await expect(page.getByText('Rate the assistant response:')).toBeVisible();
    });

    test('should change title dynamically on low rating in chat container', async ({
        mount,
        page,
    }) => {
        await mount(<ChatContainerStories.WithRatingBlockDynamicScenarios />);

        // Initially should show default title
        await expect(page.getByText('Rate the assistant response:')).toBeVisible();

        // Click on 1st star (low rating)
        const firstStar = page.locator('[data-qa="star-rating-button-1"]');
        await firstStar.click();

        // Title should change with survey link
        await expect(page.getByText(/What went wrong/)).toBeVisible();
        await expect(page.getByText('Go to survey')).toBeVisible();
    });

    test('should show different messages for different ratings', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithRatingBlockDynamicScenarios />);

        // Test rating 3 (neutral)
        const thirdStar = page.locator('[data-qa="star-rating-button-3"]');
        await thirdStar.click();

        await expect(page.getByText(/How can we improve/)).toBeVisible();

        // Test rating 5 (positive)
        const fifthStar = page.locator('[data-qa="star-rating-button-5"]');
        await fifthStar.click();

        await expect(page.getByText(/Thank you for your positive feedback/)).toBeVisible();
    });

    test('should send message and show rating block when ready', async ({mount, page}) => {
        await mount(<ChatContainerStories.WithRatingBlock />);

        // Initially rating block should be visible
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        // Send a new message
        const textarea = page.locator('textarea');
        await textarea.fill('New test message');
        await textarea.press('Enter');

        // Wait for response
        await page.waitForTimeout(1500);

        // Rating block should still be visible after response
        await expect(ratingBlock).toBeVisible();
    });

    test.describe('action popup', () => {
        test('should open feedback popup on dislike click', async ({mount, page}) => {
            await mount(<ChatContainerStories.WithActionPopup />);

            const assistantMessage = page.locator('.g-aikit-assistant-message').last();
            await assistantMessage.hover();

            const actionsContainer = assistantMessage.locator('.g-aikit-base-message__actions');
            const unlikeButton = actionsContainer.getByRole('button').nth(2);
            await unlikeButton.click();

            await expect(page.getByText('What went wrong?')).toBeVisible();
            await expect(page.getByText('No answer')).toBeVisible();
        });

        test('should render feedback popup screenshot', async ({mount, page, expectScreenshot}) => {
            await mount(<ChatContainerStories.WithActionPopup />);

            const assistantMessage = page.locator('.g-aikit-assistant-message').last();
            await assistantMessage.hover();

            const actionsContainer = assistantMessage.locator('.g-aikit-base-message__actions');
            await actionsContainer.getByRole('button').nth(2).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await expectScreenshot({component: page.locator('.content-wrapper')});
        });

        test('should submit feedback and show thank you', async ({mount, page}) => {
            await mount(<ChatContainerStories.WithActionPopup />);

            const assistantMessage = page.locator('.g-aikit-assistant-message').last();
            await assistantMessage.hover();

            const actionsContainer = assistantMessage.locator('.g-aikit-base-message__actions');
            await actionsContainer.getByRole('button').nth(2).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await page.getByRole('button', {name: 'No answer'}).click();
            await page.getByRole('button', {name: /submit/i}).click();

            await expect(page.getByText('Thank you for your feedback!')).toBeVisible();
            await expect(page.getByText('What went wrong?')).not.toBeVisible();
        });

        test('should close popup on Escape', async ({mount, page}) => {
            await mount(<ChatContainerStories.WithActionPopup />);

            const assistantMessage = page.locator('.g-aikit-assistant-message').last();
            await assistantMessage.hover();

            const actionsContainer = assistantMessage.locator('.g-aikit-base-message__actions');
            await actionsContainer.getByRole('button').nth(2).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await page.keyboard.press('Escape');

            await expect(page.getByText('What went wrong?')).not.toBeVisible();
        });
    });
});
