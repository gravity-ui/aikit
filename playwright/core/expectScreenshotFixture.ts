import {expect} from '@playwright/experimental-ct-react';

import type {CaptureScreenshotParams, ExpectScreenshotFixture, PlaywrightFixture} from './types';

const defaultParams: CaptureScreenshotParams = {
    themes: ['light', 'dark'],
};

export const expectScreenshotFixture: PlaywrightFixture<ExpectScreenshotFixture> = async (
    {page},
    use,
    testInfo,
) => {
    const expectScreenshot: ExpectScreenshotFixture = async ({
        component,
        nameSuffix,
        ...pageScreenshotOptions
    } = defaultParams) => {
        const captureScreenshot = async () => {
            return (component || page.locator('.playwright-wrapper-test')).screenshot({
                animations: 'disabled',
                ...pageScreenshotOptions,
            });
        };

        const nameScreenshot =
            testInfo.titlePath.slice(1).join(' ') + (nameSuffix ? ` ${nameSuffix}` : '');

        // Wait for loading of all the images
        const locators = await page.locator('//img').all();
        await Promise.all(
            locators.map((locator) =>
                locator.evaluate(
                    (image: HTMLImageElement) =>
                        image.complete ||
                        new Promise<unknown>((resolve) => image.addEventListener('load', resolve)),
                ),
            ),
        );

        // Wait for loading fonts
        await page.evaluate(() => document.fonts.ready);

        // Wait for the entrance transition of the mounted uikit overlays. They fade in from
        // `opacity: 0`, and Playwright already reports a fully transparent node as visible, so an
        // assertion like `expect(dialog).toBeVisible()` does not hold the capture back on its own.
        const overlays = await page.locator('.g-modal:visible, .g-popup:visible').all();
        await Promise.all(overlays.map((overlay) => expect(overlay).toHaveCSS('opacity', '1')));

        expect(await captureScreenshot()).toMatchSnapshot({
            name: `${nameScreenshot}.png`,
        });
    };

    await use(expectScreenshot);
};
