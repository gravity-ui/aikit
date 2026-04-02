import React from 'react';

import {test} from '~playwright/core';

import {FileUploadDialogStories} from './helpersPlaywright';

test.describe('FileUploadDialog', {tag: '@FileUploadDialog'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.Default />);

        await expectScreenshot();
    });

    test('should render with files state', async ({mount, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.WithFiles />);

        await expectScreenshot();
    });

    test('should render with apply state', async ({mount, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.WithApply />);

        await expectScreenshot();
    });

    test('should render images only state', async ({mount, expectScreenshot}) => {
        await mount(<FileUploadDialogStories.ImagesOnly />);

        await expectScreenshot();
    });
});
