import type {OptionsType} from '@diplodoc/transform/lib/typings';

import {useScrollPreservation, useSmartScroll} from '../../../hooks';
import {ChatStatus} from '../../../types';
import type {
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageMetadata,
    TUserMessage,
} from '../../../types/messages';
import {
    type DefaultMessageAction,
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
import {AssistantMessage} from '../AssistantMessage';
import {UserMessage} from '../UserMessage';

import {ErrorAlert} from './ErrorAlert';

import './MessageList.scss';

const b = block('message-list');

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
    loaderStatuses = ['submitted'],
    className,
    qa,
    status,
    errorMessage,
    onRetry,
    hasPreviousMessages = false,
    onLoadPreviousMessages,
}: MessageListProps<TContent>) {
    const isStreaming = status === 'streaming';
    const isSubmitted = status === 'submitted';
    const showLoader = status && loaderStatuses.includes(status);

    const {containerRef} = useSmartScroll<HTMLDivElement>({
        isStreaming: isStreaming || isSubmitted,
        messagesCount: messages.length,
        status,
    });

    // Preserve scroll position when older messages are loaded
    useScrollPreservation(containerRef, messages.length);

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
        </div>
    );
}
