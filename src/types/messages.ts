import type React from 'react';

import type {IconData} from '@gravity-ui/uikit';

import {ToolMessageProps} from './tool';

export type BaseMessageProps = {
    children: React.ReactNode;
    role: TMessageRole;
    actions?: Array<{
        type: string;
        onClick: () => void;
        icon?: IconData;
    }>;
    timestamp?: string;
    showTimestamp?: boolean;
    showActionsOnHover?: boolean;
    className?: string;
    qa?: string;
};

export type TMessageMetadata = Record<string, unknown>;

export type TSubmitData = {
    content: string;
    attachments?: File[];
    metadata?: TMessageMetadata;
};

export type TMessageStatus = 'sending' | 'complete' | 'error' | 'streaming';
export type TMessageRole = 'user' | 'assistant' | 'system';

export type TBaseMessagePart<Data = unknown> = {
    id?: string;
    type: string;
    data: Data;
};

export type TextMessagePartData = {
    text: string;
};

export type TextMessagePart = TBaseMessagePart<TextMessagePartData> & {
    type: 'text';
};

/**
 * Data structure for thinking/reasoning message content.
 * Used to display AI model's internal reasoning process.
 */
export type ThinkingMessagePartData = {
    /** Optional title for the thinking block */
    title?: string;
    /** Content of the thinking process, can be a single string or array of strings */
    content: string | string[];
    /** Current status: 'thinking' for in-progress, 'thought' for completed */
    status: 'thinking' | 'thought';
};

/**
 * Message part representing AI thinking/reasoning state.
 * Extends base message part with thinking-specific data.
 */
export type ThinkingMessagePart = TBaseMessagePart<ThinkingMessagePartData> & {
    type: 'thinking';
};

export type ToolMessagePartData = ToolMessageProps;

export type ToolMessagePart = TBaseMessagePart<ToolMessagePartData> & {
    type: 'tool';
};

export type TMessagePart =
    | TextMessagePart
    | ThinkingMessagePart
    | ToolMessagePart
    | TBaseMessagePart;

export type TBaseMessage<Metadata = TMessageMetadata> = Pick<
    BaseMessageProps,
    'actions' | 'timestamp'
> & {
    id?: string;
    status?: TMessageStatus;
    error?: unknown;
    metadata?: Metadata;
};

export type TUserMessage<Metadata = TMessageMetadata> = TBaseMessage<Metadata> & {
    role: 'user';
    content: string;
    format?: 'plain' | 'markdown';
    avatarUrl?: string;
};

export type TAssistantMessage<Metadata = TMessageMetadata> = TBaseMessage<Metadata> & {
    role: 'assistant';
    content: string | TMessagePart | TMessagePart[];
};

export type TMessage<Metadata = TMessageMetadata> =
    | TUserMessage<Metadata>
    | TAssistantMessage<Metadata>;
