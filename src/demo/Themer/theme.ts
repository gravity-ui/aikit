import {
    DEFAULT_THEME,
    createInternalPrivateColorReference,
    generateCSS,
    generateJSON,
    isFontCssVariable,
    parseCSS,
    parseJSON,
    updateBaseColor,
    updateUtilityColor,
} from '@gravity-ui/uikit-themer';
import type {GravityTheme, JsonTheme, Theme, UtilityColor} from '@gravity-ui/uikit-themer';
import chroma from 'chroma-js';
import {parse} from 'postcss';

export interface EditorTheme {
    gravity: GravityTheme;
    aikit: Record<Theme, Record<string, string>>;
}

export const PREVIEW_CLASS = 'aikit-themer-preview';
export const STORAGE_KEY = 'aikit-themer-theme-v1';
const MAX_SOURCE_LENGTH = 500_000;
const AIKIT_VARIABLE = /^--g-aikit-[a-z0-9-]+$/;
const PRIVATE_VARIABLE = /^--g-color-private-[a-z0-9-]+-(?:\d+(?:-solid)?|opaque-\d+)$/;
const defaultJson = generateJSON({theme: DEFAULT_THEME, libraries: ['illustrations']});

export function createTheme(): EditorTheme {
    return {gravity: structuredClone(DEFAULT_THEME), aikit: {light: {}, dark: {}}};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateValue(variable: string, value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`A value is required for ${variable}.`);
    }
    const css = parse(`.g-root { ${variable}: ${value}; }`);
    const rule = css.first;
    if (
        css.nodes.length !== 1 ||
        rule?.type !== 'rule' ||
        rule.nodes.length !== 1 ||
        rule.first?.type !== 'decl' ||
        rule.first.prop !== variable ||
        rule.first.important
    ) {
        throw new Error(`Invalid CSS value for ${variable}.`);
    }
    return value.trim();
}

function readValue(variable: string, value: unknown): string {
    if (!isRecord(value) || !('value' in value)) {
        throw new Error(`Invalid theme entry for ${variable}.`);
    }
    if (
        value.ref !== undefined &&
        (typeof value.ref !== 'string' || !/^--(?:g|gil)-[a-z0-9-]+$/.test(value.ref))
    ) {
        throw new Error(`Invalid theme reference for ${variable}.`);
    }
    return validateValue(variable, value.value);
}

function isGravityVariable(variable: string) {
    return (
        isFontCssVariable(variable) ||
        Object.prototype.hasOwnProperty.call(defaultJson, variable) ||
        PRIVATE_VARIABLE.test(variable)
    );
}

function isCommonVariable(variable: string) {
    return (
        isFontCssVariable(variable) ||
        Boolean(defaultJson[variable] && 'value' in defaultJson[variable])
    );
}

function readEntryVariants(variable: string, entry: unknown): Partial<Record<Theme, string>> {
    if (!isRecord(entry)) {
        throw new Error(`Invalid theme entry for ${variable}.`);
    }
    if ('value' in entry) {
        const value = readValue(variable, entry);
        return {light: value, dark: value};
    }
    const result: Partial<Record<Theme, string>> = {};
    for (const variant of ['light', 'dark'] as const) {
        if (variant in entry) {
            const options = entry[variant];
            const blankPrivate =
                PRIVATE_VARIABLE.test(variable) && isRecord(options) && options.value === '';
            result[variant] = blankPrivate ? '' : readValue(variable, options);
        }
    }
    if (!Object.keys(result).length) {
        throw new Error(`Missing theme variants for ${variable}.`);
    }
    return result;
}

function readFontImports(metadata: unknown): string[] {
    if (metadata === undefined) {
        return [];
    }
    if (!isRecord(metadata) || metadata.version !== 1 || !Array.isArray(metadata.fontImports)) {
        throw new Error('Unsupported AIKit theme metadata.');
    }
    return metadata.fontImports.map((source: unknown) => {
        if (typeof source !== 'string') {
            throw new Error('Invalid font import.');
        }
        const css = parse(source);
        if (
            css.nodes.length !== 1 ||
            css.first?.type !== 'atrule' ||
            css.first.name !== 'import' ||
            css.first.nodes
        ) {
            throw new Error('Invalid font import.');
        }
        return css.first.toString().replace(/;?$/, ';');
    });
}

function removeEmptyPrivateColors(theme: GravityTheme) {
    for (const variants of Object.values(theme.privateColors)) {
        for (const colors of Object.values(variants)) {
            for (const [key, color] of Object.entries(colors)) {
                if (!color.value && !color.ref) {
                    delete colors[key as keyof typeof colors];
                }
            }
        }
    }
}

