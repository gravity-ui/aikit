/**
 * Base types for chat messages
 */

export type TSubmitData = {
    content: string;
    attachments?: File[];
    metadata?: Record<string, unknown>;
};

// Message states
export type MessageState = 'initial' | 'loading' | 'success' | 'error' | 'streaming';

// Base message with common fields
export type BaseMessageType<TData = unknown> = {
    id: string;
    type: string;
    author: 'user' | 'assistant' | string;
    timestamp: string;
    state?: MessageState;
    data: TData;
    metadata?: Record<string, unknown>;
};

// Simple text message
export type SimpleMessageData = {
    formattedText: string;
};

export type SimpleMessageType = BaseMessageType<SimpleMessageData> & {
    type: 'simple';
};

// Thinking message
export type ThinkingMessageData = {
    title?: string;
    content: string;
    steps?: Array<{
        id: string;
        text: string;
        status: 'pending' | 'running' | 'completed' | 'error';
    }>;
};

export type ThinkingMessageType = BaseMessageType<ThinkingMessageData> & {
    type: 'thinking';
};

// Tool message
export type ToolMessageData = {
    toolName: string;
    toolStatus: 'submitted' | 'streaming' | 'ready' | 'error' | 'submitting' | 'confirming';
    content?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    onApprove?: () => void | Promise<void>;
    onReject?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
};

export type ToolMessageType = BaseMessageType<ToolMessageData> & {
    type: 'tool';
};

// Union type of all messages
export type MessageType = SimpleMessageType | ThinkingMessageType | ToolMessageType;
