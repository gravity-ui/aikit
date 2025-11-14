import React from 'react';

import {test} from '~playwright/core';

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
        await page.getByText('Summarize recent activity').waitFor();
        await page.getByText('Check code for vulnerabilities').waitFor();
        await page.getByText('Explain project structure').waitFor();
        await page.getByText('Generate documentation').waitFor();
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
        await initialSuggestions.first().waitFor();

        // Click the "Show more" button
        const showMoreButton = page.getByRole('button', {name: /Show more examples/i});
        await showMoreButton.waitFor();
        await showMoreButton.click();

        // Wait for additional suggestions to appear
        await page.waitForTimeout(100);

        // Check that new suggestions have appeared
        await page.getByText('Explain project structure').waitFor();
    });
});
