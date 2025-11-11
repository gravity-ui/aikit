import React from 'react';

import {test} from '~playwright/core';

import {ToolIndicatorStories} from './helpersPlaywright';

test.describe('ToolIndicator', {tag: '@ToolIndicator'}, () => {
    test('should render success state', async ({mount, expectScreenshot}) => {
        await mount(<ToolIndicatorStories.Success />);

        await expectScreenshot();
    });
    test('should render error state', async ({mount, expectScreenshot}) => {
        await mount(<ToolIndicatorStories.Error />);

        await expectScreenshot();
    });
    test('should render info state', async ({mount, expectScreenshot}) => {
        await mount(<ToolIndicatorStories.Info />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<ToolIndicatorStories.Loading />);

        await expectScreenshot();
    });
});
