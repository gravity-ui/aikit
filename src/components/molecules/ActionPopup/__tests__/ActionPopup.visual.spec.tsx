import React from 'react';

import {expect, test} from '~playwright/core';

import {ActionPopupStories} from './helpersPlaywright';

test.describe('ActionPopup', {tag: '@ActionPopup'}, () => {
    test('should render playground state', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.Playground />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot({component: page.locator('.g-aikit-action-popup')});
    });

    test('should render with title only', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithTitleOnly />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot({component: page.locator('.g-aikit-action-popup')});
    });

    test('should render with title and subtitle', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithTitleAndSubtitle />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot({component: page.locator('.g-aikit-action-popup')});
    });

    test('should render without title or subtitle', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithoutTitleOrSubtitle />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot({component: page.locator('.g-aikit-action-popup')});
    });

    test('should not show close button when there is no title or subtitle', async ({
        mount,
        page,
    }) => {
        await mount(<ActionPopupStories.WithoutTitleOrSubtitle />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        const closeButton = page.getByRole('button', {name: /close|закрыть/i});
        await expect(closeButton).not.toBeVisible();
    });

    test('should render with form content', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.WithFormContent />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expectScreenshot({component: page.locator('.g-aikit-action-popup')});
    });

    test('should close when close button clicked', async ({mount, page}) => {
        await mount(<ActionPopupStories.WithTitleOnly />);

        await page.getByRole('button', {name: 'Open Popup'}).click();

        await expect(page.getByText('What went wrong?')).toBeVisible();

        await page.getByRole('button', {name: /close|закрыть/i}).click();

        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });

    test('should handle different placements', async ({mount, page, expectScreenshot}) => {
        await mount(<ActionPopupStories.DifferentPlacements />);

        await page.getByRole('button', {name: 'Bottom'}).click();

        await expectScreenshot();
    });

    test('should update content without closing on WithContentChange', async ({mount, page}) => {
        await mount(<ActionPopupStories.WithContentChange />);

        await page.getByRole('button', {name: /Open/i}).click();

        await expect(page.getByText('Some feedback content here.')).toBeVisible();

        await page.getByRole('button', {name: 'Submit', exact: true}).click();

        await expect(page.getByText(/Thank you/i)).toBeVisible();
        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });

    test('should show feedback form and transition to thank you on WithFeedbackForm', async ({
        mount,
        page,
    }) => {
        await mount(<ActionPopupStories.WithFeedbackForm />);

        await page.getByRole('button', {name: 'Open Feedback Form'}).click();

        await expect(page.getByText('What went wrong?')).toBeVisible();
        await expect(page.getByText('No answer')).toBeVisible();

        await page.getByRole('button', {name: 'No answer'}).click();
        await page.getByRole('button', {name: 'Submit', exact: true}).click();

        await expect(page.getByText('Thank you for your feedback!')).toBeVisible();
        await expect(page.getByText('What went wrong?')).not.toBeVisible();
    });
});
