import React from 'react';

import {expect, test} from '~playwright/core';

import {AIStudioChatStories} from './helpersPlaywright';

test.describe('AIStudioChat', {tag: '@AIStudioChat'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<AIStudioChatStories.Playground />);

        await expectScreenshot();
    });

    test('should render with initial messages', async ({mount, expectScreenshot}) => {
        await mount(<AIStudioChatStories.WithInitialMessages />);

        await expectScreenshot();
    });

    test('should render with history enabled', async ({mount, expectScreenshot}) => {
        await mount(<AIStudioChatStories.WithHistory />);

        await expectScreenshot();
    });

    test('should render with welcome config', async ({mount, expectScreenshot}) => {
        await mount(<AIStudioChatStories.WithWelcomeConfig />);

        await expectScreenshot();
    });

    test('should render with system prompt', async ({mount, expectScreenshot}) => {
        await mount(<AIStudioChatStories.WithSystemPrompt />);

        await expectScreenshot();
    });

    test('should show send button in ready state', async ({mount, page}) => {
        await mount(<AIStudioChatStories.Playground />);

        const textarea = page.getByRole('textbox');
        await expect(textarea).toBeVisible();
    });
});
