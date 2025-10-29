import React from 'react';
import {expect, test} from '@playwright/experimental-ct-react';
import {ContextIndicator} from '../index';

test.describe('ContextIndicator', () => {
    test('should render with percent type', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={50} />);

        await expect(component).toBeVisible();
        await expect(component).toContainText('50');
    });

    test('should render with number type', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="number" usedContext={500} maxContext={1000} />,
        );

        await expect(component).toBeVisible();
        await expect(component).toContainText('50');
    });

    test('should render 0% correctly', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={0} />);

        await expect(component).toBeVisible();
        await expect(component).toContainText('0');
    });

    test('should render 100% correctly', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={100} />);

        await expect(component).toBeVisible();
        await expect(component).toContainText('100');
    });

    test('should render with custom className', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="percent" usedContext={75} className="custom-class" />,
        );

        await expect(component).toBeVisible();
        await expect(component).toHaveClass(/custom-class/);
    });

    test('should render with qa attribute', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="percent" usedContext={50} qa="test-indicator" />,
        );

        await expect(component).toHaveAttribute('data-qa', 'test-indicator');
    });

    test('should render with vertical orientation', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="percent" usedContext={50} orientation="vertical" />,
        );

        await expect(component).toBeVisible();
        await expect(component).toContainText('50');
    });

    test('should match screenshot - default (0%)', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={0} />);

        await expect(component).toHaveScreenshot('context-indicator-0-percent.png');
    });

    test('should match screenshot - 25%', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={25} />);

        await expect(component).toHaveScreenshot('context-indicator-25-percent.png');
    });

    test('should match screenshot - 50%', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={50} />);

        await expect(component).toHaveScreenshot('context-indicator-50-percent.png');
    });

    test('should match screenshot - 75%', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={75} />);

        await expect(component).toHaveScreenshot('context-indicator-75-percent.png');
    });

    test('should match screenshot - 100%', async ({mount}) => {
        const component = await mount(<ContextIndicator type="percent" usedContext={100} />);

        await expect(component).toHaveScreenshot('context-indicator-100-percent.png');
    });

    test('should match screenshot - number type', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="number" usedContext={750} maxContext={1000} />,
        );

        await expect(component).toHaveScreenshot('context-indicator-number-type.png');
    });

    test('should match screenshot - vertical orientation', async ({mount}) => {
        const component = await mount(
            <ContextIndicator type="percent" usedContext={50} orientation="vertical" />,
        );

        await expect(component).toHaveScreenshot('context-indicator-vertical.png');
    });

    test('should match screenshot with custom viewport', async ({mount, page}) => {
        await page.setViewportSize({width: 1280, height: 720});

        const component = await mount(<ContextIndicator type="percent" usedContext={50} />);

        await expect(component).toHaveScreenshot('context-indicator-1280x720.png');
    });
});
