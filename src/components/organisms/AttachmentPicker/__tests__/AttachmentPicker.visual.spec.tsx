import type {Page} from '@playwright/test';

import {expect, test} from '~playwright/core';

import {AttachmentPickerStories} from './helpersPlaywright';

const openDialog = async (page: Page) => {
    await page.getByRole('button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
};

const openDropdown = async (page: Page) => {
    await page.getByRole('button').click();
    await expect(page.getByRole('menu')).toBeVisible();
};

test.describe('AttachmentPicker', {tag: '@AttachmentPicker'}, () => {
    test('should render playground state with dialog open', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<AttachmentPickerStories.Playground />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render upload only state with dialog open', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<AttachmentPickerStories.UploadOnly />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render with storage dropdown open', async ({mount, page, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.WithStorage />);
        await openDropdown(page);

        await expectScreenshot({component: page});
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.Disabled />);

        await expectScreenshot();
    });
});
