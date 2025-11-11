import React from 'react';

import {test} from '~playwright/core';

import {PromptInputBodyStories} from './helpersPlaywright';

test.describe('PromptInputBody', {tag: '@PromptInputBody'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.Default />);

        await expectScreenshot();
    });

    test('should render with value', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.WithValue />);

        await expectScreenshot();
    });

    test('should render multi-line', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.MultiLine />);

        await expectScreenshot();
    });

    test('should render with max length', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.WithMaxLength />);

        await expectScreenshot();
    });

    test('should render with custom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.WithCustomContent />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputBodyStories.Disabled />);

        await expectScreenshot();
    });
});
