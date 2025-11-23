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

export type TMessageRole = 'user' | 'assistant' | 'system';

export type TMessageContent<Type extends string = string, Data = unknown> = {
    id?: string;
    type: Type;
    data: Data;
};

export type TextMessageContentData = {
    text: string;
};

export type TextMessageContent = TMessageContent<'text', TextMessageContentData>;

export type ThinkingMessageContentData = {
    title?: string;
    content: string | string[];
    status: 'thinking' | 'thought';
    defaultExpanded?: boolean;
    showStatusIndicator?: boolean;
    onCopyClick?: () => void;
    className?: string;
    qa?: string;
};

export type ThinkingMessageContent = TMessageContent<'thinking', ThinkingMessageContentData>;

export type ToolMessageContentData = ToolMessageProps;

export type ToolMessageContent = TMessageContent<'tool', ToolMessageContentData>;

export type TDefaultMessageContent =
    | TextMessageContent
    | ThinkingMessageContent
    | ToolMessageContent;

export type TMessageContentUnion<TCustomMessageContent extends TMessageContent = never> =
    | TDefaultMessageContent
    | TCustomMessageContent;

export type TAssistantMessageContent<TCustomMessageContent extends TMessageContent = never> =
    | string
    | TMessageContentUnion<TCustomMessageContent>
    | TMessageContentUnion<TCustomMessageContent>[];

export type TBaseMessage<Metadata = TMessageMetadata> = Pick<
    BaseMessageProps,
    'actions' | 'timestamp'
> & {
    id?: string;
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
    TCustomMessageContent extends TMessageContent = never,
    Metadata = TMessageMetadata,
> = TBaseMessage<Metadata> & {
    role: 'assistant';
    content: TAssistantMessageContent<TCustomMessageContent>;
};

export type TChatMessage<
    TCustomMessageContent extends TMessageContent = never,
    Metadata = TMessageMetadata,
> = TUserMessage<Metadata> | TAssistantMessage<TCustomMessageContent, Metadata>;
