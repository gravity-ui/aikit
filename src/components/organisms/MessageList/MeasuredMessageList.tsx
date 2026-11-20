import {
    type HTMLAttributes,
    forwardRef,
    useCallback,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';

import {
    type ListOnItemsRenderedProps,
    type ListOnScrollProps,
    VariableSizeList,
} from 'react-window';

import {block} from '../../../utils/cn';

import type {CachedRowHeight, MeasuredMessageListProps, RowData} from './MeasuredMessageList.types';
import {MeasuredRow} from './MeasuredRow';
import {useViewportSize} from './useViewportSize';

export type {MessageRowComponentProps} from './MeasuredMessageList.types';

const b = block('message-list');

/** v1 virtualizer with natural content measurement and the existing chat scroll interface. */
export function MeasuredMessageList<T extends object>({
    rowComponent,
    rowProps,
    rowCount,
    rowKeys,
    rowVersions,
    defaultRowHeight,
    overscanCount,
    className,
    listRef,
    onRowsRendered,
    'data-qa': qa,
}: MeasuredMessageListProps<T>) {
    const {viewportRef, viewportSize} = useViewportSize();
    const scrollElementRef = useRef<HTMLDivElement>(null);
    const virtualListRef = useRef<VariableSizeList<RowData<T>>>(null);
    const programmaticScrollTopRef = useRef<number>();
    const rowHeightsRef = useRef(new Map<string, CachedRowHeight>());

    const handleRowMeasured = useCallback(
        (index: number, key: string, version: unknown, height: number) => {
            const previous = rowHeightsRef.current.get(key);
            if (
                previous?.height === height &&
                previous.version === version &&
                previous.width === viewportSize.width
            ) {
                return;
            }
            rowHeightsRef.current.set(key, {version, width: viewportSize.width, height});
            virtualListRef.current?.resetAfterIndex(index);
        },
        [viewportSize.width],
    );

    // v1 caches offsets by index. Prepending, removing rows, changing content or changing width
    // invalidates these offsets even when the measured heights are still cached by message key.
    useLayoutEffect(() => {
        const keys = new Set(rowKeys);
        for (const key of rowHeightsRef.current.keys()) {
            if (!keys.has(key)) {
                rowHeightsRef.current.delete(key);
            }
        }
        virtualListRef.current?.resetAfterIndex(0);
    }, [rowKeys, rowVersions, rowProps, viewportSize.width]);

    useImperativeHandle(
        listRef,
        () => ({
            get element() {
                return scrollElementRef.current;
            },
            get programmaticScrollTop() {
                return programmaticScrollTopRef.current;
            },
            scrollToRow: ({index, align}) => virtualListRef.current?.scrollToItem(index, align),
        }),
        [],
    );

    // Keep the component identity stable so list updates do not remount the scroll container.
    const ScrollContainer = useMemo(
        () =>
            forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
                function ScrollContainerElement(props, ref) {
                    return <div {...props} ref={ref} role="list" data-qa={qa} />;
                },
            ),
        [qa],
    );

    const rowData: RowData<T> = {
        rowComponent,
        rowProps,
        rowKeys,
        rowVersions,
        onRowMeasured: handleRowMeasured,
    };

    const getRowKey = (index: number) => rowKeys[index];

    const getRowHeight = (index: number) => {
        const cached = rowHeightsRef.current.get(rowKeys[index]);
        const isMeasurementCurrent =
            cached?.version === rowVersions[index] && cached?.width === viewportSize.width;
        return isMeasurementCurrent ? cached.height : defaultRowHeight;
    };

    const handleScroll = ({scrollUpdateWasRequested, scrollOffset}: ListOnScrollProps) => {
        // v1 commits scrollToItem after the caller returns. Let the scroll hook distinguish
        // an upward measurement correction from the reader scrolling up.
        if (scrollUpdateWasRequested) {
            programmaticScrollTopRef.current = scrollOffset;
        }
    };

    const handleItemsRendered = ({
        visibleStartIndex,
        visibleStopIndex,
    }: ListOnItemsRenderedProps) => {
        onRowsRendered({startIndex: visibleStartIndex, stopIndex: visibleStopIndex});
    };

    return (
        <div className={b('viewport')} ref={viewportRef}>
            <VariableSizeList<RowData<T>>
                ref={virtualListRef}
                outerRef={scrollElementRef}
                outerElementType={ScrollContainer}
                className={className}
                height={viewportSize.height}
                width="100%"
                itemCount={rowCount}
                itemData={rowData}
                itemKey={getRowKey}
                itemSize={getRowHeight}
                estimatedItemSize={defaultRowHeight}
                overscanCount={overscanCount}
                onScroll={handleScroll}
                onItemsRendered={handleItemsRendered}
            >
                {MeasuredRow}
            </VariableSizeList>
        </div>
    );
}
