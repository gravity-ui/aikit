import {useCallback, useMemo} from 'react';

import {List, type RowComponentProps, useDynamicRowHeight} from 'react-window';

import {useVirtualStickToBottom} from '../../../hooks';
import type {TChatMessage, TMessageContent, TMessageMetadata} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {IntersectionContainer} from '../../atoms/IntersectionContainer';
import {Loader} from '../../atoms/Loader';

import {MessageItem, type MessageItemConfig} from './MessageItem';
import {type MessageListProps, MessageListQa} from './MessageList';
import {MessageListFooter} from './MessageListFooter';
import {type PopupState, isActionPopupOpenForMessage, usePopup} from './usePopup';

const b = block('message-list');

/** Estimated row height used before a row has been measured (and for SSR). */
const DEFAULT_ROW_HEIGHT = 80;
/** Extra rows rendered outside the viewport to reduce flicker while scrolling. */
const OVERSCAN_COUNT = 5;

type MessageRowProps = {
    messages: TChatMessage<TMessageContent, TMessageMetadata>[];
    /** Whether the current response is still streaming/submitted (hide actions on last row). */
    isNotCompleted: boolean;
    /** Number of non-message rows before the messages (the load-more trigger). */
    headerOffset: number;
    hasPreviousMessages: boolean;
    onLoadPreviousMessages?: () => void;
    popupState: PopupState;
    config: MessageItemConfig<TMessageContent>;
};

function MessageRow({
    index,
    style,
    ariaAttributes,
    messages,
    isNotCompleted,
    headerOffset,
    hasPreviousMessages,
    onLoadPreviousMessages,
    popupState,
    config,
}: RowComponentProps<MessageRowProps>) {
    // Header row: the "load previous messages" intersection trigger.
    if (hasPreviousMessages && index === 0) {
        return (
            <div style={style} {...ariaAttributes}>
                <IntersectionContainer
                    onIntersect={onLoadPreviousMessages}
                    className={b('load-trigger')}
                >
                    <Loader view="loading" />
                </IntersectionContainer>
            </div>
        );
    }

    const messageIndex = index - headerOffset;
    const message = messages[messageIndex];
    if (!message) {
        return <div style={style} {...ariaAttributes} />;
    }

    const isLast = messageIndex === messages.length - 1;

    return (
        <div style={style} {...ariaAttributes}>
            {/* data-message-id lets useVirtualStickToBottom anchor scroll position to a specific
                rendered row (robust to off-screen height estimation) when older messages load. */}
            <div className={b('row')} data-message-id={message.id}>
                <MessageItem
                    message={message}
                    suppressActions={isLast && isNotCompleted}
                    {...config}
                    showActionsOnHover={
                        Boolean(config.showActionsOnHover) &&
                        !isActionPopupOpenForMessage(popupState, message.id)
                    }
                />
            </div>
        </div>
    );
}

export function VirtualizedMessageList<TContent extends TMessageContent = never>({
    messages,
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
    const isNotCompleted = isSubmitted || isStreaming;
    const showLoader = status && loaderStatuses.includes(status);

    const {popupState, handleActionPopup, handlePopupOpenChange, showActionPopup} = usePopup<
        TContent,
        TMessageMetadata
    >();

    const headerOffset = hasPreviousMessages ? 1 : 0;
    const rowCount = messages.length + headerOffset;

    const config = useMemo<MessageItemConfig<TContent>>(
        () => ({
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
            onActionPopup: handleActionPopup,
        }),
        [
            messageRendererRegistry,
            transformOptions,
            shouldParseIncompleteMarkdown,
            openMarkdownLinksInNewTab,
            showActionsOnHover,
            showTimestamp,
            showAvatar,
            userActions,
            assistantActions,
            UserExtraInfo,
            AssistantExtraInfo,
            handleActionPopup,
        ],
    );

    const rowProps = useMemo<MessageRowProps>(
        () => ({
            messages: messages as TChatMessage<TMessageContent, TMessageMetadata>[],
            isNotCompleted,
            headerOffset,
            hasPreviousMessages,
            onLoadPreviousMessages,
            popupState,
            config: config as unknown as MessageItemConfig<TMessageContent>,
        }),
        [
            messages,
            isNotCompleted,
            headerOffset,
            hasPreviousMessages,
            onLoadPreviousMessages,
            popupState,
            config,
        ],
    );

    const rowHeight = useDynamicRowHeight({defaultRowHeight: DEFAULT_ROW_HEIGHT});

    const {listRef, isPrepending} = useVirtualStickToBottom({
        rowCount,
        isStreaming: isNotCompleted,
        status,
        messagesCount: messages.length,
        firstMessageId: messages[0]?.id,
        headerOffset,
        // The last message reference changes on every streamed token, so it pins the view to the
        // growing last row even while react-window keeps the same set of rows mounted.
        streamingSignal: isNotCompleted ? messages[messages.length - 1] : undefined,
    });

    // Close a popup whose anchor row scrolls out of view (react-window unmounts off-screen rows,
    // detaching the popup's anchor element).
    const onRowsRendered = useCallback(
        (visibleRows: {startIndex: number; stopIndex: number}) => {
            if (!popupState.open || popupState.messageId === null) {
                return;
            }
            const messageIndex = messages.findIndex(
                (message) => message.id === popupState.messageId,
            );
            // Anchor message no longer in the list - its row is gone, so close the popup.
            if (messageIndex === -1) {
                handlePopupOpenChange(false);
                return;
            }
            const anchorIndex = messageIndex + headerOffset;
            if (anchorIndex < visibleRows.startIndex || anchorIndex > visibleRows.stopIndex) {
                handlePopupOpenChange(false);
            }
        },
        [popupState.open, popupState.messageId, messages, headerOffset, handlePopupOpenChange],
    );

    return (
        <div className={b({virtualized: true}, className)} data-qa={qa ?? MessageListQa.Root}>
            {isPrepending && (
                <div className={b('shimmer')} aria-hidden="true">
                    {Array.from({length: 6}, (_, i) => (
                        <div key={i} className={b('shimmer-row', {assistant: i % 2 === 1})} />
                    ))}
                </div>
            )}
            <List<MessageRowProps>
                className={b('list')}
                listRef={listRef}
                rowComponent={MessageRow}
                rowCount={rowCount}
                rowHeight={rowHeight}
                rowProps={rowProps}
                overscanCount={OVERSCAN_COUNT}
                onRowsRendered={onRowsRendered}
                data-qa={qa ? `${qa}-messages` : MessageListQa.Messages}
            />
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
