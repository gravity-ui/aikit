import React from 'react';

import {test} from '~playwright/core';

import {ToolMessageStories} from './helpersPlaywright';

test.describe('ToolMessage', {tag: '@ToolMessage'}, () => {
    test('should render playground', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should render waiting submission state', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.WaitingSubmission />);

        await expectScreenshot();
    });

    test('should render waiting confirmation state', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.WaitingConfirmation />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.Loading />);

        await expectScreenshot();
    });

    test('should render with custom header actions', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.CustomHeaderActions />);

        await expectScreenshot();
    });

    test('should render with custom footer actions', async ({mount, expectScreenshot}) => {
        await mount(<ToolMessageStories.CustomFooterActions />);

        await expectScreenshot();
    });
});
