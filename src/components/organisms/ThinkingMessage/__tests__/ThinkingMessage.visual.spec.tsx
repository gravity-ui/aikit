import React from 'react';

import {test} from '~playwright/core';

import {ThinkingMessageStories} from './helpersPlaywright';

test.describe('ThinkingMessage', {tag: '@ThinkingMessage'}, () => {
    test('should render playground', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should render thinking state', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.ThinkingState />);

        await expectScreenshot();
    });

    test('should render thought state', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.ThoughtState />);

        await expectScreenshot();
    });

    test('should render single content', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.SingleContent />);

        await expectScreenshot();
    });

    test('should render collapsed', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.Collapsed />);

        await expectScreenshot();
    });

    test('should render without loader', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.WithoutLoader />);

        await expectScreenshot();
    });

    test('should render with copy action', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.WithCopyAction />);

        await expectScreenshot();
    });

    test('should render with custom style', async ({mount, expectScreenshot}) => {
        await mount(<ThinkingMessageStories.WithCustomStyle />);

        await expectScreenshot();
    });
});
