import React from 'react';

import {expect, test} from '~playwright/core';

import {ActionButtonStories} from './helpersPlaywright';

test.describe('ActionButton', {tag: '@ActionButton'}, () => {
    test('should render default with tooltip on hover', async ({mount, expectScreenshot, page}) => {
        await mount(<ActionButtonStories.Default />);

        const button = page.locator('button');

        // Hover over the button to show tooltip
        await button.hover();

        // Wait for tooltip to appear (check by tooltip text content)
        await expect(page.getByText('Edit')).toBeVisible();

        await expectScreenshot();
    });

    test('should render without tooltip on hover', async ({mount, expectScreenshot, page}) => {
        await mount(<ActionButtonStories.WithoutTooltip />);

        const button = page.locator('button');

        // Hover over the button
        await button.hover();

        // Ensure no tooltip appears (check that no popup with common tooltip classes exists)
        const tooltip = page.locator('.g-popup, [class*="popup"]').filter({hasText: /.+/});
        await expect(tooltip).not.toBeVisible();

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
