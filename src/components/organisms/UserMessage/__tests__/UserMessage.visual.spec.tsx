import React from 'react';

import {test} from '~playwright/core';

import {UserMessageStories} from './helpersPlaywright';

test.describe('UserMessage', {tag: '@UserMessage'}, () => {
    test('should render without avatar', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should not render with avatar', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.ShowAvatar />);

        await expectScreenshot();
    });

    test('should not render with time', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.ShowTimestamp />);

        await expectScreenshot();
    });
});
