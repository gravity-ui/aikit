import {expect, test} from '~playwright/core';

import {AgentChatStories} from './helpersPlaywright';

test.describe('AgentChat', {tag: '@AgentChat'}, () => {
    test('should ask a clarification question and continue after an answer', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await page.clock.setFixedTime(new Date('2026-11-10T19:26:00Z'));
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '1 question', exact: true}).check();
        await component
            .getByPlaceholder('Plan, code, build and test anything')
            .fill('Add accent color settings for workspaces.');
        await component.getByPlaceholder('Plan, code, build and test anything').press('Enter');
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question).toBeVisible();
        await expect(question.locator('[data-question-answer]').first()).toBeFocused();
        await expect(question).toHaveClass(/keyboard-focus/);
        await expectScreenshot();
        await question.getByRole('button', {name: /Independent/}).click();
        await expect(question).toHaveCount(0);
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toBeVisible();
        await expect(
            component.getByText('Each workspace gets an accent color selector.', {exact: false}),
        ).toBeVisible();
    });
    test('should submit an option named custom with Enter and record its answer', async ({
        mount,
    }) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: 'Replace input', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await question.getByRole('button', {name: /^Shared with overrides/}).press('Enter');
        await expect(question).toHaveCount(0);
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        await expect(
            component.getByText(
                'Workspaces inherit the organization accent color by default and can save their own override.',
                {exact: true},
            ),
        ).toBeVisible();
    });
    test('should replace the composer and preserve drafts when switching placement', async ({
        mount,
    }) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '1 question', exact: true}).check();
        await component.getByRole('radio', {name: 'Replace input', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question).toBeVisible();
        await expect(question.locator('.g-aikit-tool-footer')).toHaveCount(0);
        await expect(
            component.getByPlaceholder('Plan, code, build and test anything'),
        ).toBeHidden();
        await question.getByRole('textbox').fill('Use a custom workspace palette.');
        await component.getByRole('radio', {name: 'Inline', exact: true}).check();
        await expect(question.locator('.g-aikit-tool-footer')).toHaveCount(0);
        await expect(
            component
                .getByRole('button', {name: 'Waiting for your response', exact: true})
                .locator('.g-aikit-shimmer__container'),
        ).toBeVisible();
        await expect(question.getByRole('textbox')).toHaveValue('Use a custom workspace palette.');
        await expect(
            component.getByPlaceholder('Plan, code, build and test anything'),
        ).toBeVisible();
        await component.getByRole('radio', {name: 'Replace input', exact: true}).check();
        await expect(question.getByRole('textbox')).toHaveValue('Use a custom workspace palette.');
        await question.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect(question).toHaveCount(0);
        await expect(
            component.getByPlaceholder('Plan, code, build and test anything'),
        ).toBeVisible();
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toBeVisible();
    });
    test('should preserve the composer draft and return focus after replacement', async ({
        mount,
    }) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '1 question', exact: true}).check();
        await component.getByRole('radio', {name: 'Replace input', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const composer = component.getByPlaceholder('Plan, code, build and test anything');
        await composer.fill('Follow-up draft');
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question).toBeVisible();
        await expect(question.locator('[data-question-answer]').first()).toBeFocused();
        await expect(composer).toBeHidden();
        await expect(composer).toHaveValue('Follow-up draft');
        await question.getByRole('button', {name: /^Shared Recommended/}).click();
        await expect(composer).toBeVisible();
        await expect(composer).toBeFocused();
        await expect(composer).toHaveValue('Follow-up draft');
    });
    test('should wait for all three answers and preserve navigation drafts', async ({mount}) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '3 questions', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question.getByText('1 of 3')).toBeVisible();
        await expect(
            question.getByRole('progressbar', {name: 'Answered questions'}),
        ).toHaveAttribute('aria-valuenow', '0');
        await question.getByRole('textbox').fill('A custom workspace accent.');
        await question.getByRole('button', {name: 'Next question', exact: true}).click();
        await expect(question.getByText('2 of 3')).toBeVisible();
        await expect(question.getByRole('textbox')).toBeVisible();
        await question.getByRole('button', {name: 'Previous question', exact: true}).click();
        await expect(question.getByRole('textbox')).toHaveValue('A custom workspace accent.');
        await question.getByRole('button', {name: /^Shared Recommended/}).click();
        await question.getByRole('button', {name: /Light and dark/}).click();
        await expect(
            question.getByRole('progressbar', {name: 'Answered questions'}),
        ).toHaveAttribute('aria-valuenow', '2');
        await expect(question.getByText('3 of 3')).toBeVisible();
        await expect(
            question
                .locator(
                    '.g-aikit-ask-user-question__progress-segment_answered .g-aikit-ask-user-question__progress-fill',
                )
                .first(),
        ).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toHaveCount(0);
        await question.getByRole('button', {name: 'Previous question', exact: true}).click();
        await expect(component.getByText('Your answer: Light and dark')).toBeVisible();
        await expect(question.getByRole('button', {name: /Light and dark/})).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        await expect(question.getByRole('button', {name: /Light and dark/})).toHaveClass(
            /option_selected/,
        );
        await question.getByRole('button', {name: 'Next question', exact: true}).click();
        await question.getByRole('button', {name: /Product default/}).click();
        await expect(question).toHaveCount(0);
        await component
            .getByRole('button', {name: 'Update workspace appearance', exact: true})
            .click();
        for (let index = 1; index <= 3; index += 1) {
            await expect(
                component.getByText(`Your response ${index} of 3`, {exact: true}),
            ).toBeVisible();
        }
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toBeVisible();
    });
    test('should expose message actions and regenerate with saved answers', async ({mount}) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '1 question', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question).toBeVisible();
        await expect(
            component.locator(
                '.g-aikit-base-message_variant_assistant .g-aikit-base-message__actions button',
            ),
        ).toHaveCount(0);
        await question.getByRole('button', {name: /Independent/}).click();
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        const actions = component.locator(
            '.g-aikit-base-message_variant_assistant .g-aikit-base-message__actions button',
        );
        await expect(actions).toHaveCount(4);
        await expect(
            component.locator(
                '.g-aikit-base-message_variant_user .g-aikit-base-message__actions button',
            ),
        ).toHaveCount(1);
        await actions.nth(1).click();
        await expect(question).toHaveCount(0);
        await expect(
            component.getByRole('button', {name: 'Update workspace appearance', exact: true}),
        ).toBeVisible();
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        await expect(
            component.getByText('Each workspace gets an accent color selector.', {exact: false}),
        ).toBeVisible();
    });
    test('should skip unanswered questions without selecting defaults', async ({mount}) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '3 questions', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await question.getByRole('button', {name: /Independent/}).click();
        await question.getByRole('button', {name: 'Skip', exact: true}).click();
        await expect(question).toHaveCount(0);
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings review'}),
        ).toBeVisible();
        await expect(
            component
                .getByRole('listitem')
                .filter({hasText: 'Skipped — no answer provided.'})
                .first(),
        ).toBeVisible();
        await expect(component.getByText('Use a shared accent color.', {exact: true})).toHaveCount(
            0,
        );
    });
    test('should show a loader before reasoning and tool activity', async ({mount}) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        await expect(component.locator('.g-aikit-message-list__loader')).toBeVisible();
        await expect(
            component.getByRole('button', {
                name: 'Planning workspace appearance settings',
                exact: true,
            }),
        ).toBeVisible();
        await expect(
            component.getByRole('button', {name: 'Read appearance settings', exact: true}),
        ).toBeVisible();
        await expect(component.locator('.g-aikit-ask-user-question:visible')).toBeVisible();
        await component
            .getByRole('button', {name: 'Waiting for your response', exact: true})
            .click();
        await expect(component.getByText('appearance.ts', {exact: true})).toBeVisible();
    });
    test('should control question playback with the shared toolbar', async ({mount}) => {
        const component = await mount(<AgentChatStories.ClarificationQuestion />);
        await component.getByRole('radio', {name: '1 question', exact: true}).check();
        await component.getByRole('radio', {name: '0.5×', exact: true}).check();
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        await component.getByRole('button', {name: 'Pause', exact: true}).click();
        await expect(component.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
        await expect(component.getByText('Step 1', {exact: true})).toBeVisible();
        await component.getByRole('button', {name: 'Next step', exact: true}).click();
        await component.getByRole('button', {name: 'Next step', exact: true}).click();
        await component.getByRole('button', {name: 'Next step', exact: true}).click();
        const question = component.locator('.g-aikit-ask-user-question:visible');
        await expect(question).toBeVisible();
        await expect(
            component.getByRole('button', {name: 'Skip to end', exact: true}),
        ).toBeDisabled();
        await component.getByRole('button', {name: 'Prev step', exact: true}).click();
        await expect(question).toHaveCount(0);
        await component.getByRole('button', {name: 'Next step', exact: true}).click();
        await question.getByRole('button', {name: /^Shared Recommended/}).click();
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toBeVisible();
        await component.getByRole('button', {name: 'Replay', exact: true}).click();
        await expect(
            component.getByRole('heading', {name: 'Workspace appearance settings are ready'}),
        ).toHaveCount(0);
        await component.getByRole('button', {name: 'Reset', exact: true}).click();
        await expect(component.getByText('Not started', {exact: true})).toBeVisible();
    });
    test('should skip to completion from pause with all activity steps and a separate final answer', async ({
        mount,
    }) => {
        const component = await mount(<AgentChatStories.Playground />);
        await component.getByRole('button', {name: 'Play scenario', exact: true}).click();
        await component.getByRole('button', {name: 'Pause', exact: true}).click();
        await expect(component.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
        await component.getByRole('button', {name: 'Skip to end', exact: true}).click();
        await expect(
            component.getByRole('heading', {name: 'Catalog filters ready for review'}),
        ).toBeVisible();
        await component.getByRole('button', {name: /Worked for \d+ s/}).click();
        await expect(component.locator('[data-run-id] ol > li')).toHaveCount(15);
        await expect(
            component.getByRole('button', {name: 'Read ProductList.tsx', exact: true}),
        ).toBeVisible();
        await expect(
            component.getByRole('button', {name: /Create feature pull request/}),
        ).toContainText('#44');
        await expect(component.locator('[data-run-id] .g-aikit-diff-stat')).toHaveCount(5);
        await expect(
            component
                .getByRole('button', {name: /Edit ProductList.tsx/})
                .locator('.g-aikit-diff-stat__added'),
        ).toHaveText('14');
        await expect(
            component
                .getByRole('button', {name: 'Read ProductList.tsx', exact: true})
                .locator('.g-aikit-diff-stat'),
        ).toHaveCount(0);
        await expect(component.locator('.chat-playground__changes')).toHaveCount(0);
        const card = component.locator('.g-aikit-changed-files-summary_view_card');
        await expect(card).toBeVisible();
        await expect(card.getByRole('button', {name: 'Undo', exact: true})).toBeVisible();
        await card.getByRole('button', {name: /4 files changed/}).click();
        const popup = component.page().getByRole('dialog', {name: 'Changed files', exact: true});
        await expect(popup).toContainText('src/components/ProductFilters.tsx');
        await expect(popup).toContainText('tests/catalogFilters.test.ts');
        await popup.press('Escape');
        await expect(popup).not.toBeVisible();
        await component.getByRole('radio', {name: 'Standard', exact: true}).check();
        await expect(
            component.getByRole('heading', {name: 'Catalog filters ready for review'}),
        ).toHaveCount(0);
        await component.getByRole('radio', {name: 'Agent', exact: true}).check();
        await expect(
            component.getByRole('heading', {name: 'Catalog filters ready for review'}),
        ).toHaveCount(0);
    });
});
