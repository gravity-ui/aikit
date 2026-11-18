import {useLayoutEffect, useRef} from 'react';

import type {ListChildComponentProps} from 'react-window';

import type {RowData} from './MeasuredMessageList.types';

export function MeasuredRow<T>({index, style, data}: ListChildComponentProps<RowData<T>>) {
    const contentRef = useRef<HTMLDivElement>(null);
    const {rowComponent: RowComponent, rowProps, rowKeys, rowVersions, onRowMeasured} = data;
    const rowKey = rowKeys[index];
    const rowVersion = rowVersions[index];

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return undefined;
        }
        const measureContent = () => {
            const {width, height} = content.getBoundingClientRect();
            // Hidden chat screens have no layout; do not overwrite their cached heights with zero.
            if (content.getClientRects().length && width > 0) {
                onRowMeasured(index, rowKey, rowVersion, height);
            }
        };
        measureContent();
        const observer = new ResizeObserver(measureContent);
        observer.observe(content);
        return () => observer.disconnect();
    }, [index, rowKey, rowVersion, onRowMeasured]);

    return (
        <div style={style}>
            {/* Measure natural content height, independently of the virtualizer's fixed height. */}
            <div ref={contentRef} style={{display: 'flow-root'}}>
                <RowComponent
                    {...rowProps}
                    index={index}
                    style={{}}
                    ariaAttributes={{
                        role: 'listitem',
                        'aria-posinset': index + 1,
                        'aria-setsize': rowKeys.length,
                    }}
                />
            </div>
        </div>
    );
}
