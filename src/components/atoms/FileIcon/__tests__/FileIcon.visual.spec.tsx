import React from 'react';

import {test} from '~playwright/core';

import {FileIconStories} from './helpersPlaywright';

test.describe('FileIcon', {tag: '@FileIcon'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Default />);

        await expectScreenshot();
    });

    test('should render image state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Image />);

        await expectScreenshot();
    });

    test('should render code state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Code />);

        await expectScreenshot();
    });

    test('should render archive state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Archive />);

        await expectScreenshot();
    });

    test('should render sizes state', async ({mount, expectScreenshot}) => {
        await mount(<FileIconStories.Sizes />);

        await expectScreenshot();
    });
});
