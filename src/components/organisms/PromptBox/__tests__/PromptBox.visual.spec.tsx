import React from 'react';

import {test} from '~playwright/core';

import {PromptBoxStories} from './helpersPlaywright';

test.describe('PromptBox', {tag: '@PromptBox'}, () => {
    test('should render simple view', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.Playground />);

        await expectScreenshot();
    });

    test('should render full view', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.FullView />);

        await expectScreenshot();
    });

    test('should render with suggestions', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.WithSuggestions />);

        await expectScreenshot();
    });

    test('should render with context indicator', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.WithContextIndicator />);

        await expectScreenshot();
    });

    test('should render with custom top content', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.WithCustomTopContent />);

        await expectScreenshot();
    });

    test('should render with custom bottom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.WithCustomBottomContent />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<PromptBoxStories.Disabled />);

        await expectScreenshot();
    });
});
