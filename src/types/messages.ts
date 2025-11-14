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

export type ThinkingMessagePartData = {
    title?: string;
    content: string;
    steps?: Array<{
        id: string;
        text: string;
        status: 'pending' | 'running' | 'completed' | 'error';
    }>;
};

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
