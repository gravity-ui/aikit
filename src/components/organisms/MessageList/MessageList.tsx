import type {OptionsType} from '@diplodoc/transform/lib/typings';
import type {PopupPlacement} from '@gravity-ui/uikit';

import {useScrollPreservation, useSmartScroll} from '../../../hooks';
import {ChatStatus} from '../../../types';
import type {
    DefaultMessageAction,
    MessageExtraInfoComponent,
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageMetadata,
    TUserMessage,
} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {type MessageRendererRegistry} from '../../../utils/messageTypeRegistry';
import {AlertProps} from '../../atoms/Alert';
import {IntersectionContainer} from '../../atoms/IntersectionContainer';
import {Loader} from '../../atoms/Loader';
import {type RatingBlockProps} from '../../molecules/RatingBlock/RatingBlock';

import {MessageItem} from './MessageItem';
import {VirtualizedMessageList} from './MessageList.virtualized';
import {MessageListFooter} from './MessageListFooter';
import {usePopup} from './usePopup';

import './MessageList.scss';

const b = block('message-list');

export enum MessageListQa {
    Root = 'message-list',
    Messages = 'message-list-messages',
}

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
    /** Component rendered alongside action buttons for each user message. Receives message as prop. */
    userExtraInfo?: MessageExtraInfoComponent<TUserMessage<TMessageMetadata>>;
    /** Component rendered alongside action buttons for each assistant message. Receives message as prop. */
    assistantExtraInfo?: MessageExtraInfoComponent<TAssistantMessage<TContent, TMessageMetadata>>;
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
    /**
     * Enable windowed rendering via react-window for very large histories.
     * Off by default to preserve the existing rendering/scroll behavior.
     */
    virtualized?: boolean;
};

export function MessageList<TContent extends TMessageContent = never>(
    props: MessageListProps<TContent>,
) {
    // Opt-in virtualized path - keeps the proven non-virtualized rendering untouched below.
    if (props.virtualized) {
        return <VirtualizedMessageList<TContent> {...props} />;
    }

    return <PlainMessageList<TContent> {...props} />;
}

function PlainMessageList<TContent extends TMessageContent = never>({
    messages,
    messageRendererRegistry,
    transformOptions,
    shouldParseIncompleteMarkdown,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    userActions,
    assistantActions,
    userExtraInfo: UserExtraInfo,
    assistantExtraInfo: AssistantExtraInfo,
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

    // Use popup hook for managing popup state
    const {popupState, handleActionPopup, handlePopupOpenChange, showActionPopup} = usePopup<
        TContent,
        TMessageMetadata
    >();

    const {containerRef} = useSmartScroll<HTMLDivElement>({
        isStreaming: isStreaming || isSubmitted,
        messagesCount: messages.length,
        status,
    });

    // Preserve scroll position when older messages are loaded
    useScrollPreservation(containerRef, messages.length);

    const isNotCompleted = isSubmitted || isStreaming;

    return (
        <div ref={containerRef} className={b(null, className)} data-qa={qa ?? MessageListQa.Root}>
            {hasPreviousMessages && (
                <IntersectionContainer
                    onIntersect={onLoadPreviousMessages}
                    className={b('load-trigger')}
                >
                    <Loader view="loading" />
                </IntersectionContainer>
            )}
            <div className={b('messages')} data-qa={qa ? `${qa}-messages` : MessageListQa.Messages}>
                {messages.map((message, index) => (
                    <MessageItem<TContent>
                        key={message.id || `message-${index}`}
                        message={message}
                        suppressActions={index === messages.length - 1 && isNotCompleted}
                        messageRendererRegistry={messageRendererRegistry}
                        transformOptions={transformOptions}
                        shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                        showActionsOnHover={showActionsOnHover}
                        showTimestamp={showTimestamp}
                        showAvatar={showAvatar}
                        userActions={userActions}
                        assistantActions={assistantActions}
                        userExtraInfo={UserExtraInfo}
                        assistantExtraInfo={AssistantExtraInfo}
                        onActionPopup={handleActionPopup}
                    />
                ))}
            </div>
            <MessageListFooter
                showLoader={showLoader}
                status={status}
                errorMessage={errorMessage}
                onRetry={onRetry}
                ratingBlockProps={ratingBlockProps}
                actionPopupProps={actionPopupProps}
                qa={qa}
                showActionPopup={showActionPopup}
                popupState={popupState}
                onPopupOpenChange={handlePopupOpenChange}
            />
        </div>
    );
}
