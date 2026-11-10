import type {ChatType} from '../../../types';

/** Keep existing rows stable within their current pin/date group; new rows follow that group. */
export function orderHistoryChats(
    chats: ChatType[],
    previousIds: readonly string[],
    options: {preserveOrder: boolean; groupBy: 'date' | 'none'; pinnedChatIds?: readonly string[]},
): ChatType[] {
    if (!options.preserveOrder) {
        return chats;
    }
    const positions = new Map(previousIds.map((id, index) => [id, index]));
    const pinned = new Set(options.pinnedChatIds);
    const day = (chat: ChatType) => {
        const value = chat.createTime ? new Date(chat.createTime).setHours(0, 0, 0, 0) : NaN;
        return Number.isNaN(value) ? -Infinity : value;
    };
    return [...chats].sort((first, second) => {
        const firstPinned = pinned.has(first.id);
        const secondPinned = pinned.has(second.id);
        if (firstPinned !== secondPinned) {
            return firstPinned ? -1 : 1;
        }
        if (options.groupBy === 'date' && !firstPinned && day(first) !== day(second)) {
            return day(second) - day(first);
        }
        return (
            (positions.get(first.id) ?? previousIds.length) -
            (positions.get(second.id) ?? previousIds.length)
        );
    });
}
