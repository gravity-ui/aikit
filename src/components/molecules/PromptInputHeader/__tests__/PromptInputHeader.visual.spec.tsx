import React from 'react';

import {test} from '~playwright/core';

import {PromptInputHeaderStories} from './helpersPlaywright';

test.describe('PromptInputHeader', {tag: '@PromptInputHeader'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.Default />);

        await expectScreenshot();
    });

    test('should render with context indicator', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithContextIndicator />);

        await expectScreenshot();
    });

    test('should render with context indicator number', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithContextIndicatorNumber />);

        await expectScreenshot();
    });

    test('should render with custom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithCustomContent />);

        await expectScreenshot();
    });
});
