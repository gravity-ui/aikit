import {useEffect, useMemo, useRef, useState} from 'react';

import {ArrowDownToLine, ArrowRotateLeft, ArrowUpFromLine, Copy, Palette} from '@gravity-ui/icons';
import {
    Button,
    Icon,
    Modal,
    SegmentedRadioGroup,
    Select,
    Text,
    TextArea,
    TextInput,
} from '@gravity-ui/uikit';
import {BORDER_SIZES, updateUtilityColor} from '@gravity-ui/uikit-themer';
import type {Theme, UtilityColor} from '@gravity-ui/uikit-themer';

import {ColorField} from './ColorField';
import {ThemePreview} from './ThemePreview';
import type {PreviewScenario} from './ThemePreview';
import {AIKIT_SETTINGS, PALETTES, PRESETS} from './settings';
import {
    STORAGE_KEY,
    createTheme,
    downloadTheme,
    exportThemeCss,
    exportThemeJson,
    importTheme,
    scopeThemeCss,
    updatePalette,
} from './theme';
import type {EditorTheme} from './theme';

import './Themer.scss';

function restoreTheme() {
    try {
        const source = localStorage.getItem(STORAGE_KEY);
        return {theme: source ? importTheme(source) : createTheme(), notice: ''};
    } catch {
        return {
            theme: createTheme(),
            notice: 'The saved theme could not be restored. Import a theme or start again.',
        };
    }
}

function ValueField({
    label,
    value,
    onChange,
    kind = 'length',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    kind?: 'length' | 'duration';
}) {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    const valid =
        !draft ||
        (kind === 'duration'
            ? /^(?:\d*\.)?\d+(?:ms|s)$/
            : /^(?:\d*\.)?\d+(?:px|rem|em|%|vh|vw)$/
        ).test(draft);
    return (
        <label className="aikit-themer__field">
            <span>{label}</span>
            <TextInput
                controlProps={{'aria-label': label}}
                value={draft}
                placeholder={kind === 'duration' ? 'Default · e.g. 2.5s' : 'Default · e.g. 16px'}
                validationState={valid ? undefined : 'invalid'}
                onUpdate={(next) => {
                    setDraft(next);
                    if (
                        !next ||
                        (kind === 'duration'
                            ? /^(?:\d*\.)?\d+(?:ms|s)$/
                            : /^(?:\d*\.)?\d+(?:px|rem|em|%|vh|vw)$/
                        ).test(next)
                    ) {
                        onChange(next);
                    }
                }}
            />
        </label>
    );
}

