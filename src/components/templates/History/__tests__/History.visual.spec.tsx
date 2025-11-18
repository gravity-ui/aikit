import React from 'react';

import {test} from '~playwright/core';

import {HistoryStories} from './helpersPlaywright';

test.describe('History', {tag: '@History'}, () => {
    test('should render default view', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.Playground />);

        await expectScreenshot();
    });

    test('should render with selected chat', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithSelectedChat />);

        await expectScreenshot();
    });

    test('should render with load more button', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithLoadMore />);

        await expectScreenshot();
    });

    test('should render without search', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutSearch />);

        await expectScreenshot();
    });

    test('should render without grouping', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutGrouping />);

        await expectScreenshot();
    });

    test('should render without actions', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithoutActions />);

        await expectScreenshot();
    });

    test('should render empty state', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.EmptyState />);

        await expectScreenshot();
    });

    test('should render with load more and delete', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithLoadMoreAndDelete />);

        await expectScreenshot();
    });

    test('should render with custom empty placeholder', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithCustomEmptyPlaceholder />);

        await expectScreenshot();
    });

    test('should render with custom filter', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.WithCustomFilter />);

        await expectScreenshot();
    });

    test('should render not force open', async ({mount, expectScreenshot}) => {
        await mount(<HistoryStories.NotForceOpen />);

        await expectScreenshot();
    });
});
