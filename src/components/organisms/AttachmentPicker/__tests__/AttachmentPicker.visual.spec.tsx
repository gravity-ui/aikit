import React from 'react';

import {test} from '~playwright/core';

import {AttachmentPickerStories} from './helpersPlaywright';

test.describe('AttachmentPicker', {tag: '@AttachmentPicker'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.Playground />);

        await expectScreenshot();
    });

    test('should render upload only state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.UploadOnly />);

        await expectScreenshot();
    });

    test('should render with storage state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.WithStorage />);

        await expectScreenshot();
    });

    test('should render with badge state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.WithBadge />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<AttachmentPickerStories.Disabled />);

        await expectScreenshot();
    });
});
