import {expect, test} from '~playwright/core';

import type {TAssistantMessage, TUserMessage} from '../../../../types/messages';
import {BaseMessageActionType} from '../../../../types/messages';
import {MessageList} from '../MessageList';

import {MessageListStories} from './helpersPlaywright';

/** Reveal action buttons hidden by showActionsOnHover before interacting with them. */
async function hoverAssistantMessage(page: {
    locator: (selector: string) => {hover: () => Promise<void>};
}) {
    await page.locator('.g-aikit-base-message_variant_assistant').hover();
}

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
            el.scrollTo({top: 0});
        });

        await page.waitForTimeout(100);

        // Rating block should still be visible (sticky behavior)
        await expect(ratingBlock).toBeVisible();
    });

    test.describe('action popups', () => {
        test('should open feedback popup on dislike click', async ({mount, page}) => {
            await mount(<MessageListStories.WithFeedbackPopup />);

            await hoverAssistantMessage(page);
            await page.locator('.g-aikit-base-message__actions').getByRole('button').nth(1).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();
            await expect(page.getByText('No answer')).toBeVisible();
        });

        test('should render feedback popup screenshot', async ({mount, page, expectScreenshot}) => {
            await mount(<MessageListStories.WithFeedbackPopup />);

            await hoverAssistantMessage(page);
            await page.locator('.g-aikit-base-message__actions').getByRole('button').nth(1).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await expectScreenshot();
        });

        test('should transition popup to thank you after feedback submit', async ({
            mount,
            page,
        }) => {
            await mount(<MessageListStories.WithFeedbackPopup />);

            await hoverAssistantMessage(page);
            await page.locator('.g-aikit-base-message__actions').getByRole('button').nth(1).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await page.getByText('No answer').click();
            await page.getByRole('button', {name: /submit/i}).click();

            await expect(page.getByText('Thank you for your feedback!')).toBeVisible();
            await expect(page.getByText('What went wrong?')).not.toBeVisible();
        });

        test('should keep message actions visible while feedback popup is open', async ({
            mount,
            page,
        }) => {
            await mount(<MessageListStories.WithFeedbackPopup />);

            const actions = page.locator('.g-aikit-base-message__actions');
            await hoverAssistantMessage(page);
            await actions.getByRole('button').nth(1).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            // Move cursor away from the message (popup stays open)
            await page.mouse.move(0, 0);

            await expect(actions).toBeVisible();
            await expect(actions.getByRole('button')).toHaveCount(3);
        });

        test('should close popup when clicking outside', async ({mount, page}) => {
            await mount(<MessageListStories.WithFeedbackPopup />);

            await hoverAssistantMessage(page);
            await page.locator('.g-aikit-base-message__actions').getByRole('button').nth(1).click();

            await expect(page.getByText('What went wrong?')).toBeVisible();

            await page.keyboard.press('Escape');

            await expect(page.getByText('What went wrong?')).not.toBeVisible();
        });

        test('should open different popups for different actions in WithMultipleActionPopups', async ({
            mount,
            page,
        }) => {
            await mount(<MessageListStories.WithMultipleActionPopups />);

            const actions = page.locator('.g-aikit-base-message__actions').getByRole('button');

            await actions.nth(0).click();
            await expect(page.getByText('What did you like?')).toBeVisible();

            await page.keyboard.press('Escape');
            await expect(page.getByText('What did you like?')).not.toBeVisible();

            await actions.nth(1).click();
            await expect(page.getByText('What went wrong?')).toBeVisible();

            await page.keyboard.press('Escape');

            await actions.nth(2).click();
            await expect(page.getByText('Report issue')).toBeVisible();
        });
    });

    // Virtualization renders only a window of rows, so a 2000-message history must keep the
    // DOM small. Assert the number of mounted rows is far below the total instead of taking a
    // screenshot (dynamically measured rows are not pixel-stable).
    test('should window large history when virtualized', async ({mount, page}) => {
        await mount(<MessageListStories.Virtualized />);

        const rows = page.getByRole('listitem');
        // Wait for the virtualizer to mount its first row before counting; on slower CI the
        // initial render lands after mount() resolves, so a bare count() would race it.
        await expect(rows.first()).toBeVisible();
        const renderedCount = await rows.count();

        expect(renderedCount).toBeGreaterThan(0);
        expect(renderedCount).toBeLessThan(100);
    });

    // Behavioral coverage for useVirtualStickToBottom. Dynamically measured rows are not
    // pixel-stable, so these assert scroll metrics instead of taking screenshots. react-window
    // owns the scroll container, so scroll is measured on the list element, not the root.
    const VIRTUAL_SCROLLER = '.g-aikit-message-list__list';
    const distanceFromBottom = (el: HTMLElement) =>
        el.scrollHeight - el.scrollTop - el.clientHeight;

    test('should preserve viewport when prepending older messages', async ({mount, page}) => {
        await mount(<MessageListStories.VirtualizedWithPreviousMessages />);

        const scroller = page.locator(VIRTUAL_SCROLLER);
        await expect(scroller).toBeVisible();
        // Let the initial pin-to-bottom settle before scrolling up.
        await page.waitForTimeout(200);

        // Scroll to the top so the user is no longer pinned to the bottom; "Message 11" (the story
        // seeds 11-40) is the message on top, and the one a prepend must keep in place.
        await scroller.evaluate((el) => el.scrollTo({top: 0}));
        // The scroll event is dispatched asynchronously - wait for the listener to register the
        // scroll-up before triggering the prepend (otherwise auto-stick treats it as "at bottom").
        await page.waitForTimeout(200);
        const anchor = page.getByText('Message 11', {exact: true});
        await expect(anchor).toBeVisible();
        const before = await anchor.boundingBox();

        // Trigger the load (prepends "Message 1".."Message 10" after the story's delay).
        await page.evaluate(() => window.__loadPreviousMessages?.());

        // The load-more trigger is removed once the (only) older batch has loaded - a reliable
        // "prepend committed" signal (rows above the restored viewport are not rendered, so the
        // older messages themselves are not a dependable locator). Then let the restore settle.
        await expect(page.locator('.g-aikit-message-list__load-trigger')).toHaveCount(0);
        // Wait past the prepend shimmer (it hides the list while the scroll is restored).
        await page.waitForTimeout(500);

        // The previously-visible message keeps its on-screen position (no jump, no snap to top).
        await expect(anchor).toBeVisible();
        const after = await anchor.boundingBox();
        expect(before?.y).toBeDefined();
        expect(after?.y).toBeDefined();
        expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(50);
    });

    test('should stay pinned to the bottom while the streaming row grows', async ({
        mount,
        page,
    }) => {
        await mount(<MessageListStories.VirtualizedStreaming />);

        const scroller = page.locator(VIRTUAL_SCROLLER);
        await expect(scroller).toBeVisible();
        // Let the initial pin-to-bottom settle. The first appendStreamChunk call below also stops
        // the story's auto-stream, so the growth is driven deterministically from here.
        await page.waitForTimeout(200);

        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.__appendStreamChunk?.(' more streaming content'));
            // Allow the streamingSignal pin to re-apply across its post-paint re-measure frames.
            await page.waitForTimeout(150);

            const distance = await scroller.evaluate(distanceFromBottom);
            expect(distance).toBeLessThan(10);
        }
    });

    test('should not auto-scroll when the user scrolled up during streaming', async ({
        mount,
        page,
    }) => {
        await mount(<MessageListStories.VirtualizedStreaming />);

        const scroller = page.locator(VIRTUAL_SCROLLER);
        await expect(scroller).toBeVisible();
        // Let the initial pin-to-bottom settle, then stop the story's auto-stream (empty chunk) so
        // it doesn't pin back to the bottom while we scroll up.
        await page.waitForTimeout(200);
        await page.evaluate(() => window.__appendStreamChunk?.(''));

        await scroller.evaluate((el) => el.scrollTo({top: 0}));
        // The scroll event is dispatched asynchronously - wait for the listener to register the
        // scroll-up (set the "user scrolled up" flag) before the next streamed chunk arrives.
        await page.waitForTimeout(200);
        const distanceBefore = await scroller.evaluate(distanceFromBottom);
        // Sanity: we really are scrolled up (a stray pin didn't pull us back to the bottom).
        expect(distanceBefore).toBeGreaterThan(10);

        await page.evaluate(() => window.__appendStreamChunk?.(' more streaming content'));
        await page.waitForTimeout(150);

        const distanceAfter = await scroller.evaluate(distanceFromBottom);
        // The view stayed near the top - it did not jump to the bottom.
        expect(distanceAfter).toBeGreaterThan(10);
        expect(distanceAfter).toBeGreaterThanOrEqual(distanceBefore - 50);
    });
});
