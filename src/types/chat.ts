// Base chat type
export type ChatType = {
    id: string;
    name: string;
    createTime: string | null;
    lastMessage?: string;
    metadata?: Record<string, unknown>;
};

/**
 * List item type for chat history that can be either a chat or a date header
 */
export type ListItemChatData =
    | (ChatType & {
          type: 'chat';
      })
    | {
          type: 'date-header';
          date: string;
      };
