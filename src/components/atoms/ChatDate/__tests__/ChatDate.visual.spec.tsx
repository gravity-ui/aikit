import React from 'react';

import {test} from '~playwright/core';

import {ChatDateStories} from './helpersPlaywright';

test.describe('ChatDate', {tag: '@ChatDate'}, () => {
    test('should render with date string', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.DateString />);

        await expectScreenshot();
    });

    test('should render with date object', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.DateObject />);

        await expectScreenshot();
    });

    test('should render with timestamp', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.Timestamp />);

        await expectScreenshot();
    });

    test('should render with time', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.WithTime />);

        await expectScreenshot();
    });

    test('should render with custom format', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.CustomFormat />);

        await expectScreenshot();
    });

    test('should render with custom format and time', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.CustomFormatWithTime />);

        await expectScreenshot();
    });

    test('should render with custom style', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.WithCustomStyle />);

        await expectScreenshot();
    });

    test('should render different formats', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.DifferentFormats />);

        await expectScreenshot();
    });

    test('should render different date types', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.DifferentDateTypes />);

        await expectScreenshot();
    });

    test('should render recent dates', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.RecentDates />);

        await expectScreenshot();
    });

    test('should render invalid date', async ({mount, expectScreenshot}) => {
        await mount(<ChatDateStories.InvalidDate />);

        await expectScreenshot();
    });
});
