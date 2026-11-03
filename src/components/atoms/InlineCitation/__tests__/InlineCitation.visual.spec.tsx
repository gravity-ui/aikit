import {ThemeProvider} from '@gravity-ui/uikit';

import {expect, test} from '~playwright/core';

import {CitationStories} from './helpersPlaywright';

test.describe('InlineCitation', {tag: '@InlineCitation'}, () => {
    test('should render the playground badge', async ({mount, expectScreenshot}) => {
        await mount(<CitationStories.Playground />, {width: 640});

        await expectScreenshot();
    });

    test('should show a single source on hover and dismiss with Escape', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.Default />);
        const trigger = page.getByRole('button', {name: 'Show sources (1)', exact: true});
        await trigger.hover();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toContainText('Gravity UI base kit for building AI assistant chats.');
        await expect(dialog.getByRole('button', {name: 'Next source'})).toHaveCount(0);
        await dialog.hover();
        await expectScreenshot({component: page, fullPage: true});

        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
    });

    test('should navigate multiple sources and restore keyboard focus', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.MultipleSources />);
        const dialog = page.getByRole('dialog');
        await expect(dialog).toContainText('1 / 3');
        await expect(page.getByRole('button', {name: 'Previous source'})).toBeDisabled();
        await expectScreenshot({component: page, fullPage: true, nameSuffix: 'first source'});

        await page.getByRole('button', {name: 'Next source'}).click();
        await expect(dialog).toContainText('2 / 3');
        await expect(dialog.getByRole('link')).toHaveAttribute('href', 'https://gravity-ui.com');
        await expectScreenshot({component: page, fullPage: true, nameSuffix: 'second source'});

        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(
            page.getByRole('button', {name: 'Show sources (3)', exact: true}),
        ).toBeFocused();
    });

    test('should render a source without optional metadata', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.MinimalSource />);
        await page.getByRole('button', {name: 'Show sources (1)', exact: true}).click();
        await expect(page.getByRole('dialog').getByRole('link')).toHaveText('gravity-ui.com');

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should render a custom badge label', async ({mount, page, expectScreenshot}) => {
        await mount(<CitationStories.CustomLabel />, {width: 640});
        await expect(page.getByRole('button')).toHaveText('Documentation+2');

        await expectScreenshot();
    });

    test('should render no citation for an empty source list', async ({mount, page}) => {
        await mount(<CitationStories.Empty />);
        await expect(page.getByRole('button')).toHaveCount(0);
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    test('should retain focus at both navigation boundaries after opening with Tab', async ({
        mount,
        page,
    }) => {
        await mount(<CitationStories.Playground />);
        const trigger = page.getByRole('button', {name: 'Show sources (3)', exact: true});
        await page.keyboard.press('Tab');
        await expect(trigger).toBeFocused();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Tab');
        const next = page.getByRole('button', {name: 'Next source', exact: true});
        await expect(next).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(dialog).toContainText('2 / 3');
        await page.keyboard.press('Enter');
        await expect(next).toBeDisabled();
        await expect(dialog).toBeFocused();
        await expect(dialog).toContainText('3 / 3');
        // The hover/focus close timer must not dismiss the final source.
        await page.waitForTimeout(300);
        await expect(dialog).toBeVisible();

        await page.keyboard.press('Tab');
        const previous = page.getByRole('button', {name: 'Previous source', exact: true});
        await expect(previous).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(dialog).toContainText('2 / 3');
        await page.keyboard.press('Enter');
        await expect(previous).toBeDisabled();
        await expect(dialog).toBeFocused();
        await expect(dialog).toContainText('1 / 3');
        await page.waitForTimeout(300);
        await expect(dialog).toBeVisible();
    });

    test('should display an invalid URL without a navigation link', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.InvalidUrl />);
        await page.getByRole('button', {name: 'Show sources (1)', exact: true}).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toContainText('Unavailable source');
        await expect(dialog.getByRole('link')).toHaveCount(0);

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should contain a long source within a narrow viewport', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await page.setViewportSize({width: 320, height: 568});
        await mount(<CitationStories.NarrowContainer />);
        await page.getByRole('button', {name: 'Show sources (1)', exact: true}).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveCSS('overflow-x', 'auto');

        await expectScreenshot({component: page, fullPage: true});
        const dimensions = await dialog.evaluate((element) => ({
            right: element.getBoundingClientRect().right,
            bottom: element.getBoundingClientRect().bottom,
            width: element.clientWidth,
            scrollWidth: element.scrollWidth,
        }));
        expect(dimensions.right).toBeLessThanOrEqual(320);
        expect(dimensions.bottom).toBeLessThanOrEqual(568);
        expect(dimensions.scrollWidth).toBe(dimensions.width);
    });

    test('should fall back to the first source when the selected source is removed', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.Controlled />);
        await page.getByRole('button', {name: 'Toggle sources', exact: true}).click();
        await page.getByRole('button', {name: 'Next source'}).click();
        await page.getByRole('button', {name: 'Next source'}).click();
        await expect(page.getByRole('dialog')).toContainText('3 / 3');
        await expect(page.getByRole('button', {name: 'Next source'})).toBeDisabled();

        await page.getByRole('button', {name: 'Remove last source', exact: true}).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
        await page.getByRole('button', {name: 'Show sources (2)', exact: true}).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('dialog')).toContainText('1 / 2');
        await expectScreenshot({component: page, fullPage: true});
    });

    test('should let the host handle source navigation', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.CustomNavigation />);
        await page.getByRole('button', {name: 'Show sources (3)', exact: true}).click();
        await page.getByRole('dialog').getByRole('link').click();
        await expect(page.getByRole('status')).toHaveText(
            'Selected source: AIKit: components for AI assistants',
        );

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should resolve sources from the owning Markdown message', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<CitationStories.InMarkdownMessage />);
        const triggers = page.getByRole('button', {name: 'Show sources (1)', exact: true});
        await expect(triggers).toHaveCount(2);
        await triggers.nth(1).click();
        await expect(page.getByRole('dialog').getByRole('link')).toHaveAttribute(
            'href',
            'https://example.com',
        );

        await expectScreenshot({component: page, fullPage: true});
    });

    test('should render the source preview in the dark theme', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(
            <ThemeProvider theme="dark">
                <CitationStories.MultipleSources />
            </ThemeProvider>,
            {width: 600},
        );
        await expect(page.getByRole('dialog')).toContainText('1 / 3');

        await expectScreenshot({component: page, fullPage: true});
    });
});
