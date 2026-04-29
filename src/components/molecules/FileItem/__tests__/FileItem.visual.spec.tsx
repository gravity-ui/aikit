import React from 'react';

import {test} from '~playwright/core';

import {FileItemStories} from './helpersPlaywright';

test.describe('FileItem', {tag: '@FileItem'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.Default />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.Loading />);

        await expectScreenshot();
    });

    test('should render success state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.Success />);

        await expectScreenshot();
    });

    test('should render error state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.Error />);

        await expectScreenshot();
    });

    test('should render with remove state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.WithRemove />);

        await expectScreenshot();
    });

    test('should render long name state', async ({mount, expectScreenshot}) => {
        await mount(<FileItemStories.LongName />);

        await expectScreenshot();
    });
});
