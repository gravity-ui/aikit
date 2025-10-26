import React from 'react';
import {expect, test} from '@playwright/experimental-ct-react';
import {Component} from '../Component';

test.describe('Component', () => {
    test('should render correctly', async ({mount}) => {
        const component = await mount(<Component />);

        // Check that component is visible
        await expect(component).toBeVisible();

        // Check text content
        await expect(component).toContainText('Hello World!');
    });

    test('should match screenshot', async ({mount}) => {
        const component = await mount(<Component />);

        // Take screenshot and compare with baseline
        await expect(component).toHaveScreenshot('component-default.png');
    });

    test('should match screenshot with custom viewport', async ({mount, page}) => {
        // Set viewport size
        await page.setViewportSize({width: 1280, height: 720});

        const component = await mount(<Component />);

        // Take screenshot with specific viewport
        await expect(component).toHaveScreenshot('component-1280x720.png');
    });
});
