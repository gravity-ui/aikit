import {expect, test} from '~playwright/core';

import {ThinkingMessageGroup} from '..';
import {AssistantMessage} from '../../AssistantMessage';

import {ThinkingMessageGroupStories} from './helpersPlaywright';

test.describe('ThinkingMessageGroup', {tag: '@ThinkingMessageGroup'}, () => {
    const stories = {
        Legacy: ThinkingMessageGroupStories.Legacy,
        SingleCompleted: ThinkingMessageGroupStories.SingleCompleted,
        Compact: ThinkingMessageGroupStories.Playground,
        CompactCompleted: ThinkingMessageGroupStories.Completed,
        CompactExpanded: ThinkingMessageGroupStories.CompactExpanded,
        CompactWithoutDetails: ThinkingMessageGroupStories.CompactWithoutDetails,
        CompactCustomRendering: ThinkingMessageGroupStories.CompactCustomRendering,
        CompactTerminalStates: ThinkingMessageGroupStories.CompactTerminalStates,
        CompactNarrow: ThinkingMessageGroupStories.CompactNarrow,
        CompactDark: ThinkingMessageGroupStories.CompactDark,
        CompactStreaming: ThinkingMessageGroupStories.CompactStreaming,
        CompactControlled: ThinkingMessageGroupStories.CompactControlled,
        CompactInAssistantMessage: ThinkingMessageGroupStories.InAssistantMessage,
    };

    for (const [name, Story] of Object.entries(stories)) {
        test(`should render ${name}`, async ({mount, expectScreenshot}) => {
            await mount(<Story />);
            await expectScreenshot();
        });
    }

    test('should render nothing for an empty history', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.Empty />);
        await expect(component.locator('.g-aikit-thinking-message-group')).toHaveCount(0);
    });

    test('should reveal types and optional details only after expanding', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.Playground />);
        const toggle = component.getByRole('button');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(component.getByText('Documentation search', {exact: true})).toHaveCount(0);
        await toggle.click();
        await expect(component.getByRole('listitem')).toHaveCount(2);
        await expect(component.getByText('Documentation search', {exact: true})).toBeVisible();
        await toggle.click();
        await expect(component.getByRole('list')).toHaveCount(0);
    });

    for (const controlled of [false, true]) {
        test(`should preserve expansion during updates (controlled: ${controlled})`, async ({
            mount,
        }) => {
            const Story = controlled
                ? ThinkingMessageGroupStories.CompactControlled
                : ThinkingMessageGroupStories.CompactStreaming;
            const component = await mount(<Story />);
            const toggle = component.getByRole('button', {expanded: false});
            await toggle.click();
            await component.getByRole('button', {name: 'Append details'}).click();
            await expect(component.getByText('Updated streaming details')).toBeVisible();
            await component.getByRole('button', {name: 'Complete', exact: true}).click();
            await expect(component.getByRole('button', {expanded: true})).toBeVisible();
            await expect(
                component.locator('.g-aikit-thinking-message-group__compact-label_active'),
            ).toHaveCount(0);
        });
    }

    test('should toggle details with the keyboard', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.Playground />);
        const toggle = component.getByRole('button');
        await toggle.focus();
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await toggle.press('Space');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('should keep icons static and animate only the active text', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.Playground />);
        await expect(
            component.locator('.g-aikit-thinking-message-group__compact-label_active'),
        ).toHaveCount(1);
        for (const animationName of await component
            .locator('svg')
            .evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).animationName))) {
            expect(animationName).toBe('none');
        }
    });

    test('should disable animation for every non-running state', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.CompactTerminalStates />);
        await expect(
            component.locator('.g-aikit-thinking-message-group__compact-label_active'),
        ).toHaveCount(0);
    });

    test('should respect reduced motion', async ({mount, page}) => {
        await page.emulateMedia({reducedMotion: 'reduce'});
        const component = await mount(<ThinkingMessageGroupStories.Playground />);
        await expect(
            component.locator('.g-aikit-thinking-message-group__compact-label_active'),
        ).toHaveCSS('animation-name', 'none');
    });

    test('should not offer expansion when details are unavailable', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.CompactWithoutDetails />);
        await expect(component.getByText('Processing the request')).toBeVisible();
        await expect(component.getByRole('button')).toHaveCount(0);
    });

    test('should contain a long history in a narrow container', async ({
        mount,
        expectScreenshot,
    }) => {
        const component = await mount(<ThinkingMessageGroupStories.CompactNarrow />);
        const root = component.locator('.g-aikit-thinking-message-group');
        expect(await root.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
            true,
        );
        await component.getByRole('button').click();
        await expect(component.getByRole('listitem')).toHaveCount(50);
        expect(await root.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
            true,
        );
        await expectScreenshot();
    });
});

test('single completed step keeps its title accessible', async ({mount}) => {
    const component = await mount(<ThinkingMessageGroupStories.SingleCompleted />);
    await component.getByRole('button', {expanded: false}).click();
    await expect(component.getByText('Checked the documentation')).toBeVisible();
});

test('empty custom summary does not erase the completed heading', async ({mount}) => {
    const component = await mount(
        <ThinkingMessageGroup
            steps={[{id: 'one', type: 'reasoning', status: 'thought'}]}
            renderSummary={() => false}
        />,
    );
    await expect(component.getByRole('button')).not.toHaveText('');
});

test('custom thinking renderers take precedence over automatic grouping', async ({mount}) => {
    const component = await mount(
        <AssistantMessage
            thinkingMessageView="grouped"
            messageRendererRegistry={{thinking: {component: () => <div>Custom thinking</div>}}}
            content={[{type: 'thinking', data: {content: 'reasoning', status: 'thinking'}}]}
        />,
    );
    await expect(component.getByText('Custom thinking')).toBeVisible();
    await expect(component.locator('.g-aikit-thinking-message-group')).toHaveCount(0);
});
