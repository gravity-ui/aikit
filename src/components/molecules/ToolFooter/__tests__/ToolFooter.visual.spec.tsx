import React from 'react';

import {test} from '~playwright/core';

import {ToolFooterStories} from './helpersPlaywright';

test.describe('ToolFooter', {tag: '@ToolFooter'}, () => {
    test('should render all variants', async ({mount, expectScreenshot}) => {
        await mount(<ToolFooterStories.ConfirmationState />);

        await expectScreenshot();
    });

    test('should render with all actions', async ({mount, expectScreenshot}) => {
        await mount(<ToolFooterStories.WaitingState />);

        await expectScreenshot();
    });
});
