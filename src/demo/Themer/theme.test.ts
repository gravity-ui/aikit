import {parse} from 'postcss';

import {
    createTheme,
    exportThemeCss,
    exportThemeJson,
    importTheme,
    parseFontDraft,
    scopeThemeCss,
    updatePalette,
} from './theme';

function declaration(css: string, selector: string, property: string) {
    let result = '';
    parse(css).walkRules(selector, (rule) => {
        rule.walkDecls(property, (node) => {
            result = node.value;
        });
    });
    return result;
}

describe('AIKit and Gravity theme exchange', () => {
    it.each(['css', 'json'] as const)(
        'preserves shared colors, radii and independent AIKit overrides through %s',
        (format) => {
            let theme = updatePalette(createTheme(), 'brand', 'light', '#8b5cf6');
            theme = updatePalette(theme, 'brand', 'dark', '#a78bfa');
            theme.gravity.borders.xl = '24px';
            theme.aikit.light['--g-aikit-message-balloon-background'] = 'var(--g-color-base-brand)';
            theme.aikit.dark['--g-aikit-message-balloon-background'] = '#123456';
            theme.aikit.dark['--g-aikit-custom-panel-padding'] = '18px';
            const restored = importTheme(
                format === 'css' ? exportThemeCss(theme) : exportThemeJson(theme),
            );
            expect(restored.aikit).toEqual(theme.aikit);
            expect(restored.gravity.borders.xl).toBe('24px');
            const css = exportThemeCss(restored);
            expect(declaration(css, '.g-root_theme_light', '--g-color-base-brand')).toBe(
                'var(--g-color-private-brand-550-solid)',
            );
            expect(declaration(css, '.g-root_theme_dark', '--g-aikit-custom-panel-padding')).toBe(
                '18px',
            );
            expect(css).not.toMatch(/--g-[\w-]+:\s*--g-/);
            expect(css).not.toMatch(/--g-[\w-]+:\s*;/);
        },
    );

    it('changes the rendered semantic brand color while preserving the other variant', () => {
        const original = createTheme();
        const next = updatePalette(original, 'brand', 'light', '#123456');
        const css = exportThemeCss(next);
        expect(declaration(css, '.g-root_theme_light', '--g-color-base-brand')).toBe(
            'var(--g-color-private-brand-550-solid)',
        );
        expect(declaration(css, '.g-root_theme_dark', '--g-color-base-brand')).toBe(
            declaration(exportThemeCss(original), '.g-root_theme_dark', '--g-color-base-brand'),
        );
        expect(next.gravity.utilityColors['text-brand-contrast'].light.value).toBe('#ffffff');
        expect(original.gravity.baseColors.brand).toBeUndefined();
    });

    it('accepts an unmodified Gravity export and re-exports default themes', () => {
        const original = createTheme();
        const restored = importTheme(exportThemeJson(original));
        expect(restored.aikit).toEqual({light: {}, dark: {}});
        expect(exportThemeCss(restored)).toBe(exportThemeCss(original));
        expect(() => importTheme(exportThemeCss(original))).not.toThrow();
    });

    it('preserves typography references and subsequent family edits through JSON', () => {
        const theme = createTheme();
        theme.gravity.typography.fontFamilies.sans = {
            mainFont: 'Georgia',
            fallbackFonts: ['serif'],
        };
        theme.gravity.typography.fontFamilies['additional-font-1'] = {
            mainFont: 'Open Sans',
            fallbackFonts: ['sans-serif'],
        };
        theme.gravity.typography.groups.header['font-family'] = 'additional-font-1';
        const restored = importTheme(exportThemeJson(theme));
        expect(exportThemeCss(restored)).toBe(exportThemeCss(theme));
        restored.gravity.typography.fontFamilies.sans.mainFont = 'Arial';
        const css = exportThemeCss(restored);
        expect(declaration(css, '.g-root', '--g-font-family-sans')).toBe("'Arial', serif");
        expect(declaration(css, '.g-root', '--g-text-body-font-family')).toBe(
            'var(--g-font-family-sans)',
        );
        expect(declaration(css, '.g-root', '--g-text-code-font-family')).toBe(
            'var(--g-font-family-monospace)',
        );
        expect(declaration(css, '.g-root', '--g-text-header-font-family')).toBe(
            'var(--g-font-family-additional-font-1)',
        );
        expect(importTheme(exportThemeJson(restored)).gravity.typography).toEqual(
            restored.gravity.typography,
        );
    });

    it.each(['--g-color-base-brand', '--g-font-family-missing'])(
        'rejects unusable typography references: %s',
        (ref) => {
            expect(() =>
                importTheme(JSON.stringify({'--g-text-body-font-family': {value: "'Arial'", ref}})),
            ).toThrow('Invalid font reference');
        },
    );

    it.each(['sans', 'monospace'] as const)(
        'keeps the last valid %s font while a quoted name is incomplete',
        (family) => {
            const theme = createTheme();
            const original = theme.gravity.typography.fontFamilies[family].mainFont;
            const input = "'Open Sans'";
            for (let length = 1; length <= input.length; length++) {
                const font = parseFontDraft(input.slice(0, length));
                if (font !== undefined) {
                    theme.gravity.typography.fontFamilies[family].mainFont = font;
                }
                expect(theme.gravity.typography.fontFamilies[family].mainFont).toBe(
                    length === input.length ? 'Open Sans' : original,
                );
                expect(() => scopeThemeCss(exportThemeCss(theme))).not.toThrow();
            }
            expect(
                importTheme(exportThemeJson(theme)).gravity.typography.fontFamilies[family],
            ).toEqual(theme.gravity.typography.fontFamilies[family]);
        },
    );

    it('normalizes complete font names and rejects unsafe or incomplete drafts', () => {
        for (const draft of ['Open Sans', "'Open Sans'", '"Open Sans"', '  Open Sans  ']) {
            expect(parseFontDraft(draft)).toBe('Open Sans');
        }
        for (const draft of [
            '',
            ' ',
            "'",
            '"',
            "'Open Sans",
            'Open Sans"',
            "Font's",
            'Font\\',
            'Font\nName',
        ]) {
            expect(parseFontDraft(draft)).toBeUndefined();
        }
    });

    it('applies common AIKit variables and later mode overrides in CSS order', () => {
        const theme = importTheme(
            '.g-root { --g-aikit-shimmer-duration: 3s; } .g-root_theme_dark { --g-aikit-shimmer-duration: 4s; }',
        );
        expect(theme.aikit.light['--g-aikit-shimmer-duration']).toBe('3s');
        expect(theme.aikit.dark['--g-aikit-shimmer-duration']).toBe('4s');
    });

    it.each([
        '',
        '{}',
        '[]',
        '{broken',
        '.unrelated {color: red;}',
        '.g-root {--unknown: red;}',
        '.g-root {--g-color-base-brand: red;}',
        '.g-root_theme_light {--g-font-family-sans: Arial;}',
        '{"--g-aikit-test":{"light":{"value":""}}}',
        '{"--g-aikit-test":{"value":"red; color: blue"}}',
    ])('rejects invalid or unrelated source without mutating a theme: %s', (source) => {
        const original = createTheme();
        const snapshot = exportThemeCss(original);
        expect(() => importTheme(source)).toThrow();
        expect(exportThemeCss(original)).toBe(snapshot);
    });

    it('limits preview selectors to the preview region, including portal theme roots', () => {
        const css = scopeThemeCss(exportThemeCss(createTheme()));
        parse(css).walkRules((rule) => {
            expect(
                rule.selectors.every((selector) => selector.startsWith('.aikit-themer-preview')),
            ).toBe(true);
        });
        expect(css).toContain('.aikit-themer-preview .g-root.g-root_theme_dark');
    });

    it('preserves font imports through CSS and JSON without swallowing theme rules', () => {
        const css =
            '@import url("https://example.com/font.css");\n.g-root {--g-font-family-sans: Arial, sans-serif;}';
        const restored = importTheme(exportThemeJson(importTheme(css)));
        expect(restored.gravity.typography.fontImports).toEqual([
            '@import url("https://example.com/font.css");',
        ]);
        expect(parse(exportThemeCss(restored)).nodes.some((node) => node.type === 'rule')).toBe(
            true,
        );
    });

    it.each([
        '{"--g-color-base-background":{"value":"red"}}',
        '{"--g-font-family-sans":{"light":{"value":"Arial"},"dark":{"value":"Arial"}}}',
        '{"--g-color-base-brand":{"light":{"value":"red","ref":"invalid reference"},"dark":{"value":"blue"}}}',
    ])('rejects malformed Gravity entry shapes: %s', (source) => {
        expect(() => importTheme(source)).toThrow();
    });
    it.each(['css', 'json'] as const)(
        'preserves additional Gravity font families and illustration tokens through %s',
        (format) => {
            const css =
                '.g-root {--g-font-family-additional-font-1: Georgia, serif;}\n.g-root_theme_light {--gil-color-object-base: #123456;}';
            const theme = importTheme(css);
            const restored = importTheme(
                format === 'css' ? exportThemeCss(theme) : exportThemeJson(theme),
            );
            expect(restored.gravity.typography.fontFamilies['additional-font-1']?.mainFont).toBe(
                'Georgia',
            );
            expect(exportThemeCss(restored)).toContain('--gil-color-object-base: #123456;');
        },
    );
});
