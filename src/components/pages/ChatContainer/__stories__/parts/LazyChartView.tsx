import React from 'react';

import type {MessageContentComponentProps} from '../../../../../utils/messageTypeRegistry';

import type {ChartMessageContent} from './chartMessageTypes';

// ---------------------------------------------------------------------------
// "Heavy" custom renderer, kept in a separate module so it can be code-split.
//
// Consumers register custom message types via the renderer registry. Because a
// registered renderer is just a React component, it can be loaded lazily with
// `React.lazy(() => import('./LazyChartView'))` so that a heavy dependency
// (charting libraries, editors, maps, ...) ends up in its own chunk and is only
// fetched when a message of that type is actually rendered.
//
// Demo-only styles live inline in this story file, not in component SCSS.
// ---------------------------------------------------------------------------

const LazyChartView: React.FC<MessageContentComponentProps<ChartMessageContent>> = ({part}) => {
    const {title, bars} = part.data;
    const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
                maxWidth: '420px',
            }}
        >
            {title ? <div style={{marginBottom: '16px', fontWeight: 600}}>{title}</div> : null}
            <div style={{display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px'}}>
                {bars.map((bar) => (
                    <div
                        key={bar.label}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                flex: 1,
                                width: '100%',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    marginBottom: '4px',
                                    color: 'var(--g-color-text-secondary)',
                                }}
                            >
                                {bar.value}
                            </div>
                            <div
                                style={{
                                    height: `${(bar.value / maxValue) * 100}%`,
                                    minHeight: '4px',
                                    borderRadius: '4px 4px 0 0',
                                    backgroundColor: bar.color ?? 'var(--g-color-base-brand)',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                textAlign: 'center',
                                marginTop: '8px',
                                color: 'var(--g-color-text-secondary)',
                            }}
                        >
                            {bar.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Default export so the module can be referenced by `React.lazy(() => import(...))`.
export default LazyChartView;
