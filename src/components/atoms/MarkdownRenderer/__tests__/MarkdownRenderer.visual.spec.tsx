import {expect, test} from '~playwright/core';

import {MarkdownRendererStories} from './helpersPlaywright';

test.describe('MarkdownRenderer', {tag: '@MarkdownRenderer'}, () => {
    test('should render basic markdown', async ({mount, expectScreenshot}) => {
        await mount(<MarkdownRendererStories.Playground />);

        await expectScreenshot();
    });

    test('should render with transform options and custom plugin', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithTransformOptions />);

        await expectScreenshot();
    });

    test('should render markdown table inside BaseMessage without broken layout', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithMarkdownTableInMessage />);

        await expectScreenshot();
    });

    test('should render markdown text and table together in assistant message', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithMarkdownTextAndTableInMessage />);

        await expectScreenshot();
    });

    test('should stretch narrow two-column markdown table to full message width', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithMarkdownTableTwoColumnsInMessage />);

        await expectScreenshot();
    });

    test('should scroll horizontally for long markdown table cell text', async ({
        mount,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithMarkdownTableLongCellInMessage />);

        await expectScreenshot();
    });

    test('should not leak yfm styles onto standalone @diplodoc/transform content', async ({
        mount,
        page,
    }) => {
        await mount(<MarkdownRendererStories.StyleIsolation />);

        const fontWeight = (selector: string) =>
            page.locator(selector).evaluate((el) => getComputedStyle(el).fontWeight);

        // AIKit's accent override (font-weight: 600) applies inside its own renderer.
        await expect.poll(() => fontWeight('[data-qa="aikit-yfm"] strong')).toBe('600');

        // Standalone `.yfm` content must keep `@diplodoc/transform`'s default (700)
        // and stay untouched by AIKit's `.yfm` overrides.
        await expect.poll(() => fontWeight('[data-qa="standalone-yfm"] strong')).toBe('700');
    });
});
