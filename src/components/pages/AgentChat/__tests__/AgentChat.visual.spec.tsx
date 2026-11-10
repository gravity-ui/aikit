import {expect, test} from '~playwright/core';

import {AgentChatStories} from './helpersPlaywright';

test.describe('AgentChat', {tag: '@AgentChat'}, () => {
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
