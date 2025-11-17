import React from 'react';

import {test} from '~playwright/core';

import {ContextItemStories} from './helpersPlaywright';

test.describe('ContextItem', {tag: '@ContextItem'}, () => {
    test('should render playground variant', async ({mount, expectScreenshot}) => {
        await mount(<ContextItemStories.Playground />);

        await expectScreenshot();
    });
});
