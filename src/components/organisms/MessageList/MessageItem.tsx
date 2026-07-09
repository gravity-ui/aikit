import {memo} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {
    BaseMessageActionConfig,
    DefaultMessageAction,
    MessageExtraInfoComponent,
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
import {type MessageRendererRegistry} from '../../../utils/messageTypeRegistry';
import {AssistantMessage} from '../AssistantMessage';
import {UserMessage} from '../UserMessage';

/**
 * Shared configuration for a single rendered message. These props are expected to be
 * referentially stable across renders (memoized by the parent list), so that the memoized
 * `MessageItem` only re-renders when the `message` itself changes.
 */
export type MessageItemConfig<TContent extends TMessageContent = never> = {
    messageRendererRegistry?: MessageRendererRegistry;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openMarkdownLinksInNewTab?: boolean;
    showActionsOnHover?: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    userActions?: DefaultMessageAction<TUserMessage<TMessageMetadata>>[];
    assistantActions?: DefaultMessageAction<TAssistantMessage<TContent, TMessageMetadata>>[];
    userExtraInfo?: MessageExtraInfoComponent<TUserMessage<TMessageMetadata>>;
    assistantExtraInfo?: MessageExtraInfoComponent<TAssistantMessage<TContent, TMessageMetadata>>;
    /** Stable popup handler from `usePopup`; bound to the concrete message internally. */
    onActionPopup: (
        message: TChatMessage<TContent, TMessageMetadata>,
        action: BaseMessageActionConfig,
        anchor: HTMLElement,
    ) => void;
};

export type MessageItemProps<TContent extends TMessageContent = never> =
    MessageItemConfig<TContent> & {
        message: TChatMessage<TContent, TMessageMetadata>;
        /**
         * Whether action buttons should be hidden for this message. Precomputed by the parent
         * (the last message while a response is still streaming/submitted) so that completed
         * messages keep a stable value and stay memoized.
         */
        suppressActions: boolean;
    };

function MessageItemComponent<TContent extends TMessageContent = never>({
    message,
    suppressActions,
    messageRendererRegistry,
    transformOptions,
    shouldParseIncompleteMarkdown,
    openMarkdownLinksInNewTab,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    userActions,
    assistantActions,
    userExtraInfo: UserExtraInfo,
    assistantExtraInfo: AssistantExtraInfo,
    onActionPopup,
}: MessageItemProps<TContent>) {
    if (isUserMessage<TMessageMetadata, TContent>(message)) {
        const actions = resolveMessageActions(message, userActions);

        return (
            <UserMessage
                content={message.content}
                actions={actions}
                extraInfo={UserExtraInfo ? <UserExtraInfo message={message} /> : undefined}
                timestamp={message.timestamp}
                format={message.format}
                avatarUrl={message.avatarUrl}
                images={message.images}
                fileAttachments={message.fileAttachments}
                transformOptions={transformOptions}
                shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                openMarkdownLinksInNewTab={openMarkdownLinksInNewTab}
                showActionsOnHover={showActionsOnHover}
                showTimestamp={showTimestamp}
                showAvatar={showAvatar}
                onActionPopup={(action, anchor) => onActionPopup(message, action, anchor)}
            />
        );
    }

    if (isAssistantMessage<TMessageMetadata, TContent>(message)) {
        // Don't show assistantActions for messages with ONLY thinking content.
        // For mixed content (thinking + text), actions are shown and copy the entire message.
        const actions =
            !suppressActions && !hasOnlyThinkingContent(message.content)
                ? resolveMessageActions(message, assistantActions)
                : undefined;

        return (
            <AssistantMessage<TContent>
                content={message.content}
                actions={actions}
                extraInfo={
                    AssistantExtraInfo ? <AssistantExtraInfo message={message} /> : undefined
                }
                timestamp={message.timestamp}
                id={message.id}
                messageRendererRegistry={messageRendererRegistry}
                transformOptions={transformOptions}
                shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                openMarkdownLinksInNewTab={openMarkdownLinksInNewTab}
                showActionsOnHover={showActionsOnHover}
                showTimestamp={showTimestamp}
                userRating={message.userRating}
                onActionPopup={(action, anchor) => onActionPopup(message, action, anchor)}
            />
        );
    }

    return null;
}

/**
 * Memoized single message renderer shared by the plain and virtualized message lists.
 * Re-renders only when `message`, `suppressActions`, or one of the (stable) config props changes,
 * so that during streaming only the message that actually changed is re-rendered.
 */
export const MessageItem = memo(MessageItemComponent) as typeof MessageItemComponent;
