import {expect, test} from '~playwright/core';

import {ContextIndicatorStories} from './helpersPlaywright';

test.describe('ContextIndicator', {tag: '@ContextIndicator'}, () => {
    test('should render all reversed variants', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.AllReversedVariants />);

        await expectScreenshot();
    });
    test('should render all states', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.AllStates />);

        await expectScreenshot();
    });
    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.Empty />);

        await expectScreenshot();
    });
    test('should render full state', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.Full />);

        await expectScreenshot();
    });
    test('should render with gray colors', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.GrayColors />);

        await expectScreenshot();
    });
    test('should render half state', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.Half />);

        await expectScreenshot();
    });
    test('should render playground variant', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.Playground />);

        await expectScreenshot();
    });
    test('should render quarter state', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.Quarter />);

        await expectScreenshot();
    });
    test('should render three quarters state', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.ThreeQuarters />);

        await expectScreenshot();
    });
    test('should render with vertical orientation', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.VerticalOrientation />);

        await expectScreenshot();
    });
    test('should render vertical with number', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.VerticalWithNumber />);

        await expectScreenshot();
    });
    test('should render with number', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithNumber />);

        await expectScreenshot();
    });
    test('should render with number at half', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithNumberHalf />);

        await expectScreenshot();
    });
    test('should render with tooltip string', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithTooltip />);

        await expectScreenshot();
    });
    test('should show tooltip on hover', async ({mount, page, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithTooltip />);

        await page.locator('.g-aikit-context-indicator__container').hover();

        await expect(page.getByText('750 / 1000 tokens used')).toBeVisible();

        await expectScreenshot();
    });
    test('should render with tooltip react node', async ({mount, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithTooltipReactNode />);

        await expectScreenshot();
    });
    test('should show react node tooltip on hover', async ({mount, page, expectScreenshot}) => {
        await mount(<ContextIndicatorStories.WithTooltipReactNode />);

        await page.locator('.g-aikit-context-indicator__container').hover();

        await expect(page.getByText('Context usage')).toBeVisible();

        await expectScreenshot();
    });
});
