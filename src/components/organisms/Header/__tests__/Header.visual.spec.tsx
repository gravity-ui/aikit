import {expect, test} from '~playwright/core';

import {HeaderStories} from './helpersPlaywright';

test.describe('Header', {tag: '@Header'}, () => {
    test('should render with title', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithTitle />);

        await expectScreenshot();
    });

    test('should truncate long title with ellipsis', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithLongTitle />);

        await expectScreenshot();
    });

    test('should render with icon', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithIcon />);

        await expectScreenshot();
    });

    test('should render without icon', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithoutIcon />);

        await expectScreenshot();
    });

    test('should render with preview', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithPreview />);

        await expectScreenshot();
    });

    test('should render without title', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithoutTitle />);

        await expectScreenshot();
    });

    test('should render all title positions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.TitlePositions />);

        await expectScreenshot();
    });

    test('should render all base actions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.BaseActions />);

        await expectScreenshot();
    });

    test('should render with additional actions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.AdditionalActions />);

        await expectScreenshot();
    });

    test('should render full example', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.FullExample />);

        await expectScreenshot();
    });

    test('should render with menu items', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithMenuItems />);

        await expectScreenshot();
    });

    test('should render actions on the left', async ({mount, page}) => {
        await mount(<HeaderStories.ActionsPlacementLeft />);

        const title = page.getByText('Menu and history on the left');
        const history = page.locator('[data-qa="header-action-history"]');
        expect((await history.boundingBox())?.x).toBeLessThan((await title.boundingBox())?.x ?? 0);
    });

    test('should apply custom action order and size', async ({mount, page, expectScreenshot}) => {
        await mount(<HeaderStories.CustomActionsOrderAndSize />);

        const buttons = page.locator('.g-aikit-header button');
        await expect(buttons).toHaveCount(4);
        await expect(buttons.nth(0)).toHaveAttribute('data-qa', 'header-action-history');
        await expect(buttons.nth(1)).toHaveAttribute('data-qa', 'header-menu-button');
        await expect(buttons.nth(3)).toHaveAttribute('data-qa', 'header-action-newChat');
        await expect(buttons.nth(0)).toHaveClass(/g-button_size_l/);
        await expectScreenshot();
    });

    test('should render with menu items open', async ({mount, page, expectScreenshot}) => {
        await mount(<HeaderStories.WithMenuItems />);

        await page.locator('[data-qa="header-menu-button"]').click();
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();

        await expectScreenshot({component: menu});
    });
});

test.describe('Header mobile', {tag: '@Header'}, () => {
    test.use({viewport: {width: 375, height: 700}});

    test('should open menu in a sheet in mobile mode', async ({mount, page, expectScreenshot}) => {
        await mount(<HeaderStories.MobileMenuItems />);

        await page.locator('[data-qa="header-menu-button"]').click();
        await expect(page.locator('[data-qa="header-menu-sheet-container"]')).toBeVisible();
        await expect(page.locator('[data-qa="header-menu-item-settings"]')).toBeVisible();
        await page.waitForTimeout(500);

        await expectScreenshot({component: page});
    });

    test('should close the menu sheet after an item click', async ({mount, page}) => {
        await mount(<HeaderStories.MobileMenuItems />);

        await page.locator('[data-qa="header-menu-button"]').click();
        await expect(page.locator('[data-qa="header-menu-sheet"]')).toBeVisible();

        await page.locator('[data-qa="header-menu-item-settings"]').click();

        await expect(page.locator('[data-qa="header-menu-sheet"]')).toBeHidden();
    });
});
