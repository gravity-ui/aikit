import React from 'react';

import {test} from '~playwright/core';

import {SuggestionsStories} from './helpersPlaywright';

test.describe('Suggestions', {tag: '@Suggestions'}, () => {
    test('should render with list layout', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.ListLayout />);

        await expectScreenshot();
    });

    test('should render with list layout with container', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.ListLayoutWithContainer />);

        await expectScreenshot();
    });

    test('should render with grid layout', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.GridLayout />);

        await expectScreenshot();
    });

    test('should render with grid layout with container', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.GridLayoutWithContainer />);

        await expectScreenshot();
    });

    test('should render without ids', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.WithoutIds />);

        await expectScreenshot();
    });

    test('should render single item', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.SingleItem />);

        await expectScreenshot();
    });

    test('should render with text align left', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.TextAlignLeft />);

        await expectScreenshot();
    });

    test('should render with text align center', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.TextAlignCenter />);

        await expectScreenshot();
    });

    test('should render with text align right', async ({mount, expectScreenshot}) => {
        await mount(<SuggestionsStories.TextAlignRight />);

        await expectScreenshot();
    });
});
