/**
 * Chat utilities
 */

import type {ChatType} from '../types';

/**
 * Sort chats by creation date (newest first)
 * @param {ChatType[]} chats - Array of chats to sort
 * @returns {ChatType[]} Sorted array of chats
 */
export function sortChatsByDate(chats: ChatType[]): ChatType[] {
    return [...chats].sort((a, b) => {
        const dateA = a.createTime ? new Date(a.createTime).getTime() : 0;
        const dateB = b.createTime ? new Date(b.createTime).getTime() : 0;
        return dateB - dateA;
    });
}

/**
 * Group chats by date
 * @param {ChatType[]} chats - Array of chats to group
 * @returns {Record<string, ChatType[]>} Object with chats grouped by date categories
 */
export function groupChatsByDate(chats: ChatType[]): Record<string, ChatType[]> {
    const groups: Record<string, ChatType[]> = {
        today: [],
        yesterday: [],
        week: [],
        month: [],
        older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    chats.forEach((chat) => {
        if (!chat.createTime) {
            groups.older.push(chat);
            return;
        }

        const chatDate = new Date(chat.createTime);

        if (chatDate >= today) {
            groups.today.push(chat);
        } else if (chatDate >= yesterday) {
            groups.yesterday.push(chat);
        } else if (chatDate >= weekAgo) {
            groups.week.push(chat);
        } else if (chatDate >= monthAgo) {
            groups.month.push(chat);
        } else {
            groups.older.push(chat);
        }
    });

    return groups;
}
