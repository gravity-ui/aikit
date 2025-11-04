import React from 'react';

import {test} from '~playwright/core';

import {DiffStatStories} from './helpersPlaywright';

test.describe('DiffStat', {tag: '@DiffStat'}, () => {
    test('should render playground variant', async ({mount, expectScreenshot}) => {
        await mount(<DiffStatStories.Playground />);

        await expectScreenshot();
    });
    test('should render all lengths variants', async ({mount, expectScreenshot}) => {
        await mount(<DiffStatStories.Lengths />);

        await expectScreenshot();
    });
});
