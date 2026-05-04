import {useMemo} from 'react';

import {block} from '../../../utils/cn';
import {Disclaimer} from '../../atoms/Disclaimer';
import {Header, HeaderAction} from '../../organisms/Header';
import {PromptInput} from '../../organisms/PromptInput';
import {ChatContent} from '../../templates/ChatContent';
import {History} from '../../templates/History';

import {
    normalizeChatContainerQa,
    resolveChatContainerQa,
    resolveChatContainerRootQa,
} from './chatContainerQa';
import {i18n} from './i18n';
import type {ChatContainerProps} from './types';
import {useChatContainer} from './useChatContainer';

import './ChatContainer.scss';

const b = block('chat-container');

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
        i18nConfig = {},
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
            i18nConfig.header?.defaultTitle ||
            headerProps.title ||
            hookState.activeChat?.name ||
            i18n('header-default-title'),
        [i18nConfig.header?.defaultTitle, headerProps.title, hookState.activeChat?.name],
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
                welcomeConfig?.title ||
                i18nConfig.emptyState?.title ||
                (showDefaultTitle ? i18n('empty-state-title') : undefined),
            description:
                welcomeConfig?.description ||
                i18nConfig.emptyState?.description ||
                (showDefaultDescription ? i18n('empty-state-description') : undefined),
            suggestionTitle:
                welcomeConfig?.suggestionTitle || i18nConfig.emptyState?.suggestionsTitle,
            suggestions: welcomeConfig?.suggestions,
            alignment: welcomeConfig?.alignment,
            layout: welcomeConfig?.layout,
            wrapText: welcomeConfig?.wrapText,
            showMore: welcomeConfig?.showMore,
            showMoreText:
                welcomeConfig?.showMoreText ||
                i18nConfig.emptyState?.showMoreText ||
                i18n('empty-state-show-more'),
            onSuggestionClick: async (clickedTitle: string) => {
                await onSendMessage({content: clickedTitle});
            },
        };
    }, [welcomeConfig, i18nConfig.emptyState, emptyContainerProps, onSendMessage, qaMap]);

    // Build props for MessageList
    const messageListProps = useMemo(
        () => ({
            ...messageListConfig,
            messages,
            status,
            errorMessage:
                messageListConfig?.errorMessage || (error ? {text: error.message} : undefined),
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
        ],
    );

    // Build props for PromptInput
    const finalPromptInputProps = useMemo(() => {
        // Strip ChatContainer-only control props before passing bodyProps to PromptInput
        const {
            autoFocusOnNewChat: _autoFocusOnNewChat,
            autoFocusOnChatSelect: _autoFocusOnChatSelect,
            ...restBodyProps
        } = promptInputProps?.bodyProps ?? {};

        return {
            ...promptInputProps,
            qa:
                resolveChatContainerQa(qaMap, 'promptInput', 'prompt-input') ??
                promptInputProps?.qa,
            onSend: onSendMessage,
            onCancel,
            status,
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
                    i18nConfig.promptInput?.placeholder ||
                    restBodyProps?.placeholder ||
                    i18n('prompt-placeholder'),
                autoFocus: hookState.promptInputKey > 0 || restBodyProps?.autoFocus,
                qa:
                    resolveChatContainerQa(qaMap, 'promptInputBody', 'prompt-input-body') ??
                    restBodyProps?.qa,
            },
            footerProps: {
                ...promptInputProps?.footerProps,
                submitButtonTooltipSend: i18nConfig.submitButton?.sendTooltip,
                submitButtonTooltipCancel: i18nConfig.submitButton?.cancelTooltip,
                qa:
                    resolveChatContainerQa(qaMap, 'promptInputFooter', 'prompt-input-footer') ??
                    promptInputProps?.footerProps?.qa,
                submitButtonQa:
                    resolveChatContainerQa(qaMap, 'submitButton', 'submit-button') ??
                    promptInputProps?.footerProps?.submitButtonQa,
            },
        };
    }, [
        onSendMessage,
        onCancel,
        status,
        contextItems,
        showContextIndicator,
        contextIndicatorProps,
        i18nConfig.promptInput,
        i18nConfig.submitButton,
        promptInputProps,
        hookState.promptInputKey,
        qaMap,
    ]);

    // Build props for Disclaimer
    const finalDisclaimerProps = useMemo(() => {
        const disclaimerText = i18nConfig.disclaimer?.text || i18n('disclaimer-text');

        return {
            ...disclaimerProps,
            text: disclaimerProps.text || disclaimerText,
            qa: resolveChatContainerQa(qaMap, 'disclaimer', 'disclaimer') ?? disclaimerProps.qa,
        };
    }, [i18nConfig.disclaimer, disclaimerProps, qaMap]);

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
                i18nConfig.history?.emptyPlaceholder ||
                historyProps.emptyPlaceholder ||
                i18n('history-empty'),
            emptyFilteredPlaceholder:
                i18nConfig.history?.emptyFilteredPlaceholder ||
                historyProps.emptyFilteredPlaceholder ||
                i18n('history-empty-filtered'),
        }),
        [
            chats,
            hookState.activeChat,
            hookState.handleSelectChat,
            onDeleteChat,
            hookState.isHistoryOpen,
            hookState.handleHistoryOpenChange,
            hookState.historyButtonRef,
            i18nConfig.history,
            historyProps,
            qaMap,
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
