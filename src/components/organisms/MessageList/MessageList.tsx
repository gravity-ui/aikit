import React, {useCallback, useState} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';
import type {PopupPlacement} from '@gravity-ui/uikit';

import {useScrollPreservation, useSmartScroll} from '../../../hooks';
import {ChatStatus} from '../../../types';
import type {
    BaseMessageActionConfig,
    DefaultMessageAction,
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageMetadata,
    TUserMessage,
} from '../../../types/messages';
import {
    hasOnlyThinkingContent,
    isAssistantMessage,
    isUserMessage,
    resolveMessageActions,
} from '../../../utils';
import {block} from '../../../utils/cn';
import {type MessageRendererRegistry} from '../../../utils/messageTypeRegistry';
import {AlertProps} from '../../atoms/Alert';
import {IntersectionContainer} from '../../atoms/IntersectionContainer';
import {Loader} from '../../atoms/Loader';
import {ActionPopup, type ActionPopupContext} from '../../molecules/ActionPopup';
import {RatingBlock, type RatingBlockProps} from '../../molecules/RatingBlock/RatingBlock';
import {AssistantMessage} from '../AssistantMessage';
import {UserMessage} from '../UserMessage';

import {ErrorAlert} from './ErrorAlert';

import './MessageList.scss';

const b = block('message-list');

/** Configuration for action popup behavior */
export interface MessageListActionPopupConfig {
    /** Override title for all popups (overrides action-specific title) */
    title?: string;
    /** Override subtitle for all popups (overrides action-specific subtitle) */
    subtitle?: string;
    /** Override placement for all popups (overrides action-specific placement) */
    placement?: PopupPlacement;
    /** Additional CSS class for popup */
    className?: string;
    /** QA/test identifier for popup */
    qa?: string;
}

export type MessageListProps<TContent extends TMessageContent = never> = {
    messages: TChatMessage<TContent, TMessageMetadata>[];
    status?: ChatStatus;
    errorMessage?: AlertProps;
    onRetry?: () => void;
    messageRendererRegistry?: MessageRendererRegistry;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    showActionsOnHover?: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    userActions?: DefaultMessageAction<TUserMessage<TMessageMetadata>>[];
    assistantActions?: DefaultMessageAction<TAssistantMessage<TContent, TMessageMetadata>>[];
    /** Array of chat statuses that should display the loader */
    loaderStatuses?: ChatStatus[];
    className?: string;
    qa?: string;
    hasPreviousMessages?: boolean;
    onLoadPreviousMessages?: () => void;
    /** Rating block configuration (for CSAT or other feedback use cases) - renders after messages list */
    ratingBlockProps?: RatingBlockProps;
    /** Action popup configuration - applies to all action popups */
    actionPopupProps?: MessageListActionPopupConfig;
};

