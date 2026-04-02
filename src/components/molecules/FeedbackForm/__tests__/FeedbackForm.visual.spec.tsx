import {expect, test} from '~playwright/core';

import {FeedbackFormStories} from './helpersPlaywright';

test.describe('FeedbackForm', {tag: '@FeedbackForm'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state', async ({mount, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Default />);

        await expectScreenshot();
    });

    test('should render with custom labels', async ({mount, expectScreenshot}) => {
        await mount(<FeedbackFormStories.WithCustomLabels />);

        await expectScreenshot();
    });

    test('should render with many options', async ({mount, expectScreenshot}) => {
        await mount(<FeedbackFormStories.ManyOptions />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Disabled />);

        await expectScreenshot();
    });

    test('should render without comment field', async ({mount, page, expectScreenshot}) => {
        await mount(<FeedbackFormStories.WithoutComment />);

        await expect(page.getByRole('textbox')).not.toBeVisible();

        await expectScreenshot();
    });

    test('should show selected reasons', async ({mount, page, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Playground />);

        await page.getByText('No answer').click();
        await page.getByText('Wrong information').click();

        await expectScreenshot();
    });

    test('should show hover state on chip', async ({mount, page, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Playground />);

        await page.getByText('No answer').hover();

        await expectScreenshot();
    });

    test('should show focus state on textarea', async ({mount, page, expectScreenshot}) => {
        await mount(<FeedbackFormStories.Playground />);

        await page.getByRole('textbox').click();

        await expectScreenshot();
    });

    test('should handle interactive demo flow', async ({mount, page}) => {
        await mount(<FeedbackFormStories.InteractiveDemo />);

        await page.getByText('No answer').click();

        await page.getByRole('textbox').fill('Test feedback comment');

        await page.getByRole('button', {name: 'Submit'}).click();

        await expect(page.getByText('Thank you for your feedback!')).toBeVisible();
        await expect(page.getByText('no-answer')).toBeVisible();
    });

    test('should toggle reason selection', async ({mount, page}) => {
        await mount(<FeedbackFormStories.Playground />);

        const reason = page.getByRole('button', {name: 'No answer'});

        await reason.click();
        await expect(reason).toHaveAttribute('aria-pressed', 'true');

        await reason.click();
        await expect(reason).toHaveAttribute('aria-pressed', 'false');
    });

    test('should disable submit button when no reason and no comment', async ({mount, page}) => {
        await mount(<FeedbackFormStories.Playground />);

        await expect(page.getByRole('button', {name: 'Submit'})).toBeDisabled();
    });

    test('should enable submit button when reason is selected', async ({mount, page}) => {
        await mount(<FeedbackFormStories.Playground />);

        await page.getByText('No answer').click();

        await expect(page.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });

    test('should enable submit button when comment is entered', async ({mount, page}) => {
        await mount(<FeedbackFormStories.Playground />);

        await page.getByRole('textbox').fill('Some comment');

        await expect(page.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });

    test('should keep submit disabled when showComment=false and no reason selected', async ({
        mount,
        page,
    }) => {
        await mount(<FeedbackFormStories.WithoutComment />);

        await expect(page.getByRole('button', {name: 'Submit'})).toBeDisabled();
    });

    test('should enable submit when showComment=false and reason is selected', async ({
        mount,
        page,
    }) => {
        await mount(<FeedbackFormStories.WithoutComment />);

        await page.getByText('No answer').click();

        await expect(page.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });
});
