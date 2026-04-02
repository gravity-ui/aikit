import {expect, test} from '~playwright/core';

import {StarRatingStories} from './helpersPlaywright';

test.describe('StarRating', {tag: '@StarRating'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.Playground />);

        await expectScreenshot();
    });

    test('should render all sizes', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.Sizes />);

        await expectScreenshot();
    });

    test('should render all rating values', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.Values />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.Disabled />);

        await expectScreenshot();
    });

    test('should render interactive state', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.Interactive />);

        await expectScreenshot();
    });

    test('should render with state', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.WithState />);

        await expectScreenshot();
    });

    test('should render custom aria label', async ({mount, expectScreenshot}) => {
        await mount(<StarRatingStories.CustomAriaLabel />);

        await expectScreenshot();
    });

    test('should handle star click', async ({mount, page}) => {
        await mount(<StarRatingStories.Interactive />);

        const thirdStar = page.locator('button[aria-label*="Rate 3"]');
        await thirdStar.click();

        await expect(page.locator('button[aria-checked="true"]')).toHaveCount(1);
        await expect(page.locator('button[aria-label*="Rate 3"]')).toHaveAttribute(
            'aria-checked',
            'true',
        );
    });

    test('should show hover preview', async ({mount, page, expectScreenshot}) => {
        await mount(<StarRatingStories.Interactive />);

        const fourthStar = page.locator('button[aria-label*="Rate 4"]');
        await fourthStar.hover();

        await expectScreenshot();
    });

    test('should not respond to clicks when disabled', async ({mount, page}) => {
        await mount(<StarRatingStories.Disabled />);

        const star = page.locator('button').first();
        await expect(star).toBeDisabled();
    });

    test('should support keyboard navigation', async ({mount, page}) => {
        await mount(<StarRatingStories.Interactive />);

        // Focus first star
        await page.keyboard.press('Tab');
        const firstStar = page.locator('button[aria-label*="Rate 1"]');
        await expect(firstStar).toBeFocused();

        // Press Enter to select
        await page.keyboard.press('Enter');
        await expect(firstStar).toHaveAttribute('aria-checked', 'true');

        // Navigate to second star
        await page.keyboard.press('Tab');
        const secondStar = page.locator('button[aria-label*="Rate 2"]');
        await expect(secondStar).toBeFocused();

        // Press Space to select
        await page.keyboard.press('Space');
        await expect(secondStar).toHaveAttribute('aria-checked', 'true');
    });
});
