import React from 'react';

import {expect, test} from '~playwright/core';

import {RatingBlockStories} from './helpersPlaywright';

test.describe('RatingBlock', {tag: '@RatingBlock'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.Default />);

        await expectScreenshot();
    });

    test('should render with rating', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.WithRating />);

        await expectScreenshot();
    });

    test('should render with dynamic title', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.DynamicTitle />);

        await expectScreenshot();
    });

    test('should render all sizes', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.Sizes />);

        await expectScreenshot();
    });

    test('should render without title', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.WithoutTitle />);

        await expectScreenshot();
    });

    test('should render multiple blocks', async ({mount, expectScreenshot}) => {
        await mount(<RatingBlockStories.MultipleBlocks />);

        await expectScreenshot();
    });

    test('should handle star click', async ({mount, page}) => {
        await mount(<RatingBlockStories.Default />);

        // Wait for rating block to be visible
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        const thirdStar = page.locator('[data-qa="star-rating-button-3"]');
        await thirdStar.click();

        await expect(
            page.locator('[data-qa="star-rating-button-3"][aria-checked="true"]'),
        ).toBeVisible();
    });

    test('should show hover state', async ({mount, page, expectScreenshot}) => {
        await mount(<RatingBlockStories.Default />);

        // Wait for rating block to be visible
        const ratingBlock = page.locator('.g-aikit-rating-block');
        await expect(ratingBlock).toBeVisible();

        const fourthStar = page.locator('[data-qa="star-rating-button-4"]');
        await fourthStar.hover();

        await expectScreenshot();
    });
});
