import {expect, test} from '~playwright/core';

import {ThinkingMessageGroup} from '..';

import {EmptySummaryExample, ThinkingMessageGroupStories} from './helpersPlaywright';

test.describe('ThinkingMessageGroup', {tag: '@ThinkingMessageGroup'}, () => {
    const stories = {
        Legacy: ThinkingMessageGroupStories.Legacy,
        Compact: ThinkingMessageGroupStories.Playground,
        CompactCompleted: ThinkingMessageGroupStories.Completed,
        CompactExpanded: ThinkingMessageGroupStories.CompactExpanded,
        CompactWithoutDetails: ThinkingMessageGroupStories.CompactWithoutDetails,
        CompactCustomRendering: ThinkingMessageGroupStories.CompactCustomRendering,
        CompactTerminalStates: ThinkingMessageGroupStories.CompactTerminalStates,
        CompactNarrow: ThinkingMessageGroupStories.CompactNarrow,
        CompactDark: ThinkingMessageGroupStories.CompactDark,
        CustomHistoryHeight: ThinkingMessageGroupStories.CustomHistoryHeight,
        CompactStreaming: ThinkingMessageGroupStories.CompactStreaming,
        CompactControlled: ThinkingMessageGroupStories.CompactControlled,
    };

    for (const [name, Story] of Object.entries(stories)) {
        test(`should render ${name}`, async ({mount, expectScreenshot}) => {
            await mount(<Story />);
            await expectScreenshot();
        });
    }

    test('should render nothing for an empty history', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroup steps={[]} />);
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
            await expect(component.getByRole('button', {expanded: true})).toBeVisible();
            await component.getByRole('button', {name: 'Add text fragment', exact: true}).click();
            await expect(
                component.getByText(/Detail 1: Checked another configuration option/),
            ).toBeVisible();
            await component.getByRole('button', {name: 'Complete response', exact: true}).click();
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

    test('should contain a long history in a narrow container', async ({mount}) => {
        const component = await mount(<ThinkingMessageGroupStories.CompactNarrow />);
        const root = component.locator('.g-aikit-thinking-message-group');
        expect(await root.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
            true,
        );
        await expect(component.getByRole('button', {expanded: true})).toBeVisible();
        await expect(component.getByRole('listitem')).toHaveCount(50);
        const history = component.getByRole('list');
        await expect(history).toHaveCSS('max-height', '480px');
        expect(
            await history.evaluate((element) => element.scrollHeight > element.clientHeight),
        ).toBe(true);
        await history.focus();
        await history.press('End');
        await expect
            .poll(() => history.evaluate((element) => element.scrollTop))
            .toBeGreaterThan(0);
        await history.press('Home');
        await expect.poll(() => history.evaluate((element) => element.scrollTop)).toBe(0);
        expect(await root.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
            true,
        );
    });
});

test('single completed step keeps its title accessible', async ({mount}) => {
    const component = await mount(
        <ThinkingMessageGroup
            steps={[
                {id: 'one', type: 'custom', title: 'Checked the documentation', status: 'thought'},
            ]}
        />,
    );
    await component.getByRole('button', {expanded: false}).click();
    await expect(component.getByText('Checked the documentation')).toBeVisible();
});

test('empty custom summary does not erase the completed heading', async ({mount}) => {
    const component = await mount(<EmptySummaryExample />);
    await expect(component.getByRole('button')).not.toHaveText('');
});
