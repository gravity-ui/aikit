import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, DOMProps, InputControlSize, List, ListItemData, QAProps} from '@gravity-ui/uikit';

import {ChatType, ListItemChatData} from '../../../types';
import {ChatFilterFunction, defaultChatFilter, groupChatsByDate} from '../../../utils/chatUtils';
import {block} from '../../../utils/cn';
import {IntersectionContainer} from '../../atoms/IntersectionContainer';
import {Loader} from '../../atoms/Loader';

import {ChatItem} from './ChatItem';
import {DateHeaderItem} from './DateHeaderItem';
import {i18n} from './i18n';

import './History.scss';

const b = block('history');

/** Result of lazy load more callback - either array of new chats or object with chats and hasMore flag */
export type LoadMoreLazyResult = ChatType[] | {chats: ChatType[]; hasMore?: boolean};

/** Callback for lazy load more - returns only new chats, not previously loaded */
export type OnLoadMoreLazy = (offset: number) => Promise<LoadMoreLazyResult>;

/** Load mode: full (button, parent manages all data) or lazy (scroll, component accumulates data) */
export type HistoryLoadMode = 'full' | 'lazy';

/**
 * Props for the HistoryList component
 */
export interface HistoryListProps extends QAProps, DOMProps {
    /** Array of chat items */
    chats: ChatType[];
    /** Currently selected chat */
    selectedChat?: ChatType | null;
    /** Callback when a chat is selected */
    onSelectChat?: (chat: ChatType) => void;
    /** Callback when a chat is deleted */
    onDeleteChat?: (chat: ChatType) => Promise<void>;
    /**
     * Callback to load more chats.
     * - Full mode: () => void - triggers load, parent updates chats prop
     * - Lazy mode: (offset) => Promise<ChatType[]|{chats,hasMore}> - returns only new chats
     */
    onLoadMore?: (() => void) | OnLoadMoreLazy;
    /** Whether there are more chats to load */
    hasMore?: boolean;
    /**
     * Load mode: 'full' (button click, parent provides all data) or 'lazy' (scroll, callback returns new data only)
     * @default 'full'
     */
    loadMode?: HistoryLoadMode;
    /** Enable search functionality */
    searchable?: boolean;
    /** Group chats by date or none */
    groupBy?: 'date' | 'none';
    /** Show action buttons (delete, etc.) */
    showActions?: boolean;
    /** Empty state placeholder */
    emptyPlaceholder?: React.ReactNode;
    /** Empty filtered state placeholder (when search returns no results) */
    emptyFilteredPlaceholder?: React.ReactNode;
    /** Placeholder text for the search/filter input (defaults to built-in i18n string) */
    searchPlaceholder?: string;
    /** Additional CSS class */
    className?: string;
    /** Custom filter function for search */
    filterFunction?: ChatFilterFunction;
    /** Loading state */
    loading?: boolean;
    /** Callback when chat is clicked (for closing popup in parent) */
    onChatClick?: (chat: ChatType) => void;
    /** Size of the list */
    size?: InputControlSize;
}

/**
 * HistoryList component - displays a list of chats with search, grouping, and actions
 *
 * @param props - {@link HistoryListProps}
 * @returns Rendered history list (search, grouping, lazy/full load, chat rows).
 */
