import {expect, test} from '~playwright/core';

import {AskUserQuestionStories as Stories} from './helpersPlaywright';

test.describe('AskUserQuestion', {tag: '@AskUserQuestion'}, () => {
    test('should render playground state', async ({mount, page, expectScreenshot}) => {
        await mount(<Stories.Playground />);
        await page.getByRole('button', {name: /Shared/}).hover();
        await expectScreenshot();
    });
    test('should render custom answer filled state', async ({mount, expectScreenshot}) => {
        await mount(<Stories.CustomAnswerFilled />);
        await expectScreenshot();
    });
    test('should render without a custom answer', async ({mount, expectScreenshot}) => {
        await mount(<Stories.WithoutCustomAnswer />);
        await expectScreenshot();
    });
    test('should render without shortcuts', async ({mount, expectScreenshot}) => {
        await mount(<Stories.WithoutShortcuts />);
        await expectScreenshot();
    });
    test('should render narrow state', async ({mount, expectScreenshot}) => {
        await mount(<Stories.Narrow />);
        await expectScreenshot();
    });
    test('should submit options and custom answers', async ({mount, page}) => {
        await mount(<Stories.Playground />);
        await page.getByRole('button', {name: /Shared/}).click();
        await expect(page.getByRole('status')).toHaveText('shared');
        const input = page.getByRole('textbox');
        await input.fill('  Another answer  ');
        await input.press('Enter');
        await expect(page.getByRole('status')).toHaveText('Another answer');
        await input.fill('Confirmed answer');
        await page.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect(page.getByRole('status')).toHaveText('Confirmed answer');
    });
    test('should render a single question without navigation', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<Stories.SingleQuestion />);
        await expect(page.getByRole('button', {name: 'Next question', exact: true})).toHaveCount(0);
        await expectScreenshot();
    });
    test('should navigate answers with arrows and enter custom input', async ({mount, page}) => {
        const component = await mount(<Stories.Playground />);
        const first = component.locator('[data-question-answer]').first();
        await first.focus();
        await page.keyboard.press('ArrowDown');
        await expect(component.locator('[data-question-answer]').nth(1)).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(component.locator('[data-question-answer="custom"]')).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(component.getByRole('textbox')).toBeFocused();
        await page.keyboard.type('My response');
        await page.keyboard.press('Enter');
        await expect(page.getByRole('status')).toHaveText('My response');
    });
    test('should navigate and close', async ({mount, page}) => {
        await mount(<Stories.Playground />);
        await expect(
            page.getByRole('button', {name: 'Previous question', exact: true}),
        ).toBeDisabled();
        await page.getByRole('button', {name: 'Next question', exact: true}).click();
        await expect(page.getByText('2 of 3')).toBeVisible();
        await expect(
            page.getByText('When should the accent color change take effect?'),
        ).toBeVisible();
        await page.getByRole('button', {name: 'Next question', exact: true}).click();
        await expect(page.getByRole('button', {name: 'Next question', exact: true})).toBeDisabled();
        await page.getByRole('button', {name: 'Previous question', exact: true}).click();
        await expect(page.getByText('2 of 3')).toBeVisible();
        await expect(
            page.getByText('When should the accent color change take effect?'),
        ).toBeVisible();
        await page.getByRole('button', {name: 'Skip', exact: true}).click();
        await expect(page.getByRole('status')).toHaveText('Question closed');
    });
    test('should accept number shortcuts without card focus and preserve typing', async ({
        mount,
        page,
    }) => {
        await mount(<Stories.Playground />);
        await page.keyboard.press('2');
        await expect(page.getByRole('status')).toHaveText('independent');
        await page.keyboard.press('3');
        await expect(page.getByRole('textbox')).toBeFocused();
        await page.keyboard.type('123');
        await expect(page.getByRole('textbox')).toHaveValue('123');
        await page.keyboard.press('Escape');
        await expect(page.getByRole('status')).toHaveText('Question closed');
    });
    test('should hide custom input and its shortcut when custom answers are unavailable', async ({
        mount,
        page,
    }) => {
        await mount(<Stories.WithoutCustomAnswer />);
        await expect(page.getByRole('textbox')).toHaveCount(0);
        await expect(page.locator('.g-aikit-ask-user-question__hotkey')).toHaveCount(2);
        await page.keyboard.press('3');
        await expect(page.getByRole('status')).toHaveCount(0);
    });
});
