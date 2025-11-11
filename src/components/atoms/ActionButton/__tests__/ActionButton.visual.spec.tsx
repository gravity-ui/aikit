import React from 'react';

import {test} from '~playwright/core';

import {ActionButtonStories} from './helpersPlaywright';

test.describe('ActionButton', {tag: '@ActionButton'}, () => {
    test('should render default with tooltip on hover', async ({mount, expectScreenshot, page}) => {
        await mount(<ActionButtonStories.Default />);

        // Hover over the button to show tooltip
        await page.locator('button').hover();

        // Wait for tooltip to appear
        await page.waitForTimeout(500);

        await expectScreenshot();
    });

    test('should render without tooltip on hover', async ({mount, expectScreenshot, page}) => {
        await mount(<ActionButtonStories.WithoutTooltip />);

        // Hover over the button
        await page.locator('button').hover();

        // Wait to ensure no tooltip appears
        await page.waitForTimeout(500);

        await expectScreenshot();
    });

    test('should render default button without hover', async ({mount, expectScreenshot}) => {
        await mount(<ActionButtonStories.Default />);

        await expectScreenshot();
    });

    test('should render button without tooltip', async ({mount, expectScreenshot}) => {
        await mount(<ActionButtonStories.WithoutTooltip />);

        await expectScreenshot();
    });
});
