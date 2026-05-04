import {type ReactNode, useMemo} from 'react';

import {block} from '../../../utils/cn';
import {Disclaimer} from '../../atoms/Disclaimer';
import {Header, HeaderAction, type HeaderProps} from '../../organisms/Header';
import {PromptInput, type PromptInputProps} from '../../organisms/PromptInput';
import {ChatContent} from '../../templates/ChatContent';
import {History} from '../../templates/History';

import {
    normalizeChatContainerQa,
    resolveChatContainerQa,
    resolveChatContainerRootQa,
} from './chatContainerQa';
import {i18n} from './i18n';
import type {ChatContainerProps, ChatContainerTexts} from './types';
import {useChatContainer} from './useChatContainer';

import './ChatContainer.scss';

const b = block('chat-container');

type NormalizedChatContainerQa = ReturnType<typeof normalizeChatContainerQa>;

function mergePromptInputSuggestionsProps(
    fromProps: PromptInputProps['suggestionsProps'] | undefined,
    textsSuggestTitle: ReactNode | undefined,
): PromptInputProps['suggestionsProps'] | undefined {
    const hasSuggestionsFromProps = Boolean(fromProps);
    const hasSuggestTitleFromTexts = textsSuggestTitle !== undefined;
    if (!hasSuggestionsFromProps && !hasSuggestTitleFromTexts) {
        return undefined;
    }
    return {
        ...fromProps,
        suggestTitle: textsSuggestTitle ?? fromProps?.suggestTitle,
    };
}

function buildFinalPromptInputProps(args: {
    promptInputProps: ChatContainerProps['promptInputProps'];
    onSendMessage: ChatContainerProps['onSendMessage'];
    onCancel: ChatContainerProps['onCancel'];
    status: ChatContainerProps['status'];
    contextItems: ChatContainerProps['contextItems'];
    showContextIndicator: ChatContainerProps['showContextIndicator'];
    contextIndicatorProps: ChatContainerProps['contextIndicatorProps'];
    texts: ChatContainerTexts;
    promptInputKey: number;
    qaMap: NormalizedChatContainerQa;
}) {
    const {
        promptInputProps,
        onSendMessage,
        onCancel,
        status,
        contextItems,
        showContextIndicator,
        contextIndicatorProps,
        texts: textsArg,
        promptInputKey,
        qaMap,
    } = args;

    const texts = textsArg ?? {};

    const {
        autoFocusOnNewChat: _autoFocusOnNewChat,
        autoFocusOnChatSelect: _autoFocusOnChatSelect,
        ...restBodyProps
    } = promptInputProps?.bodyProps ?? {};

    const suggestionsProps = mergePromptInputSuggestionsProps(
        promptInputProps?.suggestionsProps,
        texts.promptSuggestTitle,
    );

    return {
        ...promptInputProps,
        qa: resolveChatContainerQa(qaMap, 'promptInput', 'prompt-input') ?? promptInputProps?.qa,
        onSend: onSendMessage,
        onCancel,
        status,
        suggestionsProps,
        headerProps: {
            ...promptInputProps?.headerProps,
            contextItems,
            showContextIndicator:
                showContextIndicator ?? promptInputProps?.headerProps?.showContextIndicator,
            contextIndicatorProps:
                contextIndicatorProps ?? promptInputProps?.headerProps?.contextIndicatorProps,
            qa:
                resolveChatContainerQa(qaMap, 'promptInputHeader', 'prompt-input-header') ??
                promptInputProps?.headerProps?.qa,
        },
        bodyProps: {
            ...restBodyProps,
            placeholder:
                texts.promptPlaceholder || restBodyProps?.placeholder || i18n('prompt-placeholder'),
            autoFocus: promptInputKey > 0 || restBodyProps?.autoFocus,
            qa:
                resolveChatContainerQa(qaMap, 'promptInputBody', 'prompt-input-body') ??
                restBodyProps?.qa,
        },
        footerProps: {
            ...promptInputProps?.footerProps,
            submitButtonTooltipSend:
                texts?.submitSendTooltip ?? promptInputProps?.footerProps?.submitButtonTooltipSend,
            submitButtonTooltipCancel:
                texts?.submitCancelTooltip ??
                promptInputProps?.footerProps?.submitButtonTooltipCancel,
            submitButtonCancelableText:
                texts?.submitButtonCancelableText ??
                promptInputProps?.footerProps?.submitButtonCancelableText,
            qa:
                resolveChatContainerQa(qaMap, 'promptInputFooter', 'prompt-input-footer') ??
                promptInputProps?.footerProps?.qa,
            submitButtonQa:
                resolveChatContainerQa(qaMap, 'submitButton', 'submit-button') ??
                promptInputProps?.footerProps?.submitButtonQa,
        },
    };
}

