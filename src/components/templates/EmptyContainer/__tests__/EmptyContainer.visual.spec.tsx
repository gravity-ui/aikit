import React from 'react';

import {expect, test} from '~playwright/core';

import {EmptyContainerStories} from './helpersPlaywright';

test.describe('EmptyContainer', {tag: '@EmptyContainer'}, () => {
    test('should render playground state', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.Playground />);

        await expectScreenshot();
    });

    test('should render default state with title and description', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<EmptyContainerStories.Default />);

        await expectScreenshot();
    });

    test('should render with image', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithImage />);

        await expectScreenshot();
    });

    test('should render with suggestions', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithSuggestions />);

        await expectScreenshot();
    });

    test('should render minimal content', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.MinimalContent />);

        await expectScreenshot();
    });

    test('should render only description', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.OnlyDescription />);

        await expectScreenshot();
    });

    test('should render custom suggestions', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.CustomSuggestions />);

        await expectScreenshot();
    });

    test('should render long content', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.LongContent />);

        await expectScreenshot();
    });

    test('should display all suggestions from playground', async ({mount, page}) => {
        await mount(<EmptyContainerStories.Playground />);

        // Check that all suggestion buttons are present
        await expect(page.getByText('Summarize recent activity')).toBeVisible();
        await expect(page.getByText('Check code for vulnerabilities')).toBeVisible();
        await expect(page.getByText('Explain project structure')).toBeVisible();
        await expect(page.getByText('Generate documentation')).toBeVisible();
    });

    test('should render with left alignment', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithLeftAlignment />);

        await expectScreenshot();
    });

    test('should render with right alignment', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithRightAlignment />);

        await expectScreenshot();
    });

    test('should render with mixed alignment', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithMixedAlignment />);

        await expectScreenshot();
    });

    test('should render with show more button', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithShowMoreButton />);

        await expectScreenshot();
    });

    test('should render with show more button with custom text', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<EmptyContainerStories.WithShowMoreButtonCustomText />);

        await expectScreenshot();
    });

    test('should render complete example with alignment and show more', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<EmptyContainerStories.CompleteExample />);

        await expectScreenshot();
    });

    test('should render interactive show more example', async ({mount, expectScreenshot}) => {
        await mount(<EmptyContainerStories.WithShowMoreInteractive />);

        await expectScreenshot();
    });

    test('should handle interactive show more button click', async ({mount, page}) => {
        await mount(<EmptyContainerStories.WithShowMoreInteractive />);

        // Initially there should be 2 suggestions
        const initialSuggestions = page.locator('button').filter({hasText: /Summarize|Check/});
        await expect(initialSuggestions.first()).toBeVisible();

        // Click the "Show more" button
        const showMoreButton = page.getByRole('button', {name: /Show more examples/i});
        await expect(showMoreButton).toBeVisible();
        await showMoreButton.click();

        // Check that new suggestions have appeared
        await expect(page.getByText('Explain project structure')).toBeVisible();
    });
});
