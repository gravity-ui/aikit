import type {Page} from '@playwright/test';

import {expect, test} from '~playwright/core';

import {InputContextStories} from './helpersPlaywright';

/** Opens the file dialog from `AttachmentPicker` inside `InputContextProvider`. */
const openInputContextAttachmentDialog = async (page: Page) => {
    const attachButton = page.locator('.g-aikit-attachment-picker__button');
    await attachButton.waitFor({state: 'visible'});
    await attachButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
};

test.describe('InputContext', {tag: '@InputContext'}, () => {
    test('should render playground state', async ({mount, page, expectScreenshot}) => {
        await mount(<InputContextStories.Playground />);
        await openInputContextAttachmentDialog(page);

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should render default state', async ({mount, page, expectScreenshot}) => {
        await mount(<InputContextStories.Default />);
        await openInputContextAttachmentDialog(page);

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should render custom dialog title state', async ({mount, page, expectScreenshot}) => {
        await mount(<InputContextStories.CustomDialogTitle />);
        await openInputContextAttachmentDialog(page);

        await expectScreenshot({component: page, fullPage: true});
    });
});
