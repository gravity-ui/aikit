import React from 'react';

import {test} from '~playwright/core';

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
});
