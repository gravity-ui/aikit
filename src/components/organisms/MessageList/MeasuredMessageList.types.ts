import type {AriaAttributes, CSSProperties, ComponentType, Ref} from 'react';

import type {VirtualMessageListApi} from '../../../hooks/useVirtualStickToBottom';

export type MessageRowComponentProps<T> = T & {
    index: number;
    style: CSSProperties;
    ariaAttributes: AriaAttributes & {role: string};
};

export type MeasuredMessageListProps<T> = {
    rowComponent: ComponentType<MessageRowComponentProps<T>>;
    rowProps: T;
    rowCount: number;
    rowKeys: string[];
    /** Content identities used to invalidate cached heights when a row changes. */
    rowVersions: unknown[];
    defaultRowHeight: number;
    overscanCount: number;
    className: string;
    listRef: Ref<VirtualMessageListApi>;
    onRowsRendered: (rows: {startIndex: number; stopIndex: number}) => void;
    'data-qa': string;
};

export type CachedRowHeight = {
    /** Message reference (or auxiliary row content) used for this measurement. */
    version: unknown;
    width: number;
    height: number;
};

export type RowData<T> = {
    rowComponent: ComponentType<MessageRowComponentProps<T>>;
    rowProps: T;
    rowKeys: string[];
    rowVersions: unknown[];
    onRowMeasured: (index: number, key: string, version: unknown, height: number) => void;
};
