import React from 'react';

import {test} from '~playwright/core';

import {BaseMessageStories} from './helpersPlaywright';

test.describe('BaseMessage', {tag: '@BaseMessage'}, () => {
    test('should render different type of messages', async ({mount, expectScreenshot}) => {
        await mount(<BaseMessageStories.Variant />);

        await expectScreenshot();
    });

    test('should not render buttons when showActionsOnHover is true', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<BaseMessageStories.ShowActionsOnHover />);

        await expectScreenshot();
    });

    test('should render timestamp', async ({mount, expectScreenshot}) => {
        await mount(<BaseMessageStories.ShowTimestamp />);

        await expectScreenshot();
    });
});