function importJson(source: string): EditorTheme {
    const json: unknown = JSON.parse(source);
    if (!isRecord(json) || !Object.keys(json).length) {
        throw new Error('Paste a Gravity theme JSON object or exported CSS.');
    }
    const theme = createTheme();
    const gravity: JsonTheme = {};
    const imports = readFontImports(json.$aikit);
    for (const [variable, entry] of Object.entries(json)) {
        if (variable === '$aikit') {
            continue;
        }
        if (!AIKIT_VARIABLE.test(variable) && !isGravityVariable(variable)) {
            throw new Error(`Unsupported theme variable: ${variable}.`);
        }
        if (!AIKIT_VARIABLE.test(variable) && isRecord(entry)) {
            const common = isCommonVariable(variable);
            if (Boolean(common) !== 'value' in entry) {
                throw new Error(`Incorrect theme variants for ${variable}.`);
            }
        }
        const variants = readEntryVariants(variable, entry);
        if (AIKIT_VARIABLE.test(variable)) {
            for (const [variant, value] of Object.entries(variants)) {
                theme.aikit[variant as Theme][variable] = value;
            }
        } else {
            if (Object.keys(variants).length !== 2) {
                throw new Error(`Missing theme variants for ${variable}.`);
            }
            gravity[variable] = entry as JsonTheme[string];
        }
    }
    if (
        !Object.keys(gravity).length &&
        !Object.keys(theme.aikit.light).length &&
        !Object.keys(theme.aikit.dark).length
    ) {
        throw new Error('The source does not contain theme variables.');
    }
    theme.gravity = parseJSON(gravity);
    theme.gravity.typography.fontImports = imports;
    removeEmptyPrivateColors(theme.gravity);
    return theme;
}

function importCss(source: string): EditorTheme {
    const root = parse(source);
    const theme = createTheme();
    const gravityRules: string[] = [];
    const imports: string[] = [];
    let count = 0;
    for (const node of root.nodes) {
        if (node.type === 'comment') {
            continue;
        }
        if (node.type === 'atrule' && node.name === 'import' && !node.nodes) {
            imports.push(node.toString().replace(/;?$/, ';'));
            continue;
        }
        if (node.type !== 'rule') {
            throw new Error('Use a theme with .g-root and light/dark theme rules.');
        }
        const selectors = node.selectors.map((selector) => selector.trim());
        for (const selector of selectors) {
            if (!['.g-root', '.g-root_theme_light', '.g-root_theme_dark'].includes(selector)) {
                throw new Error(`Unsupported theme selector: ${selector}.`);
            }
            const variants: Theme[] =
                selector === '.g-root'
                    ? ['light', 'dark']
                    : [selector === '.g-root_theme_light' ? 'light' : 'dark'];
            const declarations: string[] = [];
            for (const declaration of node.nodes) {
                if (declaration.type === 'comment') {
                    continue;
                }
                if (declaration.type !== 'decl') {
                    throw new Error('Theme rules must contain CSS variables.');
                }
                const {prop, value} = declaration;
                validateValue(prop, value);
                if (AIKIT_VARIABLE.test(prop)) {
                    for (const variant of variants) {
                        theme.aikit[variant][prop] = value;
                    }
                } else if (isGravityVariable(prop)) {
                    const common = isCommonVariable(prop);
                    if (Boolean(common) !== (selector === '.g-root')) {
                        throw new Error(`Incorrect theme selector for ${prop}.`);
                    }
                    declarations.push(`${prop}: ${value};`);
                } else {
                    throw new Error(`Unsupported theme variable: ${prop}.`);
                }
                count++;
            }
            gravityRules.push(`${selector} { ${declarations.join('\n')} }`);
        }
    }
    if (!count) {
        throw new Error('The source does not contain theme variables.');
    }
    theme.gravity = parseCSS(gravityRules.join('\n'));
    theme.gravity.typography.fontImports = imports;
    return theme;
}

export function importTheme(source: string): EditorTheme {
    const trimmed = source.trim();
    if (!trimmed || trimmed.length > MAX_SOURCE_LENGTH) {
        throw new Error('Paste a theme smaller than 500 KB.');
    }
    return trimmed.startsWith('{') ? importJson(trimmed) : importCss(trimmed);
}

