import {expect, test} from '~playwright/core';

import {AssistantMessageStories, CustomThinkingRendererExample} from './helpersPlaywright';

test.describe('AssistantMessage', {tag: '@AssistantMessage'}, () => {
    test('should render default', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.Playground />);

        await expectScreenshot();
    });

    test('should render simple text message', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithToolCall />);

        await expectScreenshot();
    });

    test('should render text part', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithCustomRenderer />);

        await expectScreenshot();
    });

    test('should render with thinking content', async ({mount, expectScreenshot}) => {
        await mount(<AssistantMessageStories.WithThinkingContent />);

        await expectScreenshot();
    });
    test('should group adjacent thinking parts without hiding text or changing their order', async ({
        mount,
        expectScreenshot,
    }) => {
        const component = await mount(<AssistantMessageStories.WithGroupedThinking />);
        const groups = component.locator('.g-aikit-thinking-message-group');
        await expect(groups).toHaveCount(2);
        await expect(component.getByRole('list')).toHaveCount(0);
        const parts = component.locator('.g-aikit-assistant-message__content > *');
        await expect(parts).toHaveText([
            /2 completed/,
            'The documentation supports this configuration. Checking the limits next.',
            /1 completed/,
            'Use the recommended configuration. All requested values are supported.',
        ]);

        await groups.first().getByRole('button', {expanded: false}).click();
        await expect(groups.first().getByRole('listitem')).toHaveText([
            /Analyzed the request[\s\S]*Identified the required configuration options/,
            /Checked the documentation[\s\S]*Compared the available settings/,
        ]);
        await expect(groups.first().locator('strong')).toHaveText('configuration options');
        await expect(groups.last().getByRole('list')).toHaveCount(0);
        await expectScreenshot();

        await groups.last().getByRole('button', {expanded: false}).click();
        await expect(groups.last().getByRole('listitem')).toHaveCount(1);
        await expect(groups.last().getByText('Verified the limits', {exact: true})).toBeVisible();
        await groups.first().getByRole('button', {expanded: true}).click();
        await expect(groups.first().getByRole('list')).toHaveCount(0);
        await expect(groups.last().getByRole('list')).toBeVisible();
        await expect(
            component.getByText(
                'Use the recommended configuration. All requested values are supported.',
                {exact: true},
            ),
        ).toBeVisible();
    });

    test('custom thinking renderers take precedence over automatic grouping', async ({mount}) => {
        const component = await mount(<CustomThinkingRendererExample />);
        await expect(component.getByText('Custom thinking')).toBeVisible();
        await expect(component.locator('.g-aikit-thinking-message-group')).toHaveCount(0);
    });
});
