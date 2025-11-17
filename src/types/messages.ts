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

export type TMessagePart<Type extends string = string, Data = unknown> = {
    id?: string;
    type: Type;
    data: Data;
};

export type TextMessagePartData = {
    text: string;
};

export type TextMessagePart = TMessagePart<'text', TextMessagePartData>;

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
export type ThinkingMessagePart = TMessagePart<'thinking', ThinkingMessagePartData>;

export type ToolMessagePartData = ToolMessageProps;

export type ToolMessagePart = TMessagePart<'tool', ToolMessagePartData>;

export type TDefaultMessagePart = TextMessagePart | ThinkingMessagePart | ToolMessagePart;

export type TMessagePartUnion<TAdditionalPart extends TMessagePart = never> =
    | TDefaultMessagePart
    | TAdditionalPart;

export type TAssistantMessageContent<TAdditionalPart extends TMessagePart = never> =
    | string
    | TMessagePartUnion<TAdditionalPart>
    | TMessagePartUnion<TAdditionalPart>[];

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

export type TAssistantMessage<
    Metadata = TMessageMetadata,
    TAdditionalPart extends TMessagePart = never,
> = TBaseMessage<Metadata> & {
    role: 'assistant';
    content: TAssistantMessageContent<TAdditionalPart>;
};

export type TMessage<TAdditionalPart extends TMessagePart = never, Metadata = TMessageMetadata> =
    | TUserMessage<Metadata>
    | TAssistantMessage<Metadata, TAdditionalPart>;
