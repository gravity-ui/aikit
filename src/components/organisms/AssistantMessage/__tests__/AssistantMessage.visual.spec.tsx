import React from 'react';

import {test} from '~playwright/core';

import {AssistantMessageStories} from './helpersPlaywright';

test.describe('AssistantMessage', {tag: '@AssistantMessage'}, () => {
    test('should render default', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should render simple text message', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithToolCall />);

        await expectScreenshot();
    });

    test('should render text part', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithCustomRenderer />);

        await expectScreenshot();
    });

    test('should render with thinking content', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithThinkingContent />);

        await expectScreenshot();
    });
});
