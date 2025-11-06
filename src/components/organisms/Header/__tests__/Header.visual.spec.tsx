import React from 'react';

import {test} from '~playwright/core';

import {HeaderStories} from './helpersPlaywright';

test.describe('Header', {tag: '@Header'}, () => {
    test('should render with title', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithTitle />);

        await expectScreenshot();
    });

    test('should render with icon', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithIcon />);

        await expectScreenshot();
    });

    test('should render with preview', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.WithPreview />);

        await expectScreenshot();
    });

    test('should render all title positions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.TitlePositions />);

        await expectScreenshot();
    });

    test('should render all base actions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.BaseActions />);

        await expectScreenshot();
    });

    test('should render with additional actions', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.AdditionalActions />);

        await expectScreenshot();
    });

    test('should render full example', async ({mount, expectScreenshot}) => {
        await mount(<HeaderStories.FullExample />);

        await expectScreenshot();
    });
});
