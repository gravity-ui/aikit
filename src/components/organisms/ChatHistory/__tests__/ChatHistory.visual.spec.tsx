import React from 'react';

import {test} from '~playwright/core';

import {ChatHistoryStories} from './helpersPlaywright';

test.describe('ChatHistory', {tag: '@ChatHistory'}, () => {
    test('should render default view', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.Playground />);

        await expectScreenshot();
    });

    test('should render with selected chat', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithSelectedChat />);

        await expectScreenshot();
    });

    test('should render with load more button', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithLoadMore />);

        await expectScreenshot();
    });

    test('should render without search', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithoutSearch />);

        await expectScreenshot();
    });

    test('should render without grouping', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithoutGrouping />);

        await expectScreenshot();
    });

    test('should render without actions', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithoutActions />);

        await expectScreenshot();
    });

    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.EmptyState />);

        await expectScreenshot();
    });

    test('should render with load more and delete', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithLoadMoreAndDelete />);

        await expectScreenshot();
    });

    test('should render with custom empty placeholder', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithCustomEmptyPlaceholder />);

        await expectScreenshot();
    });

    test('should render with custom filter', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.WithCustomFilter />);

        await expectScreenshot();
    });

    test('should render not force open', async ({mount, expectScreenshot}) => {
        await mount(<ChatHistoryStories.NotForceOpen />);

        await expectScreenshot();
    });
});
