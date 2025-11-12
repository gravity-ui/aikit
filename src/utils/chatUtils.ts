/**
 * Chat utilities
 */

import type {ListItemData} from '@gravity-ui/uikit';

import type {ChatType, ListItemChatData} from '../types';

/**
 * Groups chats by date
 *
 * @param chats - Array of chats to group
 * @returns Map of date keys to chat arrays
 */
export function groupChatsByDate(chats: ChatType[]): Map<string, ChatType[]> {
    const grouped = new Map<string, ChatType[]>();

    chats.forEach((chat) => {
        if (!chat.createTime) return;

        const date = new Date(chat.createTime);
        const dateKey = date.toDateString();

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)?.push(chat);
    });

    return grouped;
}

/**
 * Filter function type for chat list
 */
export type ChatFilterFunction = (
    filter: string,
) => (item: ListItemData<ListItemChatData>) => boolean;

/**
 * Default filter function - searches in chat name and last message
 *
 * @param filter - Search query string
 * @returns Function that filters list items
 */
export function defaultChatFilter(filter: string) {
    return (item: ListItemData<ListItemChatData>): boolean => {
        // Skip date headers from filtering
        if (item.type === 'date-header') {
            return true;
        }

        const chat = item;
        const lowerQuery = filter.toLowerCase();
        return (
            chat.name.toLowerCase().includes(lowerQuery) ||
            (chat.lastMessage?.toLowerCase().includes(lowerQuery) ?? false)
        );
    };
}
