import React from 'react';

import {test} from '~playwright/core';

import {SubmitButtonStories} from './helpersPlaywright';

test.describe('SubmitButton', {tag: '@SubmitButton'}, () => {
    test('should render enabled state', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.Enabled />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.Disabled />);

        await expectScreenshot();
    });

    test('should render loading state', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.Loading />);

        await expectScreenshot();
    });

    test('should render cancelable state', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.Cancelable />);

        await expectScreenshot();
    });

    test('should render all sizes', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.Size />);

        await expectScreenshot();
    });

    test('should render all states', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.States />);

        await expectScreenshot();
    });

    test('should render cancelable state with text', async ({mount, expectScreenshot}) => {
        await mount(<SubmitButtonStories.CancelableWithText />);

        await expectScreenshot();
    });
});
