import {expect, test} from '~playwright/core';

import {HistoryStories, PendingPinnedHistory} from './helpersPlaywright';

test.describe('History pinned chats', {tag: '@History'}, () => {
    test('should render controlled pins and reveal actions with keyboard focus', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.PinnedChats />);
        const row = page.getByRole('listitem').filter({hasText: 'Last message from chat 2'});
        const pin = row.getByRole('button', {name: 'Pin chat', exact: true});
        await expect(pin).toHaveCSS('opacity', '0');
        await expectScreenshot({component: page});
        await pin.focus();
        await expect(pin).toHaveCSS('opacity', '1');
        await expect(row.getByRole('button', {name: 'Delete', exact: true})).toHaveCSS(
            'opacity',
            '1',
        );
        await page.keyboard.press('Enter');
        const unpin = row.getByRole('button', {name: 'Unpin chat', exact: true});
        await expect(unpin).toBeFocused();
        await page.keyboard.press('Space');
        await expect(pin).toBeFocused();
        await row.getByRole('button', {name: 'Delete', exact: true}).focus();
        await page.keyboard.press('Space');
        await expect(row).toHaveCount(0);
        await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('should reveal reserved desktop actions on hover and Tab', async ({mount, page}) => {
        await mount(<HistoryStories.PinnedChats />);
        const row = page.getByRole('listitem').filter({hasText: 'Last message from chat 5'});
        const pin = row.getByRole('button', {name: 'Unpin chat', exact: true});
        const remove = row.getByRole('button', {name: 'Delete', exact: true});
        await expect(page.locator('.g-popup').first()).toHaveCSS('opacity', '1');
        await expect(pin).toHaveCSS('opacity', '0');
        const before = await pin.boundingBox();
        await row.hover();
        await expect(pin).toHaveCSS('opacity', '1');
        await expect(remove).toHaveCSS('opacity', '1');
        expect(await pin.boundingBox()).toEqual(before);
        await page.mouse.move(0, 0);
        await page.getByRole('combobox').focus();
        await page.keyboard.press('Tab');
        await expect(remove).toBeFocused();
        await expect(remove).toHaveCSS('opacity', '1');
        await page.keyboard.press('Tab');
        await expect(pin).toBeFocused();
        await expect(pin).toHaveCSS('opacity', '1');
    });

    test('should render local pins and restore them after remounting', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await page.evaluate(() => localStorage.clear());
        let component = await mount(<HistoryStories.LocalPinnedChats />);
        const row = page.getByRole('listitem').filter({hasText: 'Last message from chat 2'});
        await row.hover();
        await row.getByRole('button', {name: 'Pin chat', exact: true}).click();
        await expect(row.getByRole('button', {name: 'Unpin chat', exact: true})).toBeEnabled();
        await component.unmount();
        component = await mount(<HistoryStories.LocalPinnedChats />);
        await expect(row.getByRole('button', {name: 'Unpin chat', exact: true})).toHaveCount(1);
        await page.mouse.move(0, 0);
        await expectScreenshot({component: page});
        await component.unmount();
    });

    test('should render server pins and preserve focus across saving', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.ServerPinnedChats />);
        const row = page.getByRole('listitem').filter({hasText: 'Last message from chat 2'});
        const pin = row.getByRole('button', {name: 'Pin chat', exact: true});
        await expect(pin).toBeEnabled();
        await expectScreenshot({component: page});
        await pin.focus();
        await page.keyboard.press('Enter');
        await expect(pin).toHaveAttribute('aria-disabled', 'true');
        await expect(pin).toBeFocused();
        await expect(row.getByRole('button', {name: 'Unpin chat', exact: true})).toBeFocused();
    });

    for (const outcome of ['resolve', 'reject'] as const) {
        test(`should keep focus and ignore repeat requests during ${outcome} save`, async ({
            mount,
            page,
        }) => {
            await mount(<PendingPinnedHistory />);
            const row = page.getByRole('listitem').filter({hasText: 'Second chat'});
            const pin = row.getByRole('button', {name: 'Pin chat', exact: true});
            await expect(pin).toBeEnabled();
            await pin.focus();
            await page.keyboard.press('Enter');
            await expect(pin).toHaveAttribute('aria-disabled', 'true');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Space');
            await pin.evaluate((button: HTMLButtonElement) => button.click());
            await expect(page.locator('[data-qa="save-count"]')).toHaveText('1');
            await expect(pin).toBeFocused();
            await page
                .getByRole('button', {name: outcome === 'resolve' ? 'Resolve save' : 'Reject save'})
                .evaluate((button: HTMLButtonElement) => button.click());
            const action = row.getByRole('button', {
                name: outcome === 'resolve' ? 'Unpin chat' : 'Pin chat',
                exact: true,
            });
            await expect(action).toBeEnabled();
            await expect(action).toBeFocused();
            if (outcome === 'reject') {
                await expect(page.getByRole('alert')).toHaveText('Save failed');
                await page.keyboard.press('Enter');
                await expect(page.locator('[data-qa="save-count"]')).toHaveText('2');
            }
        });
    }

    test('should not steal focus after a pending save completes', async ({mount, page}) => {
        await mount(<PendingPinnedHistory />);
        const pin = page.getByRole('button', {name: 'Pin chat', exact: true}).last();
        await expect(pin).toBeEnabled();
        await pin.focus();
        await page.keyboard.press('Enter');
        await page.getByRole('button', {name: 'Resolve save'}).click();
        await expect(page.getByRole('button', {name: 'Unpin chat', exact: true})).toBeEnabled();
        await expect(page.getByRole('button', {name: 'Resolve save'})).toBeFocused();
    });
});

test.describe('History pinned mobile', {tag: '@History'}, () => {
    test.use({viewport: {width: 375, height: 700}});
    test('should render mobile pins with both actions always visible', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<HistoryStories.PinnedChatsMobile />);
        const row = page.getByRole('listitem').filter({hasText: 'Last message from chat 5'});
        await expect(row.getByRole('button', {name: 'Unpin chat', exact: true})).toHaveCSS(
            'opacity',
            '1',
        );
        await expect(row.getByRole('button', {name: 'Delete', exact: true})).toHaveCSS(
            'opacity',
            '1',
        );
        await expectScreenshot({component: page});
        await row.getByRole('button', {name: 'Unpin chat', exact: true}).click();
        await expect(row.getByRole('button', {name: 'Pin chat', exact: true})).toBeVisible();
    });
});
