import {expect, test} from '~playwright/core';

import {HistoryStories} from './helpersPlaywright';

test.describe('History', {tag: '@History'}, () => {
    test('should render default view', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.Playground />);

        await expectScreenshot();
    });

    test('should add a tooltip for an overflowing chat label', async ({mount, page}) => {
        await mount(<HistoryStories.Playground />);

        const label = page.locator('.g-aikit-history__chat-content').first();
        const tooltipText = 'Looooooooong last message for example ellipsis from chat 1';

        await label.hover();
        await expect(page.getByRole('tooltip')).toHaveText(tooltipText);
    });

    test('should not add a tooltip for a label without overflow', async ({mount, page}) => {
        await mount(<HistoryStories.Playground />);

        await page.locator('.g-aikit-history__chat-content').nth(1).hover();
        await page.waitForTimeout(400);

        await expect(page.getByRole('tooltip')).toHaveCount(0);
    });

    test('should render with selected chat', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithSelectedChat />);

        await expectScreenshot();
    });

    test('should render with load more button', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithLoadMore />);

        await expectScreenshot();
    });

    test('should render lazy load more state', async ({mount, page, expectScreenshot}) => {
        await mount(<HistoryStories.WithLazyLoadMore />);

        await page.waitForTimeout(1000);

        await expectScreenshot();
    });

    test('should render without search', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutSearch />);

        await expectScreenshot();
    });

    test('should render without grouping', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutGrouping />);

        await expectScreenshot();
    });

    test('should render without actions', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutActions />);

        await expectScreenshot();
    });

    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.EmptyState />);

        await expectScreenshot();
    });

    test('should render with load more and delete', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithLoadMoreAndDelete />);

        await expectScreenshot();
    });

    test('should render with custom empty placeholder', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithCustomEmptyPlaceholder />);

        await expectScreenshot();
    });

    test('should render with custom filter', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithCustomFilter />);

        await expectScreenshot();
    });

    test('should render not force open', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.NotForceOpen />);

        await expectScreenshot();
    });

    test('should dismiss trigger tooltip when history opens', async ({mount, page}) => {
        await mount(<HistoryStories.NotForceOpen />);

        const trigger = page.getByRole('button').first();
        await trigger.hover();
        await expect(page.getByText('Chat History')).toBeVisible();

        await trigger.click();

        await expect(page.locator('.g-aikit-history__container')).toBeVisible();
        await expect(page.getByText('Chat History')).toHaveCount(0);
    });

    test('should use a custom date format for older groups', async ({mount, page}) => {
        await mount(
            <HistoryStories.Playground
                chats={[
                    {
                        id: 'custom-date-chat',
                        name: 'Custom date chat',
                        createTime: '2020-01-15T12:00:00.000Z',
                        metadata: {},
                    },
                ]}
                dateFormat="DD/MM/YYYY"
            />,
        );

        await expect(page.getByText('15/01/2020')).toBeVisible();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.Loading />);

        await expectScreenshot();
    });

    test('should show trash button in loading state while deleting chat', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.DeleteChat />);

        await page.getByRole('button').click();
        await page.locator('.g-aikit-history__container').waitFor({state: 'visible'});

        await page.locator('.g-aikit-history__chat-item').first().hover();
        const deleteButton = page.locator('.g-aikit-history__delete-button').first();
        await deleteButton.hover();
        await expect(page.getByText('Delete')).toBeVisible();

        await deleteButton.click();
        await expect(page.getByText('Delete')).toHaveCount(0);

        await page
            .locator('.g-aikit-history__chat-item_is-delete-processing')
            .waitFor({state: 'visible'});

        await expectScreenshot();
    });

    test('should remove deleted chat from list after deletion completes', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.DeleteChat />);

        await page.getByRole('button').click();
        await page.locator('.g-aikit-history__container').waitFor({state: 'visible'});

        await page.locator('.g-aikit-history__chat-item').first().hover();
        await page.locator('.g-aikit-history__delete-button').first().click();
        await page.mouse.move(0, 0);

        await page.waitForTimeout(1500);

        await expectScreenshot();
    });
});

test.describe('History mobile', {tag: '@History'}, () => {
    test.use({viewport: {width: 375, height: 700}});

    test('should render in a sheet in mobile mode', async ({mount, page, expectScreenshot}) => {
        await mount(<HistoryStories.MobileSheet />);

        await expect(page.locator('[data-qa="history-sheet"]')).toBeVisible();
        await page.waitForTimeout(500);

        await expectScreenshot({component: page});
    });

    test('should hide the sheet title but keep the accessible name', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.MobileSheet showSheetTitle={false} />);

        const sheet = page.getByRole('dialog', {name: 'Chat history'});

        await expect(sheet).toBeVisible();
        await expect(page.getByText('Chat history', {exact: true})).toBeHidden();
        await page.waitForTimeout(500);

        await expectScreenshot({component: page});
    });

    test('should always show delete buttons in mobile mode', async ({mount, page}) => {
        await mount(<HistoryStories.MobileSheet />);

        await expect(page.locator('[data-qa="history-sheet"]')).toBeVisible();

        await expect(page.locator('.g-aikit-history__delete-button').first()).toBeVisible();
    });

    test('should close the sheet after a chat click', async ({mount, page}) => {
        await mount(<HistoryStories.MobileSheet />);

        await expect(page.locator('[data-qa="history-sheet"]')).toBeVisible();

        await page.locator('.g-aikit-history__chat-item').first().click();

        await expect(page.locator('[data-qa="history-sheet"]')).toBeHidden();
    });

    test('should render empty state in a sheet in mobile mode', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.MobileSheetEmptyState />);

        await expect(page.locator('[data-qa="history-sheet"]')).toBeVisible();
        await page.waitForTimeout(500);

        await expectScreenshot({component: page});
    });
});
