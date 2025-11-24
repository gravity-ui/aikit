import React, {useMemo} from 'react';

import {Button, DOMProps, List, ListItemData, QAProps} from '@gravity-ui/uikit';

import {ChatType, ListItemChatData} from '../../../types';
import {ChatFilterFunction, defaultChatFilter, groupChatsByDate} from '../../../utils/chatUtils';
import {block} from '../../../utils/cn';
import {Loader} from '../../atoms/Loader';

import {ChatItem} from './ChatItem';
import {DateHeaderItem} from './DateHeaderItem';
import {i18n} from './i18n';

import './History.scss';

const b = block('history');

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
    onDeleteChat?: (chat: ChatType) => void;
    /** Callback to load more chats */
    onLoadMore?: () => void;
    /** Whether there are more chats to load */
    hasMore?: boolean;
    /** Enable search functionality */
    searchable?: boolean;
    /** Group chats by date or none */
    groupBy?: 'date' | 'none';
    /** Show action buttons (delete, etc.) */
    showActions?: boolean;
    /** Empty state placeholder */
    emptyPlaceholder?: React.ReactNode;
    /** Additional CSS class */
    className?: string;
    /** Custom filter function for search */
    filterFunction?: ChatFilterFunction;
    /** Loading state */
    loading?: boolean;
    /** Callback when chat is clicked (for closing popup in parent) */
    onChatClick?: (chat: ChatType) => void;
}

/**
 * HistoryList component - displays a list of chats with search, grouping, and actions
 *
 * @param props - Component props
 * @returns React component
 */
export function HistoryList(props: HistoryListProps) {
    const {
        chats,
        selectedChat,
        onSelectChat,
        onDeleteChat,
        onLoadMore,
        hasMore = false,
        searchable = true,
        groupBy = 'date',
        showActions = true,
        emptyPlaceholder,
        className,
        qa,
        style,
        filterFunction = defaultChatFilter,
        loading = false,
        onChatClick,
    } = props;

    // Group chats if needed
    const groupedChats = useMemo(() => {
        if (groupBy === 'none') {
            return new Map([['all', chats]]);
        }
        return groupChatsByDate(chats);
    }, [chats, groupBy]);

    // Convert grouped chats to list items
    const listItems: ListItemData<ListItemChatData>[] = useMemo(() => {
        const items: ListItemData<ListItemChatData>[] = [];

        // Sort groups by date (newest first)
        const sortedGroups = Array.from(groupedChats.entries()).sort(([dateA], [dateB]) => {
            if (dateA === 'all') return 0;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        sortedGroups.forEach(([dateKey, groupChats]) => {
            // Skip empty groups (important for filtering)
            if (groupChats.length === 0) {
                return;
            }

            // Add date header for grouped view only if there are chats in this group
            if (groupBy === 'date' && dateKey !== 'all') {
                items.push({
                    type: 'date-header',
                    disabled: true,
                    date: dateKey,
                });
            }

            // Add chat items
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

    const handleChatClick = (chat: ChatType) => {
        onSelectChat?.(chat);
        onChatClick?.(chat);
    };

    const handleDeleteClick = (e: React.MouseEvent, chat: ChatType) => {
        e.stopPropagation();
        onDeleteChat?.(chat);
    };

    // Wrap filter function to hide date headers when filter is active
    const wrappedFilterFunction = useMemo(() => {
        return (filter: string) => {
            const userFilter = filterFunction(filter);
            return (item: ListItemData<ListItemChatData>): boolean => {
                // Hide date headers when searching (they will be empty after chat filtering)
                if (filter && item.type === 'date-header') {
                    return false;
                }
                return userFilter(item);
            };
        };
    }, [filterFunction]);

    const renderItem = (item: ListItemData<ListItemChatData>) => {
        if (item.type === 'date-header') {
            return <DateHeaderItem key={`date-${item.date}`} date={item.date} />;
        }

        return (
            <ChatItem
                key={item.id}
                chat={item}
                showActions={showActions}
                onChatClick={handleChatClick}
                onDeleteClick={onDeleteChat ? handleDeleteClick : undefined}
            />
        );
    };

    const emptyState = emptyPlaceholder || <div className={b('empty')}>{i18n('empty-state')}</div>;

    return (
        <div className={b('container', className)} data-qa={qa} style={style}>
            <div className={b('list-wrapper')}>
                {loading ? (
                    <div className={b('loader-wrapper')}>
                        <Loader view="loading" />
                    </div>
                ) : (
                    <List
                        items={listItems}
                        renderItem={renderItem}
                        virtualized={false}
                        filterable={searchable}
                        filterItem={wrappedFilterFunction}
                        filterPlaceholder={i18n('search-placeholder')}
                        filterClassName={b('filter')}
                        emptyPlaceholder={emptyState}
                        selectedItemIndex={selectedItemIndex}
                        itemsClassName={b('list')}
                        itemClassName={b('list-item')}
                    />
                )}
            </div>

            {hasMore && onLoadMore && (
                <Button view="flat-action" size="m" width="max" onClick={onLoadMore}>
                    {i18n('action-load-more')}
                </Button>
            )}
        </div>
    );
}
