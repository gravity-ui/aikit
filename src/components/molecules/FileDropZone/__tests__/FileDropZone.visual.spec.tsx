import React from 'react';

import {test} from '~playwright/core';

import {FileDropZoneStories} from './helpersPlaywright';

test.describe('FileDropZone', {tag: '@FileDropZone'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<FileDropZoneStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<FileDropZoneStories.Default />);

        await expectScreenshot();
    });

    test('should render with hint state', async ({mount, expectScreenshot}) => {
        await mount(<FileDropZoneStories.WithHint />);

        await expectScreenshot();
    });

    test('should render images only state', async ({mount, expectScreenshot}) => {
        await mount(<FileDropZoneStories.ImagesOnly />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<FileDropZoneStories.Disabled />);

        await expectScreenshot();
    });
});
