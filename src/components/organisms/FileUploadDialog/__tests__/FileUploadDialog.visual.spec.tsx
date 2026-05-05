import type {Page} from '@playwright/test';

import {expect, test} from '~playwright/core';

import {FileUploadDialogStories} from './helpersPlaywright';

const openDialog = async (page: Page) => {
    await page.getByRole('button', {name: 'Open dialog'}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
};

test.describe('FileUploadDialog', {tag: '@FileUploadDialog'}, () => {
    test('should render playground state', async ({mount, page, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.Playground />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render default state', async ({mount, page, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.Default />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render with files state', async ({mount, page, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.WithFiles />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render with apply state', async ({mount, page, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.WithApply />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });

    test('should render images only state', async ({mount, page, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.ImagesOnly />);
        await openDialog(page);

        await expectScreenshot({component: page});
    });
});
