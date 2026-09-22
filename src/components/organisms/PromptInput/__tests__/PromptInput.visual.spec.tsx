import {expect, test} from '~playwright/core';

import {PromptInputStories} from './helpersPlaywright';

test.describe('PromptInput', {tag: '@PromptInput'}, () => {
    test('should render simple view', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.Playground />);

        await expectScreenshot();
    });

    test('should render full view', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.FullView />);

        await expectScreenshot();
    });

    test('should render with suggestions', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithSuggestions />);

        await expectScreenshot();
    });

    test('should forward suggestion id to onSuggestionClick', async ({mount, page}) => {
        await mount(<PromptInputStories.WithSuggestionIdCallback />);

        await page.getByRole('button', {name: 'Yes'}).click();

        await expect(page.locator('[data-qa="suggestion-click"]')).toHaveText(
            'Yes:approve:confirmed',
        );
    });

    test('should render with suggestions and title', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithSuggestionsAndTitle />);

        await expectScreenshot();
    });

    test('should render with context indicator', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithContextIndicator />);

        await expectScreenshot();
    });

    test('should render with custom top content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithCustomTopContent />);

        await expectScreenshot();
    });

    test('should render with custom bottom content', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithCustomBottomContent />);

        await expectScreenshot();
    });

    test('should expose footer customization', async ({mount, page, expectScreenshot}) => {
        await mount(<PromptInputStories.WithCustomizedFooter />);

        await expect(page.locator('.custom-footer')).toBeVisible();
        await expect(page.locator('.custom-footer-content')).toBeVisible();
        await expect(page.locator('.custom-submit')).toHaveAttribute('data-state', 'enabled');
        await expectScreenshot();
    });

    test('should place caret at the end on the first focus only', async ({mount, page}) => {
        await mount(<PromptInputStories.Playground initialValue="some" />);

        const textarea = page.locator('textarea');
        const bounds = await textarea.boundingBox();
        if (!bounds) {
            throw new Error('Expected the textarea to be visible');
        }

        await textarea.click({position: {x: bounds.width - 2, y: 1}});

        await expect(textarea).toBeFocused();
        await expect(textarea).toHaveJSProperty('selectionStart', 4);
        await expect(textarea).toHaveJSProperty('selectionEnd', 4);

        await textarea.press('Tab');
        await expect(textarea).not.toBeFocused();
        await textarea.click({position: {x: 2, y: bounds.height / 2}});

        await expect(textarea).toHaveJSProperty('selectionStart', 0);
        await expect(textarea).toHaveJSProperty('selectionEnd', 0);
    });

    test('should place caret at the end on autofocus', async ({mount, page}) => {
        await mount(
            <PromptInputStories.Playground initialValue="some" bodyProps={{autoFocus: true}} />,
        );

        const textarea = page.locator('textarea');

        await expect(textarea).toBeFocused();
        await expect(textarea).toHaveJSProperty('selectionStart', 4);
        await expect(textarea).toHaveJSProperty('selectionEnd', 4);
    });

    test('should preserve explicit selection on the first focus', async ({mount, page}) => {
        await mount(<PromptInputStories.Playground initialValue="some" />);

        const textarea = page.locator('textarea');

        await textarea.selectText();
        await page.evaluate(
            () =>
                new Promise<void>((resolve) => {
                    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
                }),
        );

        await expect(textarea).toHaveJSProperty('selectionStart', 0);
        await expect(textarea).toHaveJSProperty('selectionEnd', 4);
    });

    test('should preserve a slow pointer selection on the first focus', async ({mount, page}) => {
        await mount(<PromptInputStories.Playground initialValue="some" />);

        const textarea = page.locator('textarea');
        const bounds = await textarea.boundingBox();
        if (!bounds) {
            throw new Error('Expected the textarea to be visible');
        }

        const pointerY = bounds.y + bounds.height / 2;
        await page.mouse.move(bounds.x + 2, pointerY);
        await page.mouse.down();
        await page.evaluate(
            () =>
                new Promise<void>((resolve) => {
                    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
                }),
        );
        await page.mouse.move(bounds.x + bounds.width - 2, pointerY, {steps: 10});
        await page.mouse.up();

        await expect(textarea).toHaveJSProperty('selectionStart', 0);
        await expect(textarea).toHaveJSProperty('selectionEnd', 4);
    });

    test('should render with top panel', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithTopPanel />);

        await expectScreenshot();
    });

    test('should render with bottom panel', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithBottomPanel />);

        await expectScreenshot();
    });

    test('should render with both panels', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.WithBothPanels />);

        await expectScreenshot();
    });

    test('should render disabled state', async ({mount, expectScreenshot}) => {
        await mount(<PromptInputStories.Disabled />);

        await expectScreenshot();
    });
});
