import {test} from '~playwright/core';

import {ToolStatusStories} from './helpersPlaywright';

test.describe('ToolStatus', {tag: '@ToolStatus'}, () => {
    test('should render success state', async ({mount, expectScreenshot}) => {
        await mount(<ToolStatusStories.Success />);

        await expectScreenshot();
    });

    test('should render error state', async ({mount, expectScreenshot}) => {
        await mount(<ToolStatusStories.Error />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<ToolStatusStories.Loading />);

        await expectScreenshot();
    });

    test('should render cancelled state', async ({mount, expectScreenshot}) => {
        await mount(<ToolStatusStories.Cancelled />);

        await expectScreenshot();
    });
});
