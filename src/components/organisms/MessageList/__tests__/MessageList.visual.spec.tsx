import React from 'react';

import {test} from '~playwright/core';

import {MessageListStories} from './helpersPlaywright';

test.describe('MessageList', {tag: '@MessageList'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.Playground />);

        await expectScreenshot();
    });

    test('should render with tool message', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithToolMessage />);

        await expectScreenshot();
    });

    test('should render with custom message type', async ({mount, expectScreenshot}) => {
        await mount(<MessageListStories.WithCustomMessageType />);

        await expectScreenshot();
    });
});