export function exportThemeJson(theme: EditorTheme): string {
    const json: Record<string, unknown> = generateJSON({
        theme: theme.gravity,
        libraries: ['illustrations'],
        ignoreDefaultValues: true,
    });
    if (theme.gravity.typography.fontImports.length) {
        json.$aikit = {version: 1, fontImports: theme.gravity.typography.fontImports};
    }
    const variables = new Set([
        ...Object.keys(theme.aikit.light),
        ...Object.keys(theme.aikit.dark),
    ]);
    for (const variable of variables) {
        json[variable] = Object.fromEntries(
            (['light', 'dark'] as const)
                .filter((variant) => theme.aikit[variant][variable] !== undefined)
                .map((variant) => [variant, {value: theme.aikit[variant][variable]}]),
        );
    }
    // Exporting a default theme must still produce an importable object.
    if (!Object.keys(json).length) {
        return JSON.stringify(generateJSON({theme: theme.gravity}), null, 2);
    }
    return JSON.stringify(json, null, 2);
}

export function exportThemeCss(theme: EditorTheme): string {
    const gravity = generateCSS({theme: theme.gravity, libraries: ['illustrations']});
    const aikit = (['light', 'dark'] as const)
        .filter((variant) => Object.keys(theme.aikit[variant]).length)
        .map((variant) => {
            const declarations = Object.entries(theme.aikit[variant]).map(
                ([variable, value]) => `    ${variable}: ${validateValue(variable, value)};`,
            );
            return `.g-root_theme_${variant} {\n${declarations.join('\n')}\n}`;
        });
    return [...theme.gravity.typography.fontImports, gravity, ...aikit].join('\n\n');
}

export function scopeThemeCss(css: string): string {
    const root = parse(css);
    root.walkRules((rule) => {
        const selectors = rule.selectors.flatMap((selector) => {
            const match = /^\.g-root(?:_theme_(light|dark))?$/.exec(selector);
            if (!match) {
                throw new Error(`Unsupported preview selector: ${selector}.`);
            }
            const suffix = match[1] ? `.g-root_theme_${match[1]}` : '';
            return [`.${PREVIEW_CLASS}.g-root${suffix}`, `.${PREVIEW_CLASS} .g-root${suffix}`];
        });
        rule.assign({selector: selectors.join(', ')});
    });
    return root.toString();
}

export function downloadTheme(source: string, format: 'css' | 'json') {
    const blob = new Blob([source], {type: format === 'css' ? 'text/css' : 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aikit-theme.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Reconnect the brand palette to the semantic colors used by UIKit controls. */
export function updatePalette(
    theme: EditorTheme,
    token: string,
    variant: Theme,
    value: string,
): EditorTheme {
    let gravity = theme.gravity;
    if (token === 'brand' && !gravity.baseColors.brand) {
        gravity = updateBaseColor({
            theme: gravity,
            colorToken: 'brand',
            value: {
                light: gravity.utilityColors['base-brand'].light.value,
                dark: gravity.utilityColors['base-brand'].dark.value,
            },
        });
    }
    gravity = updateBaseColor({theme: gravity, colorToken: token, themeVariant: variant, value});
    if (token === 'brand') {
        const mappings = {
            'base-brand': ['550-solid', '550-solid'],
            'base-brand-hover': ['600-solid', '650-solid'],
            'base-selection': ['200', '150'],
            'base-selection-hover': ['300', '200'],
            'line-brand': ['600-solid', '600-solid'],
            'line-focus': ['550-solid', '550-solid'],
            'text-brand': ['700-solid', '600-solid'],
            'text-brand-heavy': ['700-solid', '700-solid'],
            'text-link': ['600-solid', '550-solid'],
            'text-link-hover': ['800-solid', '700-solid'],
        } as const;
        for (const [color, shades] of Object.entries(mappings)) {
            const shade = shades[variant === 'light' ? 0 : 1];
            const paletteColor = gravity.privateColors.brand[variant][shade];
            if (paletteColor) {
                gravity = updateUtilityColor({
                    theme: gravity,
                    colorToken: color as UtilityColor,
                    themeVariant: variant,
                    value: paletteColor.value,
                    ref: createInternalPrivateColorReference('brand', shade),
                });
            }
        }
        gravity = updateUtilityColor({
            theme: gravity,
            colorToken: 'text-brand-contrast',
            themeVariant: variant,
            value:
                chroma.contrast(value, '#ffffff') > chroma.contrast(value, '#000000')
                    ? '#ffffff'
                    : '#000000',
        });
    }
    return {...theme, gravity};
}
