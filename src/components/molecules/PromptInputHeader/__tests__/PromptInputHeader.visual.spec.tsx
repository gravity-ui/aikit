import React from 'react';

import {test} from '~playwright/core';

import {PromptInputHeaderStories} from './helpersPlaywright';

test.describe('PromptInputHeader', {tag: '@PromptInputHeader'}, () => {
    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.Playground />);

        await expectScreenshot();
    });

    test('should render with context items', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithContextItems />);

        await expectScreenshot();
    });

    test('should render with single context item', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithSingleContextItem />);

        await expectScreenshot();
    });

    test('should render with many context items', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithManyContextItems />);

        await expectScreenshot();
    });

    test('should render with context items and indicator', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithContextItemsAndIndicator />);

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

    test('should render with context items without remove button', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<PromptInputHeaderStories.WithContextItemsWithoutRemove />);

        await expectScreenshot();
    });

    test('should render with mixed context items', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputHeaderStories.WithMixedContextItems />);

        await expectScreenshot();
    });
});
