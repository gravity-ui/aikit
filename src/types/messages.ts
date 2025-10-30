/**
 * Base types for chat messages
 */

// Message states
export type MessageState = 'initial' | 'loading' | 'success' | 'error' | 'streaming';

// Base message with common fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseMessage<TData = any> = {
    id: string;
    type: string;
    author: 'user' | 'assistant' | string;
    timestamp: string;
    state?: MessageState;
    data: TData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
};

// Simple text message
export type SimpleMessageData = {
    formattedText: string;
};

export type SimpleMessageType = BaseMessage<SimpleMessageData> & {
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

export type ThinkingMessageType = BaseMessage<ThinkingMessageData> & {
    type: 'thinking';
};

// Tool message
export type ToolMessageData = {
    toolName: string;
    toolStatus: 'submitted' | 'streaming' | 'ready' | 'error' | 'submitting' | 'confirming';
    content?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output?: Record<string, any>;
    onApprove?: () => void | Promise<void>;
    onReject?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
};

export type ToolMessageType = BaseMessage<ToolMessageData> & {
    type: 'tool';
};

// Union type of all messages
export type MessageType = SimpleMessageType | ThinkingMessageType | ToolMessageType;
