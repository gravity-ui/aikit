import React from 'react';

import {test} from '~playwright/core';

import {UserMessageStories} from './helpersPlaywright';

test.describe('UserMessage', {tag: '@UserMessage'}, () => {
    test('should render default without avatar', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should render with avatar', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.ShowAvatar />);

        await expectScreenshot();
    });

    test('should render with time', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.ShowTimestamp />);

        await expectScreenshot();
    });
    test('should render with plain text with line breaks', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.PlainTextWithLineBreaks />);

        await expectScreenshot();
    });
    test('should render with markdown format', async ({mount, expectScreenshot}) => {
        await mount(<UserMessageStories.MarkdownFormat />);

        await expectScreenshot();
    });
});
