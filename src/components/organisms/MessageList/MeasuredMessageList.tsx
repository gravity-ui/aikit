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

    // Preserve the logical reading position while resized rows are measured asynchronously.
    const scrollAnchorRef = useRef<{
        key: string;
        offset: number;
        width: number;
        resizing?: boolean;
    }>();
    const resizeScrollTopRef = useRef<number>();

    useLayoutEffect(() => {
        const element = scrollElementRef.current;
        if (!element) {
            return undefined;
        }
        const handleNativeScroll = () => {
            if (element.scrollTop !== resizeScrollTopRef.current) {
                // Stop restoration before newly visible rows run their layout measurements.
                scrollAnchorRef.current = undefined;
                resizeScrollTopRef.current = undefined;
            }
        };
        element.addEventListener('scroll', handleNativeScroll, {capture: true, passive: true});
        return () => element.removeEventListener('scroll', handleNativeScroll, true);
    }, [qa]);

    const restoreResizeAnchor = useCallback(() => {
        const anchor = scrollAnchorRef.current;
        if (!anchor) {
            return;
        }
        if (anchor.width !== viewportSize.width) {
            anchor.width = viewportSize.width;
            anchor.resizing = true;
        }
        if (!anchor.resizing) {
            return;
        }
        const index = rowKeys.indexOf(anchor.key);
        if (index < 0) {
            scrollAnchorRef.current = undefined;
            return;
        }
        const anchorHeight = rowHeightsRef.current.get(anchor.key)?.height ?? defaultRowHeight;
        // Keep the anchor visible after it shrinks, retaining the saved offset for later growth.
        let top = Math.min(anchor.offset, Math.max(0, anchorHeight - 1));
        for (let i = 0; i < index; i++) {
            top += rowHeightsRef.current.get(rowKeys[i])?.height ?? defaultRowHeight;
        }
        resizeScrollTopRef.current = top;
        virtualListRef.current?.scrollTo(top);
    }, [rowKeys, defaultRowHeight, viewportSize.width]);

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
            restoreResizeAnchor();
        },
        [viewportSize.width, restoreResizeAnchor],
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
        restoreResizeAnchor();
    }, [rowKeys, rowVersions, rowProps, viewportSize.width, restoreResizeAnchor]);

    useImperativeHandle(
        listRef,
        () => ({
            get element() {
                return scrollElementRef.current;
            },
            get programmaticScrollTop() {
                return programmaticScrollTopRef.current;
            },
            scrollToRow: ({index, align}) => {
                // Explicit navigation and follow-bottom take priority over resize restoration.
                scrollAnchorRef.current = undefined;
                resizeScrollTopRef.current = undefined;
                virtualListRef.current?.scrollToItem(index, align);
            },
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
        // Keep stale measurements as estimates until the row is mounted and measured again.
        return cached?.height ?? defaultRowHeight;
    };

    const handleScroll = ({scrollUpdateWasRequested, scrollOffset}: ListOnScrollProps) => {
        // v1 commits scrollToItem after the caller returns. Let the scroll hook distinguish
        // an upward measurement correction from the reader scrolling up.
        if (scrollUpdateWasRequested) {
            programmaticScrollTopRef.current = scrollOffset;
        }
        if (scrollUpdateWasRequested && resizeScrollTopRef.current === scrollOffset) {
            return;
        }
        resizeScrollTopRef.current = undefined;
        let top = 0;
        for (const key of rowKeys) {
            const height = rowHeightsRef.current.get(key)?.height ?? defaultRowHeight;
            if (top + height > scrollOffset) {
                scrollAnchorRef.current = {
                    key,
                    offset: scrollOffset - top,
                    width: viewportSize.width,
                };
                break;
            }
            top += height;
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
