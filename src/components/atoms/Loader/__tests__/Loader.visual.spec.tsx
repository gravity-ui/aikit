import React from 'react';

import {test} from '~playwright/core';

import {LoaderStories} from './helpersPlaywright';

test.describe('Loader', {tag: '@Loader'}, () => {
    test('should render streaming view', async ({mount, expectScreenshot}) => {
        await mount(<LoaderStories.Streaming />);

        await expectScreenshot();
    });

    test('should render loading view', async ({mount, expectScreenshot}) => {
        await mount(<LoaderStories.Loading />);

        await expectScreenshot();
    });

    test('should render all sizes', async ({mount, expectScreenshot}) => {
        await mount(<LoaderStories.Size />);

        await expectScreenshot();
    });
});
