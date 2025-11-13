import React from 'react';

import {test} from '~playwright/core';

import {PromptInputPanelStories} from './helpersPlaywright';

test.describe('PromptInputPanel', {tag: '@PromptInputPanel'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputPanelStories.Playground />);

        await expectScreenshot();
    });

    test('should render with swap area', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputPanelStories.WithSwapArea />);

        await expectScreenshot();
    });

    test('should render with content and close button', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputPanelStories.WithContentAndCloseButton />);

        await expectScreenshot();
    });
});
