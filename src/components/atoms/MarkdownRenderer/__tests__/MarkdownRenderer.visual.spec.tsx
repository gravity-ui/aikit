import React from 'react';

import {test} from '~playwright/core';

import {MarkdownRendererStories} from './helpersPlaywright';

test.describe('MarkdownRenderer', {tag: '@MarkdownRenderer'}, () => {
    test('should render basic markdown', async ({mount, expectScreenshot}) => {
        await mount(<MarkdownRendererStories.Playground />);

        await expectScreenshot();
    });
});
