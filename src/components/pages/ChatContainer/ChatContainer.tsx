import {useMemo} from 'react';

import {block} from '../../../utils/cn';
import {Disclaimer} from '../../atoms/Disclaimer';
import {Header} from '../../organisms/Header';
import {PromptInput} from '../../organisms/PromptInput';
import {ChatContent} from '../../templates/ChatContent';
import {History} from '../../templates/History';

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
        transformOptions,
        messageListConfig,
        headerProps = {},
        contentProps = {},
        emptyContainerProps = {},
        promptInputProps = {},
        historyProps = {},
        welcomeConfig,
        i18nConfig = {},
        className,
        headerClassName,
        contentClassName,
        footerClassName,
        qa,
    } = props;

    const hookState = useChatContainer(props);

    // Collect i18n texts with overrides
    const headerTitle = useMemo(
        () =>
            i18nConfig.header?.defaultTitle ||
            headerProps.title ||
            hookState.activeChat?.name ||
            i18n('header-default-title'),
        [i18nConfig.header?.defaultTitle, headerProps.title, hookState.activeChat?.name],
    );

    // Build props for Header
    const finalHeaderProps = useMemo(
        () => ({
            ...headerProps,
            title: headerTitle,
            baseActions: hookState.baseActions,
            handleNewChat: hookState.handleNewChat,
            handleHistoryToggle: hookState.handleHistoryToggle,
            handleClose: hookState.handleClose,
            historyButtonRef: hookState.historyButtonRef,
        }),
        [
            headerTitle,
            hookState.baseActions,
            hookState.handleNewChat,
            hookState.handleHistoryToggle,
            hookState.handleClose,
            hookState.historyButtonRef,
            headerProps,
        ],
    );

    // Build props for EmptyContainer
    const finalEmptyContainerProps = useMemo(() => {
        return {
            ...emptyContainerProps,
            image: welcomeConfig?.image,
            title:
                welcomeConfig?.title || i18nConfig.emptyState?.title || i18n('empty-state-title'),
            description:
                welcomeConfig?.description ||
                i18nConfig.emptyState?.description ||
                i18n('empty-state-description'),
            suggestionTitle:
                welcomeConfig?.suggestionTitle ||
                i18nConfig.emptyState?.suggestionsTitle ||
                i18n('empty-state-suggestions-title'),
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
    }, [welcomeConfig, i18nConfig.emptyState, emptyContainerProps, onSendMessage]);

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
        }),
        [messages, status, error, onRetry, showActionsOnHover, transformOptions, messageListConfig],
    );

    // Build props for PromptInput
    const finalPromptInputProps = useMemo(
        () => ({
            ...promptInputProps,
            onSend: onSendMessage,
            onCancel,
            status,
            headerProps: {
                ...promptInputProps?.headerProps,
                contextItems,
            },
            bodyProps: {
                ...promptInputProps?.bodyProps,
                placeholder:
                    i18nConfig.promptInput?.placeholder ||
                    promptInputProps?.bodyProps?.placeholder ||
                    i18n('prompt-placeholder'),
            },
            footerProps: {
                ...promptInputProps?.footerProps,
                submitButtonTooltipSend: i18nConfig.submitButton?.sendTooltip,
                submitButtonTooltipCancel: i18nConfig.submitButton?.cancelTooltip,
            },
        }),
        [
            onSendMessage,
            onCancel,
            status,
            contextItems,
            i18nConfig.promptInput,
            i18nConfig.submitButton,
            promptInputProps,
        ],
    );

    // Build props for Disclaimer
    const disclaimerProps = useMemo(() => {
        const disclaimerText = i18nConfig.disclaimer?.text || i18n('disclaimer-text');

        return {
            text: disclaimerText,
        };
    }, [i18nConfig.disclaimer]);

    // Build props for ChatContent
    const finalContentProps = useMemo(
        () => ({
            ...contentProps,
            view: hookState.chatContentView as 'empty' | 'chat',
            emptyContainerProps: finalEmptyContainerProps,
            messageListProps,
        }),
        [hookState.chatContentView, finalEmptyContainerProps, messageListProps, contentProps],
    );

    // Build props for History
    const finalHistoryProps = useMemo(
        () => ({
            ...historyProps,
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
        ],
    );

    const showFooter = finalPromptInputProps || disclaimerProps;

    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('header', headerClassName)}>
                <Header {...finalHeaderProps} />
            </div>
            <div className={b('content', {view: hookState.chatContentView}, contentClassName)}>
                <ChatContent {...finalContentProps} />
            </div>
            {showFooter && (
                <div className={b('footer', {view: hookState.chatContentView}, footerClassName)}>
                    {finalPromptInputProps && <PromptInput {...finalPromptInputProps} />}
                    {disclaimerProps && <Disclaimer {...disclaimerProps} />}
                </div>
            )}
            {/* History is integrated via popup anchored to button in Header */}
            <History {...finalHistoryProps} />
        </div>
    );
}
