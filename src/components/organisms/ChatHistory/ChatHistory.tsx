import React from 'react';

import {DOMProps, Popup, QAProps} from '@gravity-ui/uikit';

import {ChatType} from '../../../types';
import {ChatFilterFunction} from '../../../utils/chatUtils';
import {block} from '../../../utils/cn';

import {ChatHistoryList} from './ChatHistoryList';

import './ChatHistory.scss';

const b = block('chat-history');

/**
 * Props for the ChatHistory component
 */
export interface ChatHistoryProps extends QAProps, DOMProps {
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
    /** Ref to the anchor element for the popup */
    anchorRef: React.RefObject<HTMLElement>;
}

/**
 * ChatHistory component - wraps ChatHistoryList in a Popup
 *
 * @param props - Component props
 * @returns React component
 */
export function ChatHistory(props: ChatHistoryProps) {
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
        anchorRef,
    } = props;

    const handleChatClick = () => {
        onOpenChange?.(false);
    };

    return (
        <Popup
            className={b('popup')}
            anchorRef={anchorRef}
            placement="bottom-end"
            open={open}
            onOpenChange={onOpenChange}
        >
            <ChatHistoryList
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