export function HistoryList(props: HistoryListProps) {
    const {
        chats,
        selectedChat,
        onSelectChat,
        onDeleteChat,
        onLoadMore,
        hasMore = false,
        loadMode = 'full',
        searchable = true,
        groupBy = 'date',
        showActions = true,
        emptyPlaceholder,
        emptyFilteredPlaceholder,
        searchPlaceholder,
        className,
        qa,
        style,
        filterFunction = defaultChatFilter,
        loading = false,
        onChatClick,
        size = 'm',
    } = props;

    const [filteredItemCount, setFilteredItemCount] = useState<number | null>(null);
    const [loadedChats, setLoadedChats] = useState<ChatType[]>([]);
    const [lazyHasMore, setLazyHasMore] = useState(hasMore);
    const [deletedChats, setDeletedChats] = useState<Set<string>>(new Set());

    const loadingMoreRef = useRef(false);

    const displayChats = useMemo(() => {
        const totalChats = loadMode === 'lazy' ? [...chats, ...loadedChats] : chats;

        const filteredChats = totalChats.filter((chat) => !deletedChats.has(chat.id));

        return filteredChats;
    }, [loadMode, chats, loadedChats, deletedChats]);

    const displayChatsLengthRef = useRef(displayChats.length);
    displayChatsLengthRef.current = displayChats.length;

    useEffect(() => {
        if (loadMode === 'lazy') {
            setLazyHasMore(hasMore);
        }
    }, [loadMode, hasMore]);

    useEffect(() => {
        if (loadMode === 'lazy') {
            setLoadedChats([]);
        }
    }, [chats, loadMode]);

    const groupedChats = useMemo(() => {
        if (groupBy === 'none') {
            return new Map([['all', displayChats]]);
        }
        return groupChatsByDate(displayChats);
    }, [displayChats, groupBy]);

    const listItems: ListItemData<ListItemChatData>[] = useMemo(() => {
        const items: ListItemData<ListItemChatData>[] = [];

        const sortedGroups = Array.from(groupedChats.entries()).sort(([dateA], [dateB]) => {
            if (dateA === 'all') return 0;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        sortedGroups.forEach(([dateKey, groupChats]) => {
            if (groupChats.length === 0) {
                return;
            }

            if (groupBy === 'date' && dateKey !== 'all') {
                items.push({
                    type: 'date-header',
                    disabled: true,
                    date: dateKey,
                });
            }

            groupChats.forEach((chat) => {
                items.push({
                    type: 'chat',
                    ...chat,
                });
            });
        });

        return items;
    }, [groupedChats, groupBy]);

    const selectedItemIndex = useMemo(() => {
        return listItems.findIndex((item) => item.type === 'chat' && item.id === selectedChat?.id);
    }, [listItems, selectedChat]);

    const effectiveHasMore = loadMode === 'lazy' ? lazyHasMore : hasMore;

    /**
     * Unified load more handler.
     * full: fires onLoadMore(), parent manages data and hasMore
     * lazy: calls onLoadMore(offset), accumulates returned chats internally
     */
    const handleLoadMore = useCallback(async () => {
        if (!onLoadMore || loadingMoreRef.current) {
            return;
        }

        if (loadMode === 'full') {
            (onLoadMore as () => void)();
            return;
        }

        loadingMoreRef.current = true;
        try {
            const offset = displayChatsLengthRef.current;
            const result = await (onLoadMore as OnLoadMoreLazy)(offset);
            const newChats = Array.isArray(result) ? result : result.chats;
            const resultHasMore = Array.isArray(result) ? newChats.length > 0 : result.hasMore;
            setLoadedChats((prev) => [...prev, ...newChats]);
            setLazyHasMore(resultHasMore ?? newChats.length > 0);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('HistoryList: failed to load more chats', error);
        } finally {
            loadingMoreRef.current = false;
        }
    }, [onLoadMore, loadMode]);

    const handleChatClick = (
        chat: ListItemData<ListItemChatData>,
        _: number,
        fromKeyboard?: boolean,
        event?: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
    ) => {
        if (fromKeyboard && (event?.target as HTMLButtonElement)?.type === 'button') {
            return;
        }
        onSelectChat?.(chat as ChatType);
        onChatClick?.(chat as ChatType);
    };

    const handleDeleteClick = async (e: React.MouseEvent, chat: ChatType) => {
        e.stopPropagation();
        try {
            await onDeleteChat?.(chat);
            setDeletedChats((prevDeletedChats) => new Set([...prevDeletedChats, chat.id]));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('HistoryList: failed to delete chat', error);
        }
    };

    const wrappedFilterFunction = useMemo(() => {
        return (filter: string) => {
            const userFilter = filterFunction(filter);
            return (item: ListItemData<ListItemChatData>): boolean => {
                if (filter && item.type === 'date-header') {
                    return false;
                }
                return userFilter(item);
            };
        };
    }, [filterFunction]);

    const renderItem = (item: ListItemData<ListItemChatData>, isActive: boolean) => {
        if (item.type === 'date-header') {
            return <DateHeaderItem key={`date-${item.date}`} date={item.date} />;
        }

        return (
            <ChatItem
                key={item.id}
                chat={item}
                showActions={showActions}
                onDeleteClick={onDeleteChat ? handleDeleteClick : undefined}
                isActive={isActive}
            />
        );
    };

    const emptyState = emptyPlaceholder || <div className={b('empty')}>{i18n('empty-state')}</div>;

    const emptyFilteredState = emptyFilteredPlaceholder || (
        <div className={b('empty')}>{i18n('empty-filtered-state')}</div>
    );

    const finalEmptyPlaceholder =
        filteredItemCount === null || filteredItemCount === listItems.length
            ? emptyState
            : emptyFilteredState;

    return (
        <div className={b('container', className)} data-qa={qa} style={style}>
            <div className={b('list-wrapper')}>
                {loading ? (
                    <div className={b('loader-wrapper')}>
                        <Loader view="loading" />
                    </div>
                ) : (
                    <React.Fragment>
                        <List
                            size={size}
                            items={listItems}
                            renderItem={renderItem}
                            virtualized={false}
                            filterable={searchable}
                            filterItem={wrappedFilterFunction}
                            filterPlaceholder={searchPlaceholder ?? i18n('search-placeholder')}
                            filterClassName={b('filter')}
                            emptyPlaceholder={finalEmptyPlaceholder}
                            selectedItemIndex={selectedItemIndex}
                            itemsClassName={b('list')}
                            itemClassName={b('list-item')}
                            onFilterEnd={(data) => setFilteredItemCount(data.items.length)}
                            onItemClick={handleChatClick}
                        />
                        {loadMode === 'lazy' && effectiveHasMore && onLoadMore && (
                            <IntersectionContainer
                                key={displayChats.length}
                                onIntersect={handleLoadMore}
                                className={b('lazy-loader')}
                            >
                                <Loader view="loading" />
                            </IntersectionContainer>
                        )}
                    </React.Fragment>
                )}
            </div>

            {loadMode === 'full' && hasMore && onLoadMore && (
                <Button view="flat-action" size="m" width="max" onClick={handleLoadMore}>
                    {i18n('action-load-more')}
                </Button>
            )}
        </div>
    );
}
