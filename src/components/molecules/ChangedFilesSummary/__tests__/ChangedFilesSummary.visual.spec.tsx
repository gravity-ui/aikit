import {expect, test} from '~playwright/core';

import {ChangedFilesSummaryStories} from './helpersPlaywright';

test.describe('ChangedFilesSummary', {tag: '@ChangedFilesSummary'}, () => {
    test('should open by keyboard and return focus on Escape', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        const component = await mount(<ChangedFilesSummaryStories.Playground />);
        const trigger = component.getByRole('button', {name: /2 files changed/});
        await trigger.focus();
        await trigger.press('Enter');
        const popup = page.getByRole('dialog', {name: 'Changed files', exact: true});
        await expect(popup).toBeVisible();
        await expect(popup.getByRole('button')).toHaveCount(0);
        await expectScreenshot({component: page, fullPage: true});
        await popup.press('Escape');
        await expect(popup).not.toBeVisible();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.mouse.click(2, 2);
        await expect(popup).not.toBeVisible();
    });
    test('should constrain a long list and wrap paths', async ({mount, page, expectScreenshot}) => {
        await mount(<ChangedFilesSummaryStories.LongList />);
        const content = page.locator('.g-aikit-changed-files-summary__content');
        await expect(content).toBeVisible();
        expect(await content.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
        expect(await content.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        await expectScreenshot({component: page, fullPage: true});
    });
    test('should distinguish duplicate basenames by their full paths', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<ChangedFilesSummaryStories.DuplicateBasenames />);
        const popup = page.getByRole('dialog', {name: 'Changed files', exact: true});
        await expect(popup).toContainText('src/client/filters/index.ts');
        await expect(popup).toContainText('src/server/filters/index.ts');
        await expectScreenshot({component: page, fullPage: true});
    });
    test('should disable an empty summary', async ({mount, expectScreenshot}) => {
        const component = await mount(<ChangedFilesSummaryStories.Empty />);
        await expect(component.getByRole('button', {name: /0 files changed/})).toBeDisabled();
        await expectScreenshot();
    });
    test('should render disabled', async ({mount, expectScreenshot}) => {
        const component = await mount(<ChangedFilesSummaryStories.Disabled />);
        await expect(component.getByRole('button', {name: /2 files changed/})).toBeDisabled();
        await expectScreenshot();
    });
    test('should invoke an optional file action', async ({mount, page, expectScreenshot}) => {
        await mount(<ChangedFilesSummaryStories.WithFileAction />);
        await expectScreenshot({component: page, fullPage: true});
        await page.getByRole('button', {name: /^src\/App\.tsx/}).click();
        await expect(page.getByText('Selected: src/App.tsx')).toBeVisible();
        await expect(page.getByRole('dialog')).not.toBeVisible();
    });
    for (const name of [
        'SingleFile',
        'DeletedOnly',
        'CardSingleFile',
        'CardMultipleFiles',
        'CardDisabled',
    ] as const) {
        test(`should render ${name}`, async ({mount, page, expectScreenshot}) => {
            const Story = ChangedFilesSummaryStories[name];
            await mount(<Story />);
            await expectScreenshot({component: page, fullPage: true});
        });
    }
    test('should invoke card preview and reversible fixture undo', async ({mount, page}) => {
        await mount(<ChangedFilesSummaryStories.CardActions />);
        await page.getByRole('button', {name: 'View changes', exact: true}).click();
        await expect(page.getByLabel('Fixture preview')).toBeVisible();
        await page.getByRole('button', {name: 'Undo', exact: true}).click();
        await expect(page.getByRole('status')).toContainText('Fixture changes reverted');
    });
});
