import React from 'react';

import {expect, test} from '~playwright/core';

import {ActionPopupStories} from './helpersPlaywright';

test.describe('ActionPopup', {tag: '@ActionPopup'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.Playground />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot();
    });

    test('should render with title only', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithTitleOnly />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot();
    });

    test('should render with title and subtitle', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithTitleAndSubtitle />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot();
    });

    test('should render without title or subtitle', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithoutTitleOrSubtitle />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot();
    });

    test('should not show close button when there is no title or subtitle', async ({
        mount,
        page,
    }) => {
        await mount(<ActionPopupStories.WithoutTitleOrSubtitle />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        const closeButton = page.getByRole('button', {name: /close|закрыть/i});
        await expect(closeButton).not.toBeVisible();
    });

    test('should render with form content', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithFormContent />);

        await mount.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot();
    });

    test('should close when close button clicked', async ({mount, page}) => {
        await mount(<ActionPopupStories.WithTitleOnly />);

        const openButton = page.getByRole('button', {name: 'Open Popup'});
        await openButton.click();

        await expect(page.getByText('What went wrong?')).toBeVisible();

        const closeButton = page.getByRole('button', {name: /close|закрыть/i});
        await closeButton.click();

        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });

    test('should handle different placements', async ({mount, expectScreenshot}) => {
        await mount(<ActionPopupStories.DifferentPlacements />);

        await expectScreenshot();
    });

    test('should update content without closing on WithContentChange', async ({mount, page}) => {
        await mount(<ActionPopupStories.WithContentChange />);

        await page.getByRole('button', {name: /Open/i}).click();

        // Popup is open with the form
        await expect(page.getByText('Some feedback content here.')).toBeVisible();

        // Click submit — content changes in-place
        await page.getByRole('button', {name: 'Submit'}).click();

        // Popup stays open, title is gone, new content shown
        await expect(page.getByText(/Thank you/i)).toBeVisible();
        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });

    test('should show feedback form and transition to thank you on WithFeedbackForm', async ({
        mount,
        page,
    }) => {
        await mount(<ActionPopupStories.WithFeedbackForm />);

        await page.getByRole('button', {name: 'Open Feedback Form'}).click();

        // Feedback form is visible
        await expect(page.getByText('What went wrong?')).toBeVisible();
        await expect(page.getByText('No answer')).toBeVisible();

        // Select a reason and submit
        await page.getByText('No answer').click();
        await page.getByRole('button', {name: /submit/i}).click();

        // Content transitions to thank you, title disappears
        await expect(page.getByText('Thank you for your feedback!')).toBeVisible();
        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });
});
