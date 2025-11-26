import React from 'react';

import {test} from '~playwright/core';

import {ToolHeaderStories} from './helpersPlaywright';

test.describe('ToolHeader', {tag: '@ToolHeader'}, () => {
    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<ToolHeaderStories.Loading />);

        await expectScreenshot();
    });

    test('should render success state', async ({mount, expectScreenshot}) => {
        await mount(<ToolHeaderStories.Success />);

        await expectScreenshot();
    });

    test('should render cancelled state', async ({mount, expectScreenshot}) => {
        await mount(<ToolHeaderStories.Cancelled />);

        await expectScreenshot();
    });
});
