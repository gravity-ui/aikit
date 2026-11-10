import {expect, test} from '~playwright/core';

import {ActivityList} from '..';

import {ActivityListStories, EmptySummaryExample, IconModesExample} from './helpersPlaywright';

test.describe('ActivityList', {tag: '@ActivityList'}, () => {
    const stories = {
        Legacy: ActivityListStories.Legacy,
        Presentation: ActivityListStories.Presentation,
        Compact: ActivityListStories.Playground,
        CompactCompleted: ActivityListStories.Completed,
        CompactExpanded: ActivityListStories.CompactExpanded,
        CompactWithoutDetails: ActivityListStories.CompactWithoutDetails,
        CompactCustomRendering: ActivityListStories.CompactCustomRendering,
        CompactTerminalStates: ActivityListStories.CompactTerminalStates,
        CompactNarrow: ActivityListStories.CompactNarrow,
        CompactDark: ActivityListStories.CompactDark,
        CustomHistoryHeight: ActivityListStories.CustomHistoryHeight,
        CompactStreaming: ActivityListStories.CompactStreaming,
        CompactControlled: ActivityListStories.CompactControlled,
    };

    for (const [name, Story] of Object.entries(stories)) {
        test(`should render ${name}`, async ({mount, expectScreenshot}) => {
            await mount(<Story />);
            await expectScreenshot();
        });
    }

    test('should render nothing for an empty history', async ({mount}) => {
        const component = await mount(<ActivityList steps={[]} />);
        await expect(component.locator('.g-aikit-thinking-message-group')).toHaveCount(0);
    });

    test('should reveal types and optional details only after expanding', async ({mount}) => {
        const component = await mount(<ActivityListStories.Playground />);
        const toggle = component.getByRole('button');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(component.getByText('Documentation search', {exact: true})).toHaveCount(0);
        await toggle.click();
        await expect(component.getByRole('listitem')).toHaveCount(2);
        await expect(component.getByText('Documentation search', {exact: true})).toBeVisible();
        await toggle.click();
        await expect(component.getByRole('list')).toHaveCount(0);
    });

    test('should synchronize controlled expansion with the application', async ({mount}) => {
        const component = await mount(
            <ActivityListStories.CompactControlled expanded={false} defaultExpanded />,
        );
        const group = component.locator('.g-aikit-thinking-message-group');
        const toggle = group.getByRole('button');
        const applicationState = component.getByText(/application expanded =/);

        // The controlled value takes precedence over defaultExpanded.
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(group.getByRole('list')).toHaveCount(0);
        await expect(applicationState).toContainText('application expanded = false');

        await component.getByRole('button', {name: 'Expand history externally'}).click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(group.getByRole('list')).toBeVisible();
        await expect(applicationState).toContainText('application expanded = true');

        await component.getByRole('button', {name: 'Collapse history externally'}).click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(group.getByRole('list')).toHaveCount(0);
        await expect(applicationState).toContainText('application expanded = false');

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(group.getByRole('list')).toBeVisible();
        await expect(applicationState).toContainText('application expanded = true');

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(group.getByRole('list')).toHaveCount(0);
        await expect(applicationState).toContainText('application expanded = false');
    });

    for (const controlled of [false, true]) {
        for (const defaultExpanded of [false, true]) {
            test(`should preserve user-selected expansion during updates (controlled: ${controlled}, initially expanded: ${defaultExpanded})`, async ({
                mount,
            }) => {
                const Story = controlled
                    ? ActivityListStories.CompactControlled
                    : ActivityListStories.CompactStreaming;
                const component = await mount(<Story defaultExpanded={defaultExpanded} />);
                const group = component.locator('.g-aikit-thinking-message-group');
                const toggle = group.getByRole('button');
                await expect(toggle).toHaveAttribute('aria-expanded', String(defaultExpanded));
                await toggle.click();
                const chosenExpanded = !defaultExpanded;
                const expectChosenExpansion = async () => {
                    await expect(toggle).toHaveAttribute('aria-expanded', String(chosenExpanded));
                    if (chosenExpanded) {
                        await expect(group.getByRole('list')).toBeVisible();
                    } else {
                        await expect(group.getByRole('list')).toHaveCount(0);
                    }
                    if (controlled) {
                        await expect(component.getByText(/application expanded =/)).toContainText(
                            `application expanded = ${chosenExpanded}`,
                        );
                    }
                };
                await expectChosenExpansion();
                await component
                    .getByRole('button', {name: 'Add text fragment', exact: true})
                    .click();
                await expectChosenExpansion();
                if (chosenExpanded) {
                    await expect(
                        group.getByText(/Detail 1: Checked another configuration option/),
                    ).toBeVisible();
                }
                await component.getByRole('button', {name: 'Add next step', exact: true}).click();
                await expect(component.getByText(/Response status:/)).toContainText(
                    'running · 3 steps',
                );
                await expectChosenExpansion();
                await component
                    .getByRole('button', {name: 'Complete response', exact: true})
                    .click();
                await expect(component.getByText(/Response status:/)).toContainText(
                    'completed · 3 steps',
                );
                await expectChosenExpansion();
                await expect(
                    group.locator('.g-aikit-thinking-message-group__compact-label_active'),
                ).toHaveCount(0);
                if (!chosenExpanded) {
                    await toggle.click();
                }
                await expect(group.getByRole('listitem')).toHaveCount(3);
                await expect(
                    group.getByText(/Detail 1: Checked another configuration option/),
                ).toBeVisible();
                await expect(group.getByText('Checking source 2', {exact: true})).toBeVisible();
            });
        }
    }

    test('should toggle details with the keyboard', async ({mount}) => {
        const component = await mount(<ActivityListStories.Playground />);
        const toggle = component.getByRole('button');
        await toggle.focus();
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await toggle.press('Space');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('should keep icons static and animate only the active text', async ({mount, page}) => {
        await page.emulateMedia({reducedMotion: 'no-preference'});
        const component = await mount(<ActivityListStories.Playground defaultExpanded />);
        const activeLabel = component.locator(
            '.g-aikit-thinking-message-group__compact-label_active',
        );
        await expect(activeLabel).toHaveCount(1);
        await expect(activeLabel).toHaveCSS('animation-name', 'thinking-message-group-pulse');
        await expect
            .poll(async () =>
                activeLabel.evaluate((element) =>
                    parseFloat(getComputedStyle(element).animationDuration),
                ),
            )
            .toBeGreaterThan(0);

        const iconsAndWrappers = component.locator(
            [
                'svg',
                '.g-aikit-thinking-message-group__step-icon',
                '.g-aikit-thinking-message-group__step-marker',
                '.g-aikit-thinking-message-group__step-dot',
                '.g-aikit-thinking-message-group__disclosure',
                '.g-aikit-thinking-message-group__compact-current',
                '.g-aikit-thinking-message-group__compact-heading',
            ].join(', '),
        );
        for (const element of await iconsAndWrappers.all()) {
            await expect(element).toHaveCSS('animation-name', 'none');
        }
    });

    test('should disable animation for every non-running state', async ({mount}) => {
        const component = await mount(<ActivityListStories.CompactTerminalStates />);
        await expect(
            component.locator('.g-aikit-thinking-message-group__compact-label_active'),
        ).toHaveCount(0);
    });

    test('should respect reduced motion', async ({mount, page}) => {
        await page.emulateMedia({reducedMotion: 'reduce'});
        const component = await mount(<ActivityListStories.Playground />);
        await expect(
            component.locator('.g-aikit-thinking-message-group__compact-label_active'),
        ).toHaveCSS('animation-name', 'none');
    });

    test('should not offer expansion when details are unavailable', async ({mount}) => {
        const component = await mount(<ActivityListStories.CompactWithoutDetails />);
        await expect(component.getByText('Processing the request')).toBeVisible();
        await expect(component.getByRole('button')).toHaveCount(0);
    });

    test('should contain a long history in a narrow container', async ({mount}) => {
        const component = await mount(<ActivityListStories.CompactNarrow />);
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

test(
    'single completed step keeps its title accessible',
    {tag: '@ActivityList'},
    async ({mount}) => {
        const component = await mount(
            <ActivityList
                steps={[
                    {
                        id: 'one',
                        type: 'custom',
                        title: 'Checked the documentation',
                        status: 'thought',
                    },
                ]}
            />,
        );
        await component.getByRole('button', {expanded: false}).click();
        await expect(component.getByText('Checked the documentation')).toBeVisible();
    },
);

test(
    'empty custom summary does not erase the completed heading',
    {tag: '@ActivityList'},
    async ({mount}) => {
        const component = await mount(<EmptySummaryExample />);
        await expect(component.getByRole('button')).not.toHaveText('');
    },
);

test.describe('ActivityList presentation', {tag: '@ActivityList'}, () => {
    for (const legacy of [false, true]) {
        test(`preserves supplied icons without a new prop (legacy: ${legacy})`, async ({mount}) => {
            const component = await mount(<IconModesExample legacy={legacy} />);
            await expect(component.locator('[data-qa="operation-icon"]')).toHaveCount(2);
            await expect(component.locator('strong')).toHaveText('Stored details');
            await component.update(<IconModesExample legacy={legacy} status="thought" />);
            await expect(component.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
            await expect(
                component.getByRole('listitem').locator('[data-qa="operation-icon"]'),
            ).toHaveCount(1);
        });
    }

    test('explicit status mode overrides the supplied category icon', async ({mount}) => {
        const component = await mount(<IconModesExample iconMode="status" />);
        await expect(component.locator('[data-qa="operation-icon"]')).toHaveCount(0);
        await expect(
            component
                .getByRole('listitem')
                .getByRole('img', {name: 'In progress'})
                .locator(':scope > svg'),
        ).toHaveCount(1);
    });

    test('defaults to a status icon when the category has no icon', async ({mount}) => {
        const component = await mount(<IconModesExample withIcon={false} />);
        const marker = component.getByRole('listitem').getByRole('img', {name: 'In progress'});
        await expect(marker.locator(':scope > svg')).toHaveCount(1);
        await expect(marker.locator('.g-aikit-thinking-message-group__step-dot')).toHaveCount(0);
    });

    test('type mode preserves category icons and falls back to a dot', async ({mount}) => {
        const component = await mount(<IconModesExample iconMode="type" />);
        await expect(component.locator('[data-qa="operation-icon"]')).toHaveCount(2);
        await component.update(<IconModesExample iconMode="type" withIcon={false} />);
        await expect(
            component.getByRole('listitem').locator('.g-aikit-thinking-message-group__step-dot'),
        ).toHaveCount(1);
    });

    for (const status of ['error', 'cancelled', 'paused'] as const) {
        test(`keeps ${status} identifiable instead of using the category icon`, async ({mount}) => {
            const component = await mount(<IconModesExample iconMode="type" status={status} />);
            await expect(component.locator('[data-qa="operation-icon"]')).toHaveCount(0);
            await expect(
                component
                    .getByRole('listitem')
                    .getByRole('img', {
                        name: {error: 'Failed', cancelled: 'Stopped', paused: 'Waiting'}[status],
                    })
                    .locator(':scope > svg'),
            ).toHaveCount(1);
        });
    }

    test('none mode removes icons and the timeline but preserves accessible status', async ({
        mount,
    }) => {
        const component = await mount(<IconModesExample iconMode="none" status="error" />);
        const step = component.getByRole('listitem');
        await expect(component.locator('[data-qa="operation-icon"]')).toHaveCount(0);
        await expect(step.locator('svg')).toHaveCount(0);
        await expect(step.getByRole('img', {name: 'Failed'})).toHaveAttribute(
            'aria-label',
            'Failed',
        );
        await expect(step.getByText('Failed', {exact: true})).toBeVisible();
        expect(
            await step.evaluate((element) => getComputedStyle(element, '::before').display),
        ).toBe('none');
    });

    test('activeStepLabel changes only the running heading and stops applying on completion', async ({
        mount,
    }) => {
        const component = await mount(<IconModesExample activeStepLabel="Checking the quota" />);
        await expect(component.getByRole('button')).toContainText('Checking the quota');
        await expect(component.getByRole('listitem').getByText('Stored step title')).toBeVisible();
        await expect(component.locator('strong')).toHaveText('Stored details');
        await component.update(
            <IconModesExample activeStepLabel="Checking the quota" status="thought" />,
        );
        await expect(component.getByRole('button')).toContainText('1 completed');
        await expect(component.getByText('Checking the quota')).toHaveCount(0);
        await expect(component.getByRole('listitem').getByText('Stored step title')).toBeVisible();
    });
});
