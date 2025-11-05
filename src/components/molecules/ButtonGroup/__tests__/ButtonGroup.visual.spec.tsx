import React from 'react';

import {test} from '~playwright/core';

import {ButtonGroupStories} from './helpersPlaywright';

test.describe('ButtonGroup', {tag: '@ButtonGroup'}, () => {
    test('should render different orientations', async ({mount, expectScreenshot}) => {
        await mount(<ButtonGroupStories.Orientation />);

        await expectScreenshot();
    });
});
