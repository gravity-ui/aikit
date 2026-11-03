import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
    Button,
    DOMProps,
    InputControlSize,
    List,
    ListItemView,
    QAProps,
    TextInput,
    useListFocusOwner,
} from '@gravity-ui/uikit';

import {DateLocaleConfig} from '../../../hooks';
import {useMobileControlSize} from '../../../hooks/useMobileControlSize';
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

type HistoryListItem = ListItemChatData & {rowKey: string; disabled?: boolean};

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
    /** Controlled pinned identifiers. Omit to disable pinning. */
    pinnedChatIds?: readonly string[];
    /** Requests a pin state change; the application updates pinnedChatIds. */
    onPinnedChange?: (chatId: string, pinned: boolean) => void;
    /** Disable pin actions while persistence is pending. */
    pinningDisabled?: boolean;
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
    /** Custom dayjs format for non-relative date headers */
    dateFormat?: string;
    /** Locale for non-relative date headers */
    dateLocale?: string;
    /** Dayjs locale configuration for non-relative date headers */
    dateLocaleConfig?: DateLocaleConfig;
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
    const {t} = i18n.useTranslation();
    const {
        chats,
        selectedChat,
        pinnedChatIds,
        onPinnedChange,
        pinningDisabled,
        onSelectChat,
        onDeleteChat,
        onLoadMore,
        hasMore = false,
        loadMode = 'full',
        searchable = true,
        groupBy = 'date',
        dateFormat,
        dateLocale,
        dateLocaleConfig,
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
        size: sizeProp,
    } = props;

    const size = useMobileControlSize(sizeProp, 'm', 'xl');

    const [filter, setFilter] = useState('');
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const focusOwner = useListFocusOwner();
    const {onKeyDown, ...inputProps} = focusOwner.getInputProps({
        'aria-label': searchPlaceholder ?? t('search-placeholder'),
    });
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

    const listItems = useMemo(() => {
        const items: HistoryListItem[] = [];

        if (pinnedChatIds !== undefined) {
            const pinned = new Set(pinnedChatIds);
            const ordered = [
                ...displayChats.filter((chat) => pinned.has(chat.id)),
                ...displayChats.filter((chat) => !pinned.has(chat.id)),
            ];
            let previousDate: string | undefined;
            ordered.forEach((chat) => {
                const date =
                    !pinned.has(chat.id) && chat.createTime
                        ? new Date(chat.createTime).toDateString()
                        : undefined;
                if (groupBy === 'date' && date && date !== previousDate) {
                    items.push({
                        type: 'date-header',
                        disabled: true,
                        date,
                        rowKey: `date:${date}:${chat.id}`,
                    });
                }
                previousDate = date;
                items.push({...chat, type: 'chat', rowKey: `chat:${chat.id}`});
            });
            return items;
        }

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
                    rowKey: `date:${dateKey}`,
                });
            }

            groupChats.forEach((chat) => {
                items.push({
                    type: 'chat',
                    ...chat,
                    rowKey: `chat:${chat.id}`,
                });
            });
        });

        return items;
    }, [groupedChats, groupBy, displayChats, pinnedChatIds]);

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
        _: string,
        chat: HistoryListItem,
        event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
    ) => {
        if (chat.type !== 'chat' || (event.target as HTMLElement).closest('button')) {
            return;
        }
        onSelectChat?.(chat);
        onChatClick?.(chat);
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

    const filterItems = (query: string) => {
        if (!searchable || !query) {
            return listItems;
        }
        const userFilter = filterFunction(query);
        return listItems.filter((item) => {
            if (query && item.type === 'date-header') {
                return false;
            }
            return userFilter(item);
        });
    };
    const filteredItems = filterItems(searchable ? filter : '');

    const renderItem = (item: ListItemChatData, isActive: boolean) => {
        if (item.type === 'date-header') {
            return (
                <DateHeaderItem
                    key={`date-${item.date}`}
                    date={item.date}
                    format={dateFormat}
                    locale={dateLocale}
                    localeConfig={dateLocaleConfig}
                />
            );
        }

        return (
            <ChatItem
                key={item.id}
                chat={item}
                showActions={showActions}
                pinned={pinnedChatIds?.includes(item.id)}
                onPinnedChange={pinnedChatIds === undefined ? undefined : onPinnedChange}
                pinningDisabled={pinningDisabled}
                onDeleteClick={onDeleteChat ? handleDeleteClick : undefined}
                isActive={isActive}
                actionTabIndex={searchable ? 0 : -1}
                size={sizeProp}
            />
        );
    };

    const emptyState = emptyPlaceholder || <div className={b('empty')}>{t('empty-state')}</div>;

    const emptyFilteredState = emptyFilteredPlaceholder || (
        <div className={b('empty')}>{t('empty-filtered-state')}</div>
    );

    const finalEmptyPlaceholder = !searchable || !filter ? emptyState : emptyFilteredState;

    return (
        <div className={b('container', className)} data-qa={qa} style={style}>
            <div className={b('list-wrapper')}>
                {loading ? (
                    <div className={b('loader-wrapper')}>
                        <Loader view="loading" />
                    </div>
                ) : (
                    <React.Fragment>
                        {searchable && (
                            <div className={b('filter')}>
                                <TextInput
                                    size={size}
                                    value={filter}
                                    hasClear
                                    placeholder={searchPlaceholder ?? t('search-placeholder')}
                                    controlProps={inputProps}
                                    onKeyDown={onKeyDown}
                                    onUpdate={(query) => {
                                        setFilter(query);
                                        setActiveItemId(
                                            filterItems(query).find((item) => item.type === 'chat')
                                                ?.rowKey ?? null,
                                        );
                                    }}
                                />
                            </div>
                        )}
                        {filteredItems.length === 0 ? (
                            finalEmptyPlaceholder
                        ) : (
                            <List<HistoryListItem>
                                role="grid"
                                aria-label={t('sheet-title')}
                                size={size}
                                items={filteredItems}
                                getItemId={(item) => item.rowKey}
                                getItemTextValue={(item) =>
                                    item.type === 'chat' ? item.lastMessage || item.name : item.date
                                }
                                focusOwner={searchable ? focusOwner : undefined}
                                activeItemId={activeItemId}
                                onActiveItemUpdate={setActiveItemId}
                                selectionMode="single"
                                selectedIds={selectedChat ? [`chat:${selectedChat.id}`] : []}
                                className={b('list')}
                                renderItem={({item, state}, helpers) => (
                                    <ListItemView
                                        isContainer
                                        {...helpers.getItemProps({className: b('list-item')})}
                                        {...helpers.getItemViewProps()}
                                    >
                                        <div {...helpers.getCellProps()}>
                                            {renderItem(item, state.active)}
                                        </div>
                                    </ListItemView>
                                )}
                                onItemAction={handleChatClick}
                            />
                        )}
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
                    {t('action-load-more')}
                </Button>
            )}
        </div>
    );
}
