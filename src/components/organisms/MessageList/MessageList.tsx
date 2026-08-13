import type {HTMLAttributes} from 'react';

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
import type {
    MarkdownCodeBlockActionsConfig,
    MarkdownRendererMdxOptions,
} from '../../atoms/MarkdownRenderer';
import {type RatingBlockProps} from '../../molecules/RatingBlock/RatingBlock';

import {MessageItem} from './MessageItem';
import {VirtualizedMessageList} from './MessageList.virtualized';
import {MessageListFooter} from './MessageListFooter';
import {isActionPopupOpenForMessage, usePopup} from './usePopup';

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

/**
 * Grouped MDX/markdown rendering props exposed as a single object on `MessageList` and
 * `ChatContainer`. They are destructured back into individual props before being handed to
 * the low-level `MessageItem` renderer.
 */
export type MdxProps<TContent extends TMessageContent = never> = {
    /** Options for rendering MDX (`@diplodoc/mdx-extension`) in the default message renderers */
    mdxOptions?: MarkdownRendererMdxOptions;
    /**
     * Resolves the extra props forwarded to the root container `div` of each rendered
     * markdown block. Called with the concrete message so handlers (e.g. `onClick`) can
     * identify the message they belong to.
     */
    getMarkdownExtraProps?: (
        message: TChatMessage<TContent, TMessageMetadata>,
    ) => HTMLAttributes<HTMLDivElement> | undefined;
    /**
     * Resolves the per-message value exposed to MDX components (via `useMdxContext`).
     * Called with the concrete message so embedded MDX components can read data
     * unique to the message they belong to.
     */
    getMdxContext?: (
        message: TChatMessage<TContent, TMessageMetadata>,
    ) => Record<string, unknown> | undefined;
};

export type MessageListProps<TContent extends TMessageContent = never> = {
    messages: TChatMessage<TContent, TMessageMetadata>[];
    status?: ChatStatus;
    errorMessage?: AlertProps;
    loaderMessage?: string;
    withLoaderShimmer?: boolean;
    onRetry?: () => void;
    messageRendererRegistry?: MessageRendererRegistry;
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openMarkdownLinksInNewTab?: boolean;
    /** Grouped MDX/markdown rendering props (`mdxOptions`, `getMarkdownExtraProps`, `getMdxContext`). */
    mdxProps?: MdxProps<TContent>;
    /** Resolves fenced-code actions for the default user and assistant text renderers. */
    getMarkdownCodeBlockActions?: (
        message: TChatMessage<TContent, TMessageMetadata>,
    ) => MarkdownCodeBlockActionsConfig | undefined;
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
    /** Last scrollable row rendered after all messages. */
    footerContent?: React.ReactNode;
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
    openMarkdownLinksInNewTab,
    mdxProps,
    getMarkdownCodeBlockActions,
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
    loaderMessage,
    withLoaderShimmer,
    onRetry,
    hasPreviousMessages = false,
    onLoadPreviousMessages,
    ratingBlockProps,
    actionPopupProps,
    footerContent,
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
                        showActionsOnHover={
                            showActionsOnHover &&
                            !isActionPopupOpenForMessage(popupState, message.id)
                        }
                        messageRendererRegistry={messageRendererRegistry}
                        transformOptions={transformOptions}
                        shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                        openMarkdownLinksInNewTab={openMarkdownLinksInNewTab}
                        mdxOptions={mdxProps?.mdxOptions}
                        getMarkdownExtraProps={mdxProps?.getMarkdownExtraProps}
                        getMdxContext={mdxProps?.getMdxContext}
                        getMarkdownCodeBlockActions={getMarkdownCodeBlockActions}
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
                loaderMessage={loaderMessage}
                withLoaderShimmer={withLoaderShimmer}
                onRetry={onRetry}
                ratingBlockProps={ratingBlockProps}
                actionPopupProps={actionPopupProps}
                qa={qa}
                showActionPopup={showActionPopup}
                popupState={popupState}
                onPopupOpenChange={handlePopupOpenChange}
            />
            {footerContent !== undefined && footerContent !== null && (
                <div className={b('footer-content')}>{footerContent}</div>
            )}
        </div>
    );
}