export function Themer() {
    const [initial] = useState(restoreTheme);
    const [theme, setTheme] = useState<EditorTheme>(initial.theme);
    const [notice, setNotice] = useState(initial.notice);
    const [tab, setTab] = useState('colors');
    const [variant, setVariant] = useState<Theme>('light');
    const [previewMode, setPreviewMode] = useState('light');
    const [scenario, setScenario] = useState<PreviewScenario>('welcome');
    const [viewport, setViewport] = useState('desktop');
    const [semantic, setSemantic] = useState<UtilityColor>('base-background');
    const [dialog, setDialog] = useState<'import' | 'export' | null>(null);
    const [source, setSource] = useState('');
    const [format, setFormat] = useState<'css' | 'json'>('css');
    const [importError, setImportError] = useState('');
    const [readingFile, setReadingFile] = useState(false);
    const readRevision = useRef(0);
    useEffect(
        () => () => {
            readRevision.current++;
        },
        [],
    );
    const css = useMemo(() => exportThemeCss(theme), [theme]);
    const previewCss = useMemo(() => scopeThemeCss(css), [css]);
    const json = useMemo(() => exportThemeJson(theme), [theme]);
    const exportSource = format === 'css' ? css : json;
    const changeDialog = (next: typeof dialog) => {
        readRevision.current++;
        setReadingFile(false);
        setDialog(next);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, css);
            } catch {
                setNotice(
                    'Changes are available to export, but could not be saved in this browser.',
                );
            }
        }, 250);
        return () => clearTimeout(timeout);
    }, [css]);

    const updateAikit = (variable: string, value: string) =>
        setTheme((previous) => {
            const values = {...previous.aikit[variant]};
            if (value) {
                values[variable] = value;
            } else {
                delete values[variable];
            }
            return {...previous, aikit: {...previous.aikit, [variant]: values}};
        });
    const updateTypography = (family: 'sans' | 'monospace', value: string) =>
        setTheme((previous) => ({
            ...previous,
            gravity: {
                ...previous.gravity,
                typography: {
                    ...previous.gravity.typography,
                    fontFamilies: {
                        ...previous.gravity.typography.fontFamilies,
                        [family]: {
                            mainFont: value,
                            fallbackFonts: [family === 'sans' ? 'sans-serif' : 'monospace'],
                        },
                    },
                },
            },
        }));
    const importSource = () => {
        try {
            const next = importTheme(source);
            setTheme(next);
            changeDialog(null);
            setImportError('');
            setNotice('Theme imported. Both variants and AIKit settings are preserved.');
        } catch (error) {
            setImportError(
                error instanceof Error ? error.message : 'The theme could not be imported.',
            );
        }
    };
    const modes: Theme[] = previewMode === 'both' ? ['light', 'dark'] : [previewMode as Theme];

    return (
        <div className="aikit-themer">
            <style>{previewCss}</style>
            <header className="aikit-themer__header">
                <div className="aikit-themer__brand">
                    <span className="aikit-themer__logo">
                        <Icon data={Palette} size={22} />
                    </span>
                    <div>
                        <Text variant="subheader-3">AIKit</Text>
                        <div className="aikit-themer__eyebrow">THEME STUDIO</div>
                    </div>
                </div>
                <div className="aikit-themer__actions">
                    <Button
                        onClick={() => {
                            setTheme(createTheme());
                            setNotice('Theme reset to Gravity defaults.');
                        }}
                    >
                        <Icon data={ArrowRotateLeft} />
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            setSource('');
                            setImportError('');
                            changeDialog('import');
                        }}
                    >
                        <Icon data={ArrowUpFromLine} />
                        Import
                    </Button>
                    <Button view="action" onClick={() => changeDialog('export')}>
                        <Icon data={ArrowDownToLine} />
                        Export theme
                    </Button>
                </div>
            </header>
            <div className="aikit-themer__intro">
                <div>
                    <div className="aikit-themer__eyebrow">MAKE IT YOURS</div>
                    <h1>Your assistant. Your identity.</h1>
                    <p>
                        Shape the colors, type, and details. See your theme come to life in a real
                        chat.
                    </p>
                </div>
            </div>
            {notice && (
                <div role="status" className="aikit-themer__notice">
                    {notice}
                    <Button
                        size="s"
                        view="flat"
                        onClick={() => setNotice('')}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </Button>
                </div>
            )}
            <div className="aikit-themer__workspace">
                <aside className="aikit-themer__editor" aria-label="Theme settings">
                    <div className="aikit-themer__panel-heading">
                        <Text variant="subheader-2">Theme settings</Text>
                        <SegmentedRadioGroup
                            aria-label="Editing variant"
                            value={variant}
                            onUpdate={(value) => setVariant(value as Theme)}
                            options={[
                                {value: 'light', content: 'Light'},
                                {value: 'dark', content: 'Dark'},
                            ]}
                        />
                    </div>
                    <nav className="aikit-themer__tabs" aria-label="Settings category">
                        {[
                            ['colors', 'Colors'],
                            ['type', 'Typography'],
                            ['radius', 'Radius'],
                            ['aikit', 'AIKit'],
                        ].map(([id, title]) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={tab === id}
                                onClick={() => setTab(id)}
                            >
                                {title}
                            </button>
                        ))}
                    </nav>
                    <div className="aikit-themer__settings">
                        {tab === 'colors' && (
                            <>
                                <div className="aikit-themer__section-title">
                                    Start with a palette
                                </div>
                                <div className="aikit-themer__presets">
                                    {PRESETS.map((preset) => (
                                        <button
                                            type="button"
                                            key={preset.name}
                                            aria-label={`Apply ${preset.name} preset`}
                                            onClick={() => {
                                                let next = createTheme();
                                                if (preset.color) {
                                                    next = updatePalette(
                                                        next,
                                                        'brand',
                                                        'light',
                                                        preset.color,
                                                    );
                                                    next = updatePalette(
                                                        next,
                                                        'brand',
                                                        'dark',
                                                        preset.color,
                                                    );
                                                }
                                                setTheme(next);
                                                setNotice(
                                                    `${preset.name} preset applied. Previous custom settings were reset.`,
                                                );
                                            }}
                                        >
                                            <span style={{background: preset.color || '#ffbe5c'}} />
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                                <p className="aikit-themer__hint">
                                    Palettes update linked colors. Light and dark variants can be
                                    edited independently.
                                </p>
                                {PALETTES.map((token) => (
                                    <ColorField
                                        key={`${token}-${variant}`}
                                        label={
                                            token === 'brand' ? 'Brand' : token.replace('-', ' ')
                                        }
                                        value={
                                            theme.gravity.baseColors[token]?.[variant].value ||
                                            theme.gravity.utilityColors['base-brand'][variant].value
                                        }
                                        onChange={(value) =>
                                            setTheme((previous) =>
                                                updatePalette(previous, token, variant, value),
                                            )
                                        }
                                    />
                                ))}
                                <div className="aikit-themer__section-title">Semantic colors</div>
                                <Select
                                    aria-label="Semantic token"
                                    filterable
                                    width="max"
                                    value={[semantic]}
                                    onUpdate={([value]) => setSemantic(value as UtilityColor)}
                                    options={Object.keys(theme.gravity.utilityColors).map(
                                        (token) => ({value: token, content: token}),
                                    )}
                                />
                                <ColorField
                                    key={`${semantic}-${variant}`}
                                    label={semantic}
                                    value={theme.gravity.utilityColors[semantic][variant].value}
                                    onChange={(value) =>
                                        setTheme((previous) => ({
                                            ...previous,
                                            gravity: updateUtilityColor({
                                                theme: previous.gravity,
                                                colorToken: semantic,
                                                themeVariant: variant,
                                                value,
                                            }),
                                        }))
                                    }
                                />
                            </>
                        )}
                        {tab === 'type' && (
                            <>
                                <div className="aikit-themer__section-title">Font families</div>
                                <p className="aikit-themer__hint">
                                    Typography is shared by both modes. Use a font available in your
                                    application.
                                </p>
                                <label className="aikit-themer__field">
                                    <span>Interface font</span>
                                    <TextInput
                                        controlProps={{'aria-label': 'Interface font'}}
                                        value={theme.gravity.typography.fontFamilies.sans.mainFont}
                                        onUpdate={(value) => updateTypography('sans', value)}
                                    />
                                </label>
                                <label className="aikit-themer__field">
                                    <span>Code font</span>
                                    <TextInput
                                        controlProps={{'aria-label': 'Code font'}}
                                        value={
                                            theme.gravity.typography.fontFamilies.monospace.mainFont
                                        }
                                        onUpdate={(value) => updateTypography('monospace', value)}
                                    />
                                </label>
                                <div className="aikit-themer__section-title">Text styles</div>
                                {(
                                    ['body-1', 'body-2', 'header-1', 'header-2', 'code-1'] as const
                                ).map((style) => (
                                    <div className="aikit-themer__type-style" key={style}>
                                        <code>{style}</code>
                                        {(['font-size', 'line-height'] as const).map((property) => (
                                            <ValueField
                                                key={property}
                                                label={`${style} ${property}`}
                                                value={
                                                    theme.gravity.typography.variants[style][
                                                        property
                                                    ]
                                                }
                                                onChange={(value) => {
                                                    if (value) {
                                                        setTheme((previous) => ({
                                                            ...previous,
                                                            gravity: {
                                                                ...previous.gravity,
                                                                typography: {
                                                                    ...previous.gravity.typography,
                                                                    variants: {
                                                                        ...previous.gravity
                                                                            .typography.variants,
                                                                        [style]: {
                                                                            ...previous.gravity
                                                                                .typography
                                                                                .variants[style],
                                                                            [property]: value,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }));
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                        {tab === 'radius' && (
                            <>
                                <div className="aikit-themer__section-title">Round the edges</div>
                                <p className="aikit-themer__hint">
                                    Shared UIKit radii apply to controls and attachments. The chat
                                    bubble keeps its directional shape.
                                </p>
                                <div className="aikit-themer__presets">
                                    {[
                                        {name: 'Square', value: 0},
                                        {name: 'Soft', value: 8},
                                        {name: 'Round', value: 24},
                                    ].map((preset) => (
                                        <Button
                                            key={preset.name}
                                            onClick={() =>
                                                setTheme((previous) => ({
                                                    ...previous,
                                                    gravity: {
                                                        ...previous.gravity,
                                                        borders: Object.fromEntries(
                                                            BORDER_SIZES.map((size) => [
                                                                size,
                                                                `${preset.value}px`,
                                                            ]),
                                                        ) as typeof previous.gravity.borders,
                                                    },
                                                }))
                                            }
                                        >
                                            {preset.name}
                                        </Button>
                                    ))}
                                </div>
                                {BORDER_SIZES.map((size) => (
                                    <ValueField
                                        key={size}
                                        label={`Radius ${size}`}
                                        value={theme.gravity.borders[size]}
                                        onChange={(value) => {
                                            if (value) {
                                                setTheme((previous) => ({
                                                    ...previous,
                                                    gravity: {
                                                        ...previous.gravity,
                                                        borders: {
                                                            ...previous.gravity.borders,
                                                            [size]: value,
                                                        },
                                                    },
                                                }));
                                            }
                                        }}
                                    />
                                ))}
                            </>
                        )}
                        {tab === 'aikit' && (
                            <>
                                <div className="aikit-themer__section-title">
                                    Details that make it yours
                                </div>
                                <p className="aikit-themer__hint">
                                    Leave a value empty to use its default. Colors also accept
                                    references such as var(--g-color-base-brand).
                                </p>
                                {AIKIT_SETTINGS.map((setting) => (
                                    <div
                                        key={`${setting.variable}-${variant}`}
                                        className="aikit-themer__token-field"
                                    >
                                        {setting.kind === 'color' ? (
                                            <ColorField
                                                label={setting.label}
                                                allowReference
                                                value={theme.aikit[variant][setting.variable] || ''}
                                                onChange={(value) =>
                                                    updateAikit(setting.variable, value)
                                                }
                                            />
                                        ) : (
                                            <ValueField
                                                label={setting.label}
                                                kind={setting.kind}
                                                value={theme.aikit[variant][setting.variable] || ''}
                                                onChange={(value) =>
                                                    updateAikit(setting.variable, value)
                                                }
                                            />
                                        )}
                                        <code>{setting.variable}</code>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="aikit-themer__panel-footer">
                        Changes are saved in this browser.
                    </div>
                </aside>
                <section className="aikit-themer__preview" aria-label="Live chat preview">
                    <div className="aikit-themer__preview-toolbar">
                        <div className="aikit-themer__live">
                            <span />
                            Live preview
                        </div>
                        <SegmentedRadioGroup
                            aria-label="Preview color mode"
                            value={previewMode}
                            onUpdate={setPreviewMode}
                            options={[
                                {value: 'light', content: 'Light'},
                                {value: 'dark', content: 'Dark'},
                                {value: 'both', content: 'Both'},
                            ]}
                        />
                    </div>
                    <div className="aikit-themer__preview-controls">
                        <Select
                            aria-label="Preview scenario"
                            value={[scenario]}
                            onUpdate={([value]) => setScenario(value as PreviewScenario)}
                            options={[
                                {value: 'welcome', content: 'Welcome'},
                                {value: 'conversation', content: 'Conversation'},
                                {value: 'streaming', content: 'Streaming'},
                                {value: 'error', content: 'Error'},
                            ]}
                        />
                        <SegmentedRadioGroup
                            aria-label="Preview viewport"
                            value={viewport}
                            onUpdate={setViewport}
                            options={[
                                {value: 'desktop', content: 'Desktop'},
                                {value: 'mobile', content: 'Mobile'},
                            ]}
                        />
                    </div>
                    <div
                        className={`aikit-themer__stages aikit-themer__stages_${viewport} ${previewMode === 'both' ? 'aikit-themer__stages_both' : ''}`}
                    >
                        {modes.map((mode) => (
                            <div
                                className="aikit-themer__stage"
                                key={`${mode}-${scenario}-${viewport}`}
                            >
                                <div className="aikit-themer__stage-label">
                                    {mode} / {viewport}
                                </div>
                                <ThemePreview
                                    variant={mode}
                                    scenario={scenario}
                                    mobile={viewport === 'mobile'}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <Modal
                open={dialog !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        changeDialog(null);
                    }
                }}
                aria-labelledby="aikit-themer-dialog-title"
            >
                <div className="aikit-themer__dialog">
                    <div className="aikit-themer__dialog-heading">
                        <h2 id="aikit-themer-dialog-title">
                            {dialog === 'import' ? 'Import a theme' : 'Export your theme'}
                        </h2>
                        <Button
                            aria-label="Close dialog"
                            view="flat"
                            onClick={() => changeDialog(null)}
                        >
                            ×
                        </Button>
                    </div>
                    {dialog === 'import' ? (
                        <>
                            <p>
                                Paste CSS or JSON exported from Gravity Themer or AIKit. AIKit
                                variables are kept alongside the shared theme.
                            </p>
                            <label className="aikit-themer__file">
                                Choose a CSS or JSON file
                                <input
                                    type="file"
                                    aria-label="Theme file"
                                    accept=".css,.json,text/css,application/json"
                                    onChange={async (event) => {
                                        const revision = ++readRevision.current;
                                        const file = event.currentTarget.files?.[0];
                                        setReadingFile(false);
                                        if (!file) {
                                            return;
                                        }
                                        if (file.size > 500_000) {
                                            setImportError(
                                                'Choose a theme file smaller than 500 KB.',
                                            );
                                            return;
                                        }
                                        setReadingFile(true);
                                        try {
                                            const contents = await file.text();
                                            if (readRevision.current === revision) {
                                                setSource(contents);
                                                setImportError('');
                                            }
                                        } catch {
                                            if (readRevision.current === revision) {
                                                setImportError(
                                                    'The selected file could not be read.',
                                                );
                                            }
                                        } finally {
                                            if (readRevision.current === revision) {
                                                setReadingFile(false);
                                            }
                                        }
                                    }}
                                />
                            </label>
                            <TextArea
                                controlProps={{'aria-label': 'Theme source'}}
                                value={source}
                                onUpdate={(value) => {
                                    readRevision.current++;
                                    setReadingFile(false);
                                    setSource(value);
                                }}
                                rows={15}
                                validationState={importError ? 'invalid' : undefined}
                            />
                            {importError && (
                                <p role="alert" className="aikit-themer__error">
                                    {importError}
                                </p>
                            )}
                            <div className="aikit-themer__dialog-actions">
                                <Button onClick={() => changeDialog(null)}>Cancel</Button>
                                <Button
                                    view="action"
                                    disabled={!source.trim() || readingFile}
                                    onClick={importSource}
                                >
                                    Apply theme
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>
                                Import the CSS after UIKit and AIKit styles. JSON keeps editable
                                settings for both modes.
                            </p>
                            <SegmentedRadioGroup
                                aria-label="Export format"
                                value={format}
                                onUpdate={(value) => setFormat(value as 'css' | 'json')}
                                options={[
                                    {value: 'css', content: 'CSS'},
                                    {value: 'json', content: 'JSON'},
                                ]}
                            />
                            <TextArea
                                controlProps={{'aria-label': 'Exported theme'}}
                                readOnly
                                value={exportSource}
                                rows={17}
                            />
                            <div className="aikit-themer__dialog-actions">
                                <Button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(exportSource);
                                            setNotice('Theme copied to clipboard.');
                                        } catch {
                                            setNotice(
                                                'Copy was unavailable. Select the text or download the file.',
                                            );
                                        }
                                    }}
                                >
                                    <Icon data={Copy} />
                                    Copy
                                </Button>
                                <Button
                                    view="action"
                                    onClick={() => downloadTheme(exportSource, format)}
                                >
                                    <Icon data={ArrowDownToLine} />
                                    Download {format.toUpperCase()}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}
