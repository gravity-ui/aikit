/**
 * Types for templates
 */

// Base chat type
export type ChatType = {
    id: string;
    name: string;
    createTime: string | null;
    lastMessage?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
};