/**
 * ChatContainer - fully assembled chat component, the main exportable component of the library.
 * Integrates Header, ChatContent, History and manages their state.
 *
 * @param props - component props
 * @returns React component
 */
export function ChatContainer(props: ChatContainerProps) {
    const {
        chats = [],
        messages = [],
        onSendMessage,
        onDeleteChat,
        onCancel,
        onRetry,
        status = 'ready',
        error = null,
        showActionsOnHover = false,
        contextItems = [],
        showContextIndicator,
        contextIndicatorProps,
        transformOptions,
        shouldParseIncompleteMarkdown,
        messageListConfig,
        headerProps = {},
        contentProps = {},
        emptyContainerProps = {},
        promptInputProps = {},
        disclaimerProps = {},
        historyProps = {},
        welcomeConfig,
        texts = {},
        hideTitleOnEmptyChat = false,
        className,
        headerClassName,
        contentClassName,
        footerClassName,
        qa,
    } = props;

    const hookState = useChatContainer(props);

    const qaMap = useMemo(() => normalizeChatContainerQa(qa), [qa]);

    // Collect i18n texts with overrides
    const headerTitle = useMemo(
        () =>
            texts.headerTitle ||
            headerProps.title ||
            hookState.activeChat?.name ||
            i18n('header-default-title'),
        [texts.headerTitle, headerProps.title, hookState.activeChat?.name],
    );

    // Determine if chat is empty
    const isChatEmpty = hookState.chatContentView === 'empty';

    // Calculate showTitle based on hideTitleOnEmptyChat option
    const showTitle = useMemo(() => {
        // If explicit showTitle is provided in headerProps, use it
        if (headerProps.showTitle !== undefined) {
            return headerProps.showTitle;
        }
        // If hideTitleOnEmptyChat is enabled, show title only when chat has messages
        if (hideTitleOnEmptyChat && isChatEmpty) {
            return false;
        }
        return true;
    }, [hideTitleOnEmptyChat, isChatEmpty, headerProps.showTitle]);

    // Build props for Header
    const finalHeaderProps = useMemo(() => {
        const actionQa: Partial<Record<HeaderAction, string>> = {
            ...headerProps.actionQa,
        };
        const setHeaderActionQa = (
            action: HeaderAction,
            key: 'headerNewChat' | 'headerHistory' | 'headerFolding' | 'headerClose',
            suffix: string,
        ) => {
            const resolved = resolveChatContainerQa(qaMap, key, suffix);
            if (resolved !== undefined) {
                actionQa[action] = resolved;
            }
        };
        setHeaderActionQa(HeaderAction.NewChat, 'headerNewChat', 'header-action-newChat');
        setHeaderActionQa(HeaderAction.History, 'headerHistory', 'header-action-history');
        setHeaderActionQa(HeaderAction.Folding, 'headerFolding', 'header-action-folding');
        setHeaderActionQa(HeaderAction.Close, 'headerClose', 'header-action-close');

        const actionTooltips: NonNullable<HeaderProps['actionTooltips']> = {
            newChat: texts.headerNewChatTooltip ?? headerProps.actionTooltips?.newChat,
            history: texts.headerHistoryTooltip ?? headerProps.actionTooltips?.history,
            close: texts.headerCloseTooltip ?? headerProps.actionTooltips?.close,
            foldingCollapsed:
                texts.headerFoldingCollapsedTooltip ?? headerProps.actionTooltips?.foldingCollapsed,
            foldingOpened:
                texts.headerFoldingOpenedTooltip ?? headerProps.actionTooltips?.foldingOpened,
        };

        return {
            ...headerProps,
            title: headerTitle,
            showTitle,
            baseActions: hookState.baseActions,
            handleNewChat: hookState.handleNewChat,
            handleHistoryToggle: hookState.handleHistoryToggle,
            handleFolding: hookState.handleFolding,
            handleClose: hookState.handleClose,
            historyButtonRef: hookState.historyButtonRef,
            qa: resolveChatContainerQa(qaMap, 'header', 'header') ?? headerProps.qa,
            actionQa,
            actionTooltips,
        };
    }, [
        headerTitle,
        showTitle,
        hookState.baseActions,
        hookState.handleNewChat,
        hookState.handleHistoryToggle,
        hookState.handleFolding,
        hookState.handleClose,
        hookState.historyButtonRef,
        headerProps,
        qaMap,
        texts.headerNewChatTooltip,
        texts.headerHistoryTooltip,
        texts.headerCloseTooltip,
        texts.headerFoldingCollapsedTooltip,
        texts.headerFoldingOpenedTooltip,
    ]);

    // Build props for EmptyContainer
    const finalEmptyContainerProps = useMemo(() => {
        const {showDefaultTitle = true, showDefaultDescription = true} = welcomeConfig || {};

        return {
            ...emptyContainerProps,
            qa:
                resolveChatContainerQa(qaMap, 'emptyState', 'empty-state') ??
                emptyContainerProps.qa,
            image: welcomeConfig?.image,
            title:
                texts.emptyStateTitle ??
                welcomeConfig?.title ??
                emptyContainerProps.title ??
                (showDefaultTitle ? i18n('empty-state-title') : undefined),
            description:
                texts.emptyStateDescription ??
                welcomeConfig?.description ??
                emptyContainerProps.description ??
                (showDefaultDescription ? i18n('empty-state-description') : undefined),
            suggestionTitle:
                texts.emptyStateSuggestionsTitle ??
                welcomeConfig?.suggestionTitle ??
                emptyContainerProps.suggestionTitle,
            suggestions: welcomeConfig?.suggestions,
            alignment: welcomeConfig?.alignment,
            layout: welcomeConfig?.layout,
            wrapText: welcomeConfig?.wrapText,
            showMore: welcomeConfig?.showMore,
            showMoreText:
                texts.emptyStateShowMoreText ??
                welcomeConfig?.showMoreText ??
                emptyContainerProps.showMoreText ??
                i18n('empty-state-show-more'),
            onSuggestionClick: async (clickedTitle: string) => {
                await onSendMessage({content: clickedTitle});
            },
        };
    }, [
        welcomeConfig,
        emptyContainerProps,
        onSendMessage,
        qaMap,
        texts.emptyStateTitle,
        texts.emptyStateDescription,
        texts.emptyStateSuggestionsTitle,
        texts.emptyStateShowMoreText,
    ]);

    // Build props for MessageList
    const messageListProps = useMemo(
        () => ({
            ...messageListConfig,
            messages,
            status,
            errorMessage: texts.errorText
                ? {...(messageListConfig?.errorMessage ?? {}), text: texts.errorText}
                : messageListConfig?.errorMessage || (error ? {text: error.message} : undefined),
            onRetry,
            showActionsOnHover,
            transformOptions,
            shouldParseIncompleteMarkdown,
            qa:
                resolveChatContainerQa(qaMap, 'messageList', 'message-list') ??
                messageListConfig?.qa,
            actionPopupProps: {
                ...messageListConfig?.actionPopupProps,
                qa:
                    resolveChatContainerQa(qaMap, 'actionPopup', 'action-popup') ??
                    messageListConfig?.actionPopupProps?.qa,
            },
        }),
        [
            messages,
            status,
            error,
            onRetry,
            showActionsOnHover,
            transformOptions,
            shouldParseIncompleteMarkdown,
            messageListConfig,
            qaMap,
            texts.errorText,
        ],
    );

    // Build props for PromptInput
    const finalPromptInputProps = useMemo(
        () =>
            buildFinalPromptInputProps({
                promptInputProps,
                onSendMessage,
                onCancel,
                status,
                contextItems,
                showContextIndicator,
                contextIndicatorProps,
                texts,
                promptInputKey: hookState.promptInputKey,
                qaMap,
            }),
        [
            onSendMessage,
            onCancel,
            status,
            contextItems,
            showContextIndicator,
            contextIndicatorProps,
            promptInputProps,
            hookState.promptInputKey,
            qaMap,
            texts.promptPlaceholder,
            texts.promptSuggestTitle,
            texts.submitSendTooltip,
            texts.submitCancelTooltip,
            texts.submitButtonCancelableText,
        ],
    );

    // Build props for Disclaimer
    const finalDisclaimerProps = useMemo(() => {
        const disclaimerText =
            texts.disclaimerText ?? disclaimerProps.text ?? i18n('disclaimer-text');

        return {
            ...disclaimerProps,
            text: disclaimerText,
            qa: resolveChatContainerQa(qaMap, 'disclaimer', 'disclaimer') ?? disclaimerProps.qa,
        };
    }, [disclaimerProps, qaMap, texts.disclaimerText]);

    // Build props for ChatContent
    const finalContentProps = useMemo(
        () => ({
            ...contentProps,
            qa: resolveChatContainerQa(qaMap, 'content', 'content') ?? contentProps.qa,
            view: hookState.chatContentView as 'empty' | 'chat',
            emptyContainerProps: finalEmptyContainerProps,
            messageListProps,
        }),
        [
            hookState.chatContentView,
            finalEmptyContainerProps,
            messageListProps,
            contentProps,
            qaMap,
        ],
    );

    // Build props for History
    const finalHistoryProps = useMemo(
        () => ({
            ...historyProps,
            qa: resolveChatContainerQa(qaMap, 'history', 'history') ?? historyProps.qa,
            chats,
            selectedChat: hookState.activeChat,
            onSelectChat: hookState.handleSelectChat,
            onDeleteChat,
            open: hookState.isHistoryOpen,
            onOpenChange: hookState.handleHistoryOpenChange,
            anchorElement: hookState.historyButtonRef.current,
            emptyPlaceholder:
                texts.historyEmptyPlaceholder ??
                historyProps.emptyPlaceholder ??
                i18n('history-empty'),
            emptyFilteredPlaceholder:
                texts.historyEmptyFilteredPlaceholder ??
                historyProps.emptyFilteredPlaceholder ??
                i18n('history-empty-filtered'),
            searchPlaceholder: texts.historySearchPlaceholder ?? historyProps.searchPlaceholder,
        }),
        [
            chats,
            hookState.activeChat,
            hookState.handleSelectChat,
            onDeleteChat,
            hookState.isHistoryOpen,
            hookState.handleHistoryOpenChange,
            hookState.historyButtonRef,
            historyProps,
            qaMap,
            texts.historyEmptyPlaceholder,
            texts.historyEmptyFilteredPlaceholder,
            texts.historySearchPlaceholder,
        ],
    );

    const showFooter = finalPromptInputProps || finalDisclaimerProps;

    return (
        <div className={b(null, className)} data-qa={resolveChatContainerRootQa(qaMap)}>
            <div className={b('header', headerClassName)}>
                <Header {...finalHeaderProps} />
            </div>
            <div className={b('content', {view: hookState.chatContentView}, contentClassName)}>
                <ChatContent {...finalContentProps} />
            </div>
            {showFooter && (
                <div className={b('footer', {view: hookState.chatContentView}, footerClassName)}>
                    {finalPromptInputProps && (
                        <PromptInput key={hookState.promptInputKey} {...finalPromptInputProps} />
                    )}
                    {finalDisclaimerProps && <Disclaimer {...finalDisclaimerProps} />}
                </div>
            )}
            {/* History is integrated via popup anchored to button in Header */}
            <History {...finalHistoryProps} />
        </div>
    );
}
