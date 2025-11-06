import React from 'react';

import {test} from '~playwright/core';

import {AlertStories} from './helpersPlaywright';

test.describe('Alert', {tag: '@Alert'}, () => {
    test('should render different variant', async ({mount, expectScreenshot}) => {
        await mount(<AlertStories.Variant />);

        await expectScreenshot();
    });

    test('should render action button', async ({mount, expectScreenshot}) => {
        await mount(<AlertStories.Action />);

        await expectScreenshot();
    });
});
