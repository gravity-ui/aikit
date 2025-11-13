import React from 'react';

import {test} from '~playwright/core';

import {TabsStories} from './helpersPlaywright';

test.describe('Tabs', {tag: '@Tabs'}, () => {
    test('should render basic tabs', async ({mount, expectScreenshot}) => {
        await mount(<TabsStories.Basic />);

        await expectScreenshot();
    });

    test('should render tabs with icons', async ({mount, expectScreenshot}) => {
        await mount(<TabsStories.WithIcons />);

        await expectScreenshot();
    });

    test('should render tabs with custom style', async ({mount, expectScreenshot}) => {
        await mount(<TabsStories.WithStyle />);

        await expectScreenshot();
    });

    test('should render tabs with max width', async ({mount, expectScreenshot}) => {
        await mount(<TabsStories.MaxWidth />);

        await expectScreenshot();
    });
});
