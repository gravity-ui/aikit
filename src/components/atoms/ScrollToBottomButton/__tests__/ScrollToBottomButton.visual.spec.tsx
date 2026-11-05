import {expect, test} from '~playwright/core';

import {ScrollToBottomButtonStories as Stories} from './helpersPlaywright';

test.describe('ScrollToBottomButton', {tag: '@ScrollToBottomButton'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<Stories.Playground />);
        await expectScreenshot();
    });
    test('should render streaming state', async ({mount, page, expectScreenshot}) => {
        await mount(<Stories.Streaming />);
        await page.emulateMedia({reducedMotion: 'reduce'});
        const button = page.getByRole('button', {name: 'Scroll to bottom'});
        const arrow = button.locator('.g-aikit-scroll-to-bottom-button__arrow');
        await expect(arrow).toBeHidden();
        await expectScreenshot();
        await button.hover();
        await expect(arrow).toBeVisible();
        await expect(button.locator('.g-aikit-scroll-to-bottom-button__activity')).toBeHidden();
        await expectScreenshot({nameSuffix: 'hover'});
        await page.mouse.move(0, 0);
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused();
        await expect(arrow).toBeVisible();
    });
    test('should render disabled state', async ({mount, page, expectScreenshot}) => {
        await mount(<Stories.Disabled />);
        await expect(page.getByRole('button', {name: 'Scroll to bottom'})).toBeDisabled();
        await expectScreenshot();
    });
});
