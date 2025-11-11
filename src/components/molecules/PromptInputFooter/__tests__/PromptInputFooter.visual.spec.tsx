import React from 'react';

import {test} from '~playwright/core';

import {PromptInputFooterStories} from './helpersPlaywright';

test.describe('PromptInputFooter', {tag: '@PromptInputFooter'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.Playground />);

        await expectScreenshot();
    });

    test('should render with all icons', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.WithAllIcons />);

        await expectScreenshot();
    });

    test('should render disabled button', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.DisabledButton />);

        await expectScreenshot();
    });

    test('should render loading button', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.LoadingButton />);

        await expectScreenshot();
    });

    test('should render cancelable button', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.CancelableButton />);

        await expectScreenshot();
    });

    test('should render with custom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputFooterStories.WithCustomContent />);

        await expectScreenshot();
    });
});
