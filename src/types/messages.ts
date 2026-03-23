import type React from 'react';

import type {ButtonView, PopupPlacement} from '@gravity-ui/uikit';

import {ActionConfig} from './common';
import {ToolMessageProps} from './tool';

/**
 * Context object passed to popup content generator function
 */
export interface ActionPopupContext {
    /** Update popup content without closing it */
    setContent: (content: React.ReactNode) => void;
    /** Update popup title dynamically */
    setTitle: (title: string | undefined) => void;
    /** Update popup subtitle dynamically */
    setSubtitle: (subtitle: string | undefined) => void;
    /** Programmatically close the popup */
    closePopup: () => void;
}

/**
 * Configuration for action popup
 */
export interface ActionPopupConfig<TMessage> {
    /** Function that generates popup content */
    getContent: (message: TMessage, context: ActionPopupContext) => React.ReactNode;
    /** Optional popup title (can be overridden by actionPopupProps) */
    title?: string;
    /** Optional popup subtitle (can be overridden by actionPopupProps) */
    subtitle?: string;
    /** Optional popup placement (can be overridden by actionPopupProps) */
    placement?: PopupPlacement;
}

export type BaseMessageActionConfig<TMessage = unknown> = ActionConfig & {
    /** Optional popup configuration for this action */
    popup?: ActionPopupConfig<TMessage>;
};

/**
 * BaseMessage action can be either:
 * - BaseMessageActionConfig object with properties (including type for default icons)
 * - React.ReactNode for fully custom content
 */
export type BaseMessageAction<TMessage = unknown> =
    | BaseMessageActionConfig<TMessage>
    | React.ReactNode;

export type UserRating = 'like' | 'dislike';

export enum BaseMessageActionType {
    Copy = 'copy',
    Edit = 'edit',
    Retry = 'retry',
    Like = 'like',
    Unlike = 'unlike',
    Delete = 'delete',
}

/**
 * Default action descriptor for message action buttons.
 * Generic over the message type to provide typed onClick handler.
 */
export type DefaultMessageAction<TMessage> = {
    type?: string;
    onClick: (message: TMessage) => void;
    icon?: React.ReactNode;
    label?: string;
    view?: ButtonView;
    /** Optional popup configuration for this action */
    popup?: ActionPopupConfig<TMessage>;
};

export type BaseMessageProps<TMessage = unknown> = {
    children: React.ReactNode;
    role: TMessageRole;
    actions?: BaseMessageAction<TMessage>[];
    userRating?: UserRating;
    timestamp?: string;
    showTimestamp?: boolean;
    showActionsOnHover?: boolean;
    className?: string;
    qa?: string;
    /** Callback when action with popup config is clicked */
    onActionPopup?: (action: BaseMessageActionConfig<TMessage>, anchorElement: HTMLElement) => void;
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
    enabledCopy?: boolean;
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
    userRating?: UserRating;
};

export type TChatMessage<
    TCustomMessageContent extends TMessageContent = never,
    Metadata = TMessageMetadata,
> = TUserMessage<Metadata> | TAssistantMessage<TCustomMessageContent, Metadata>;