export function MessageList<TContent extends TMessageContent = never>({
    messages,
    messageRendererRegistry,
    transformOptions,
    shouldParseIncompleteMarkdown,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    userActions,
    assistantActions,
    loaderStatuses = ['submitted', 'streaming_loading'],
    className,
    qa,
    status,
    errorMessage,
    onRetry,
    hasPreviousMessages = false,
    onLoadPreviousMessages,
    ratingBlockProps,
    actionPopupProps,
}: MessageListProps<TContent>) {
    const isStreaming = status === 'streaming' || status === 'streaming_loading';
    const isSubmitted = status === 'submitted';
    const showLoader = status && loaderStatuses.includes(status);

    // Popup state management
    const [popupState, setPopupState] = useState<{
        open: boolean;
        messageId: string | null;
        actionType: string | null;
        anchorElement: HTMLElement | null;
        content: React.ReactNode | null;
        title: string | undefined;
        subtitle: string | undefined;
        actionConfig:
            | DefaultMessageAction<TUserMessage<TMessageMetadata>>
            | DefaultMessageAction<TAssistantMessage<TContent, TMessageMetadata>>
            | null;
    }>({
        open: false,
        messageId: null,
        actionType: null,
        anchorElement: null,
        content: null,
        title: undefined,
        subtitle: undefined,
        actionConfig: null,
    });

    const {containerRef} = useSmartScroll<HTMLDivElement>({
        isStreaming: isStreaming || isSubmitted,
        messagesCount: messages.length,
        status,
    });

    // Preserve scroll position when older messages are loaded
    useScrollPreservation(containerRef, messages.length);

    // Handler to open popup for an action
    const handleActionPopup = useCallback(
        (
            message: TChatMessage<TContent, TMessageMetadata>,
            action: BaseMessageActionConfig,
            anchorElement: HTMLElement,
        ) => {
            // Type guard to check if action has popup
            if (!('popup' in action) || !action.popup) {
                return;
            }

            const context: ActionPopupContext = {
                setContent: (newContent: React.ReactNode) => {
                    setPopupState((prev) => ({
                        ...prev,
                        content: newContent,
                    }));
                },
                setTitle: (newTitle: string | undefined) => {
                    setPopupState((prev) => ({
                        ...prev,
                        title: newTitle,
                    }));
                },
                setSubtitle: (newSubtitle: string | undefined) => {
                    setPopupState((prev) => ({
                        ...prev,
                        subtitle: newSubtitle,
                    }));
                },
                closePopup: () => {
                    setPopupState({
                        open: false,
                        messageId: null,
                        actionType: null,
                        anchorElement: null,
                        content: null,
                        title: undefined,
                        subtitle: undefined,
                        actionConfig: null,
                    });
                },
            };

            const content = action.popup.getContent(message as any, context);

            setPopupState({
                open: true,
                messageId: message.id || null,
                actionType: action.actionType || null,
                anchorElement,
                content,
                title: action.popup.title,
                subtitle: action.popup.subtitle,
                actionConfig: action as any,
            });
        },
        [],
    );

    // Handler to handle popup open/close state
    const handlePopupOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setPopupState({
                open: false,
                messageId: null,
                actionType: null,
                anchorElement: null,
                content: null,
                title: undefined,
                subtitle: undefined,
                actionConfig: null,
            });
        }
    }, []);

    const renderMessage = (message: TChatMessage<TContent, TMessageMetadata>, index: number) => {
        if (isUserMessage<TMessageMetadata, TContent>(message)) {
            const actions = resolveMessageActions(message, userActions);

            return (
                <UserMessage
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={actions}
                    timestamp={message.timestamp}
                    format={message.format}
                    avatarUrl={message.avatarUrl}
                    transformOptions={transformOptions}
                    shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                    showActionsOnHover={showActionsOnHover}
                    showTimestamp={showTimestamp}
                    showAvatar={showAvatar}
                    onActionPopup={(action, anchor) => handleActionPopup(message, action, anchor)}
                />
            );
        }

        if (isAssistantMessage<TMessageMetadata, TContent>(message)) {
            const isLastMessage = index === messages.length - 1;
            const isNotCompleted = isSubmitted || isStreaming;
            const showActions = !(isLastMessage && isNotCompleted);
            // Don't show assistantActions for messages with ONLY thinking content
            // For mixed content (thinking + text), actions are shown and copy entire message
            const actions =
                showActions && !hasOnlyThinkingContent(message.content)
                    ? resolveMessageActions(message, assistantActions)
                    : undefined;

            return (
                <AssistantMessage<TContent>
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={actions}
                    timestamp={message.timestamp}
                    id={message.id}
                    messageRendererRegistry={messageRendererRegistry}
                    transformOptions={transformOptions}
                    shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                    showActionsOnHover={showActionsOnHover}
                    showTimestamp={showTimestamp}
                    userRating={message.userRating}
                    onActionPopup={(action, anchor) => handleActionPopup(message, action, anchor)}
                />
            );
        }

        return null;
    };

    return (
        <div ref={containerRef} className={b(null, className)} data-qa={qa}>
            {hasPreviousMessages && (
                <IntersectionContainer
                    onIntersect={onLoadPreviousMessages}
                    className={b('load-trigger')}
                >
                    <Loader view="loading" />
                </IntersectionContainer>
            )}
            <div className={b('messages')} data-qa={qa}>
                {messages.map(renderMessage)}
            </div>
            {showLoader && <Loader className={b('loader')} />}
            {status === 'error' && (
                <ErrorAlert
                    className={b('error-alert')}
                    onRetry={onRetry}
                    errorMessage={errorMessage}
                />
            )}
            {ratingBlockProps && ratingBlockProps.visible !== false && (
                <RatingBlock
                    {...ratingBlockProps}
                    className={b('rating-block', ratingBlockProps.className)}
                />
            )}
            {/* Action Popup - renders when an action with popup config is triggered */}
            {popupState.open &&
                popupState.anchorElement &&
                popupState.actionConfig?.popup &&
                popupState.content !== null && (
                    <ActionPopup
                        open={popupState.open}
                        onOpenChange={handlePopupOpenChange}
                        anchorElement={popupState.anchorElement}
                        title={actionPopupProps?.title || popupState.title || undefined}
                        subtitle={actionPopupProps?.subtitle || popupState.subtitle || undefined}
                        placement={
                            actionPopupProps?.placement ||
                            popupState.actionConfig.popup.placement ||
                            'bottom-start'
                        }
                        className={actionPopupProps?.className}
                        qa={qa ? `${qa}-action-popup` : 'action-popup'}
                    >
                        {popupState.content}
                    </ActionPopup>
                )}
        </div>
    );
}
