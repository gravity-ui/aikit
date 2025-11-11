import React from 'react';

import {test} from '~playwright/core';

import {ToolHeaderStories} from './helpersPlaywright';

test.describe('ToolHeader', {tag: '@ToolHeader'}, () => {
    test('should render basic state', async ({mount, expectScreenshot}) => {
        await mount(<ToolHeaderStories.Loading />);

        await expectScreenshot();
    });

    test('should render collapsed state', async ({mount, expectScreenshot}) => {
        await mount(<ToolHeaderStories.Success />);

        await expectScreenshot();
    });
});
