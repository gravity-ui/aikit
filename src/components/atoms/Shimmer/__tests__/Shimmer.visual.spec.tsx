import React from 'react';

import {test} from '~playwright/core';

import {ShimmerStories} from './helpersPlaywright';

test.describe('Shimmer', {tag: '@Shimmer'}, () => {
    test('should render text state', async ({mount, expectScreenshot}) => {
        await mount(<ShimmerStories.Playground />);

        await expectScreenshot();
    });
});
