import React from 'react';

import {DOMProps, Popup, QAProps} from '@gravity-ui/uikit';

import {ChatType} from '../../../types';
import {ChatFilterFunction} from '../../../utils/chatUtils';

import {HistoryList} from './HistoryList';

/**
 * Props for the History component
 */
export interface HistoryProps extends QAProps, DOMProps {
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
    /** Control popup open state */
    open?: boolean;
    /** Callback when popup open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Anchor element for the popup */
    anchorElement: HTMLElement | null;
}

/**
 * History component - wraps HistoryList in a Popup
 *
 * @param props - Component props
 * @returns React component
 */
export function History(props: HistoryProps) {
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
        filterFunction,
        open = false,
        onOpenChange,
        anchorElement,
    } = props;

    const handleChatClick = () => {
        onOpenChange?.(false);
    };

    return (
        <Popup
            anchorElement={anchorElement}
            placement="bottom-end"
            open={open}
            onOpenChange={onOpenChange}
        >
            <HistoryList
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
                onDeleteChat={onDeleteChat}
                onLoadMore={onLoadMore}
                hasMore={hasMore}
                searchable={searchable}
                groupBy={groupBy}
                showActions={showActions}
                emptyPlaceholder={emptyPlaceholder}
                className={className}
                qa={qa}
                style={style}
                filterFunction={filterFunction}
                onChatClick={handleChatClick}
            />
        </Popup>
    );
}
