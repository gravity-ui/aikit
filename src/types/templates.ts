/**
 * Types for templates
 */

// Base chat type
export type ChatType = {
    id: string;
    name: string;
    createTime: string | null;
    lastMessage?: string;
    metadata?: Record<string, any>;
};
