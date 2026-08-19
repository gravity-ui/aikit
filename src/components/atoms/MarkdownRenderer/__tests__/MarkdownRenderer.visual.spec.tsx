import {expect, test} from '~playwright/core';

import {MarkdownRenderer} from '../MarkdownRenderer';

import {
    MarkdownRendererStories,
    MdxCodeBlockActionsHarness,
    StreamingCodeBlockActionsHarness,
} from './helpersPlaywright';

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

    test('should open matching links in new tab when enabled', async ({mount, page}) => {
        await page.evaluate(() =>
            window.history.replaceState(null, '', '/markdown-renderer?utm_source=google'),
        );
        const origin = await page.evaluate(() => window.location.origin);

        await mount(
            <MarkdownRenderer
                content={[
                    '[External](https://gravity-ui.com)',
                    '[Anchor](#local)',
                    `[Same document](${origin}/markdown-renderer?utm_source=google#local)`,
                    `[Different query](${origin}/markdown-renderer?utm_source=yandex#local)`,
                    '[Relative anchor](/markdown-renderer?utm_source=google#local)',
                    '[Relative page](/markdown-renderer?utm_source=google)',
                    '[Relative different query](/markdown-renderer?utm_source=yandex#local)',
                    '[Email](mailto:test@example.com)',
                    '[Phone](tel:+1234567890)',
                ].join(' ')}
                openLinksInNewTab
            />,
        );

        const externalLink = page.getByRole('link', {name: 'External'});
        const anchorLink = page.getByRole('link', {name: 'Anchor', exact: true});
        const sameDocumentLink = page.getByRole('link', {name: 'Same document'});
        const differentQueryLink = page.getByRole('link', {name: 'Different query', exact: true});
        const relativeAnchorLink = page.getByRole('link', {name: 'Relative anchor'});
        const relativePageLink = page.getByRole('link', {name: 'Relative page'});
        const relativeDifferentQueryLink = page.getByRole('link', {
            name: 'Relative different query',
        });
        const emailLink = page.getByRole('link', {name: 'Email'});
        const phoneLink = page.getByRole('link', {name: 'Phone'});

        await expect(externalLink).toHaveAttribute('target', '_blank');
        await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(anchorLink).not.toHaveAttribute('target', '_blank');
        await expect(anchorLink).not.toHaveAttribute('rel', 'noopener noreferrer');
        await expect(sameDocumentLink).toHaveAttribute('target', '_blank');
        await expect(sameDocumentLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(differentQueryLink).toHaveAttribute('target', '_blank');
        await expect(differentQueryLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(relativeAnchorLink).not.toHaveAttribute('target', '_blank');
        await expect(relativeAnchorLink).not.toHaveAttribute('rel', 'noopener noreferrer');
        await expect(relativePageLink).toHaveAttribute('target', '_blank');
        await expect(relativePageLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(relativeDifferentQueryLink).toHaveAttribute('target', '_blank');
        await expect(relativeDifferentQueryLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(emailLink).toHaveAttribute('target', '_blank');
        await expect(emailLink).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(phoneLink).toHaveAttribute('target', '_blank');
        await expect(phoneLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should keep default link target behavior', async ({mount, page}) => {
        await mount(<MarkdownRenderer content="[Anchor](#local)" />);

        const link = page.getByRole('link', {name: 'Anchor'});

        await expect(link).not.toHaveAttribute('target', '_blank');
        await expect(link).not.toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should preserve code styling and support metadata, controls and visibility', async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<MarkdownRendererStories.WithCodeBlockActions />);

        const hoverRenderer = page.locator('[data-qa="code-actions-hover"]');
        const hoverBlocks = hoverRenderer.locator('[data-aikit-code-block]');
        const firstHoverBlock = hoverBlocks.nth(0);
        const firstHoverAction = page.locator('[data-qa="hover-code-action-0"]');
        const alwaysRenderer = page.locator('[data-qa="code-actions-always"]');
        const alwaysBlocks = alwaysRenderer.locator('[data-aikit-code-block]');
        const getPanelOpacity = () =>
            firstHoverBlock.evaluate((codeBlock) => {
                const toolbar = codeBlock.querySelector('.yfm-code-floating');
                const legacyActions = codeBlock.querySelector(
                    '.g-aikit-markdown-renderer__code-block-actions_legacy',
                );
                const panel = toolbar ?? legacyActions;

                return panel ? getComputedStyle(panel).opacity : null;
            });

        await expect.poll(getPanelOpacity).toBe('0');
        await firstHoverBlock.hover();
        await expect.poll(getPanelOpacity).toBe('1');

        await page.mouse.move(0, 0);
        await firstHoverAction.focus();
        await expect.poll(getPanelOpacity).toBe('1');

        await firstHoverAction.click();
        await expect(page.locator('[data-qa="hover-last-action"]')).toContainText(
            'Last action: sql: SELECT * FROM users;',
        );
        await expect(firstHoverBlock.locator('code')).toHaveClass(/hljs/);
        await expect(
            firstHoverBlock.locator('.hljs-keyword').filter({hasText: 'SELECT'}),
        ).toHaveText('SELECT');

        await expect(alwaysBlocks.nth(0)).toHaveClass(/actionsVisible/);
        await expect(alwaysBlocks.nth(1)).toHaveClass(/actionsVisible/);
        await expect(alwaysBlocks.nth(2)).not.toHaveClass(/actionsVisible/);
        const firstAlwaysBlock = alwaysBlocks.nth(0);
        const firstAlwaysLegacyActions = firstAlwaysBlock.locator(
            '.g-aikit-markdown-renderer__code-block-actions_legacy',
        );
        await expect(firstAlwaysLegacyActions).toHaveCSS('right', '44px');
        const [firstAlwaysBlockBox, firstAlwaysLegacyActionsBox] = await Promise.all([
            firstAlwaysBlock.boundingBox(),
            firstAlwaysLegacyActions.boundingBox(),
        ]);
        if (!firstAlwaysBlockBox || !firstAlwaysLegacyActionsBox) {
            throw new Error('Expected the legacy code action and its code block to be visible');
        }
        expect(
            Math.abs(
                firstAlwaysLegacyActionsBox.y +
                    firstAlwaysLegacyActionsBox.height / 2 -
                    (firstAlwaysBlockBox.y + 26),
            ),
        ).toBeLessThan(1);
        await expect(page.locator('[data-qa="always-code-action-2"]')).toHaveCount(0);

        await expectScreenshot();
    });

    test('should keep streamed code block actions aligned with completed fences', async ({
        mount,
        page,
    }) => {
        await mount(<StreamingCodeBlockActionsHarness />);

        const codeBlocks = page.locator('[data-aikit-code-block]');
        const firstCodeBlock = codeBlocks.nth(0);

        await expect(codeBlocks).toHaveCount(1);
        await expect(page.locator('[data-qa^="streaming-code-action-"]')).toHaveCount(1);
        await expect(firstCodeBlock.locator('code')).toHaveText('SELECT 1;');
        await expect(firstCodeBlock.locator('[data-qa="streaming-code-action-0"]')).toHaveText(
            'sql: SELECT 1;',
        );

        await page.getByRole('button', {name: 'Append code block'}).click();

        const secondCodeBlock = codeBlocks.nth(1);

        await expect(codeBlocks).toHaveCount(2);
        await expect(page.locator('[data-qa^="streaming-code-action-"]')).toHaveCount(2);
        await expect(firstCodeBlock.locator('code')).toHaveText('SELECT 1;');
        await expect(firstCodeBlock.locator('[data-qa="streaming-code-action-0"]')).toHaveText(
            'sql: SELECT 1;',
        );
        await expect(secondCodeBlock.locator('code')).toHaveText('SELECT 2;');
        await expect(secondCodeBlock.locator('[data-qa="streaming-code-action-1"]')).toHaveText(
            'yql: SELECT 2;',
        );
    });

    test('should keep MDX code block actions aligned with fenced metadata', async ({
        mount,
        page,
    }) => {
        await mount(<MdxCodeBlockActionsHarness />);

        const codeBlock = page.locator('[data-aikit-code-block]');

        await expect(page.locator('[data-qa="mdx-badge"]')).toHaveText('Badge');
        await expect(codeBlock).toHaveCount(1);
        await expect(codeBlock.locator('code')).toHaveText('const answer = 42;');
        await expect(codeBlock.locator('[data-qa="mdx-code-action"]')).toHaveText(
            'typescript: const answer = 42;',
        );
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

    test('should wrap long markdown table cell text', async ({mount, expectScreenshot}) => {
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

    test('should render with mdx compoentns', async ({mount, expectScreenshot}) => {
        await mount(<MarkdownRendererStories.WithMdxComponents />);

        await expectScreenshot();
    });
});
