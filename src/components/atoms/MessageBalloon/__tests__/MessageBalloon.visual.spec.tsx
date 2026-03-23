import React from 'react';

import {test} from '~playwright/core';

import {MessageBalloonStories} from './helpersPlaywright';

test.describe('MessageBalloon', {tag: '@MessageBalloon'}, () => {
    test('should render user message', async ({mount, expectScreenshot}) => {
        await mount(<MessageBalloonStories.User />);

        await expectScreenshot();
    });
});
