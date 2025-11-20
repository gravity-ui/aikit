import React from 'react';

import {test} from '~playwright/core';

import {PromptInputStories} from './helpersPlaywright';

test.describe('PromptInput', {tag: '@PromptInput'}, () => {
    test('should render simple view', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.Playground />);

        await expectScreenshot();
    });

    test('should render full view', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.FullView />);

        await expectScreenshot();
    });

    test('should render with suggestions', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithSuggestions />);

        await expectScreenshot();
    });

    test('should render with suggestions and title', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithSuggestionsAndTitle />);

        await expectScreenshot();
    });

    test('should render with context indicator', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithContextIndicator />);

        await expectScreenshot();
    });

    test('should render with custom top content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithCustomTopContent />);

        await expectScreenshot();
    });

    test('should render with custom bottom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithCustomBottomContent />);

        await expectScreenshot();
    });

    test('should render with top panel', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithTopPanel />);

        await expectScreenshot();
    });

    test('should render with bottom panel', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithBottomPanel />);

        await expectScreenshot();
    });

    test('should render with both panels', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithBothPanels />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.Disabled />);

        await expectScreenshot();
    });
});
