import React from 'react';

import {test} from '~playwright/core';

import {DisclaimerStories} from './helpersPlaywright';

test.describe('Disclaimer', {tag: '@Disclaimer'}, () => {
    test('should render with text', async ({mount, expectScreenshot}) => {
        await mount(<DisclaimerStories.WithText />);

        await expectScreenshot();
    });

    test('should render with children', async ({mount, expectScreenshot}) => {
        await mount(<DisclaimerStories.WithChildren />);

        await expectScreenshot();
    });

    test('should render with text and children', async ({mount, expectScreenshot}) => {
        await mount(<DisclaimerStories.WithTextAndChildren />);

        await expectScreenshot();
    });

    test('should render with caption variant', async ({mount, expectScreenshot}) => {
        await mount(<DisclaimerStories.WithCaptionVariant />);

        await expectScreenshot();
    });
});
