import {Fragment, type ReactNode, useCallback, useMemo} from 'react';

import {MobileProvider, useMobile} from '@gravity-ui/uikit';

import {getMascotAnimationType} from '../../../hooks';
import type {TSuggestionContext} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {getMascotNode, resolveMascotAssets, resolveMascotCollection} from '../../../utils/mascot';
import {Disclaimer} from '../../atoms/Disclaimer';
import {Header, HeaderAction, type HeaderProps} from '../../organisms/Header';
import {PromptInput, type PromptInputProps} from '../../organisms/PromptInput';
import {ChatContent} from '../../templates/ChatContent';
import {History} from '../../templates/History';

import {
    normalizeChatContainerQa,
    resolveChatContainerQa,
    resolveChatContainerRootQa,
    resolveHeaderMenuItemQa,
} from './chatContainerQa';
import {i18n} from './i18n';
import type {ChatContainerProps, ChatContainerTexts} from './types';
import {useChatContainer} from './useChatContainer';
import {useChatContainerMascot} from './useChatContainerMascot';

import './ChatContainer.scss';

const b = block('chat-container');

type NormalizedChatContainerQa = ReturnType<typeof normalizeChatContainerQa>;

function toSuggestionContext(
    id?: string,
    data?: Record<string, unknown>,
): TSuggestionContext | undefined {
    if (!id && !data) {
        return undefined;
    }

    return {
        ...(id && {id}),
        ...(data && {data}),
    };
}

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

function buildFinalPromptInputHeaderProps(args: {
    headerProps: NonNullable<ChatContainerProps['promptInputProps']>['headerProps'];
    contextItems: ChatContainerProps['contextItems'];
    showContextIndicator: ChatContainerProps['showContextIndicator'];
    contextIndicatorProps: ChatContainerProps['contextIndicatorProps'];
    qa: string | undefined;
}): NonNullable<ChatContainerProps['promptInputProps']>['headerProps'] {
    const {headerProps, contextItems, showContextIndicator, contextIndicatorProps, qa} = args;

    // topContent replaces the default header entirely, so context-related
    // props are not allowed (and would be ignored) alongside it
    if (headerProps?.topContent) {
        return {topContent: headerProps.topContent, qa};
    }

    return {
        contextItems,
        showContextIndicator: showContextIndicator ?? headerProps?.showContextIndicator,
        contextIndicatorProps: contextIndicatorProps ?? headerProps?.contextIndicatorProps,
        qa,
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
    onValueChange?: (value: string) => void;
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
        onValueChange,
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
        onValueChange:
            onValueChange || promptInputProps?.onValueChange
                ? (value: string) => {
                      onValueChange?.(value);
                      promptInputProps?.onValueChange?.(value);
                  }
                : undefined,
        qa: resolveChatContainerQa(qaMap, 'promptInput', 'prompt-input') ?? promptInputProps?.qa,
        onSend: onSendMessage,
        onCancel,
        status,
        suggestionsProps,
        headerProps: buildFinalPromptInputHeaderProps({
            headerProps: promptInputProps?.headerProps,
            contextItems,
            showContextIndicator,
            contextIndicatorProps,
            qa:
                resolveChatContainerQa(qaMap, 'promptInputHeader', 'prompt-input-header') ??
                promptInputProps?.headerProps?.qa,
        }),
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
        openMarkdownLinksInNewTab,
        mdxProps,
        messageListConfig,
        mascotConfig,
        headerProps = {},
        contentProps = {},
        emptyContainerProps = {},
        promptInputProps = {},
        disclaimerProps = {},
        historyProps = {},
        welcomeConfig,
        texts = {},
        hideTitleOnEmptyChat = false,
        isMobile: isMobileProp,
        className,
        headerClassName,
        contentClassName,
        footerClassName,
        qa,
    } = props;

    const isMobileContext = useMobile();
    const isMobile = isMobileProp ?? isMobileContext;

    const hookState = useChatContainer(props);

    const mascotState = useChatContainerMascot({
        config: mascotConfig,
        view: hookState.chatContentView === 'empty' ? 'hero' : 'chat',
        status,
        messagesCount: messages.length,
        activeChatId: hookState.activeChat?.id,
        promptInputKey: hookState.promptInputKey,
    });

    const wrappedOnSendMessage = useCallback(
        async (...args: Parameters<typeof onSendMessage>) => {
            mascotState.notifyActivity();
            return onSendMessage(...args);
        },
        [mascotState.notifyActivity, onSendMessage],
    );
    const wrappedOnCancel = useMemo(() => {
        if (!onCancel) {
            return undefined;
        }
        return async () => {
            await onCancel();
            mascotState.handleCancelResolved();
        };
    }, [mascotState.handleCancelResolved, onCancel]);
    const wrappedOnRetry = useMemo(() => {
        if (!onRetry) {
            return undefined;
        }
        return () => {
            mascotState.notifyActivity();
            onRetry();
        };
    }, [mascotState.notifyActivity, onRetry]);

    const resolvedMascotAssets = useMemo(
        () => resolveMascotAssets(mascotConfig?.defaultAssets, mascotConfig?.assets),
        [mascotConfig?.assets, mascotConfig?.defaultAssets],
    );
    const resolvedMascots = useMemo(
        () => resolveMascotCollection(mascotConfig?.defaultMascots, mascotConfig?.mascots),
        [mascotConfig?.defaultMascots, mascotConfig?.mascots],
    );
    const mascotView = hookState.chatContentView === 'empty' ? 'hero' : 'chat';
    const mascotNode = useMemo(() => {
        if (!mascotConfig) {
            return undefined;
        }
        if (mascotView === 'hero' && mascotConfig.showOnWelcome === false) {
            return undefined;
        }
        if (mascotView === 'chat' && mascotConfig.showInChat === false) {
            return undefined;
        }
        const node = mascotConfig.renderMascot
            ? mascotConfig.renderMascot({
                  view: mascotView,
                  state: mascotState.state,
                  animationType: getMascotAnimationType(mascotState.state),
                  assets: resolvedMascotAssets,
              })
            : getMascotNode(resolvedMascots, mascotView, mascotState.state);
        if (node === undefined || node === null) {
            return undefined;
        }
        return <div className={b('mascot', {view: mascotView})}>{node}</div>;
    }, [mascotConfig, mascotState.state, mascotView, resolvedMascotAssets, resolvedMascots]);

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

        const actionTooltipTexts: NonNullable<HeaderProps['actionTooltipTexts']> = {
            [HeaderAction.NewChat]:
                texts.headerNewChatTooltip ??
                headerProps.actionTooltipTexts?.[HeaderAction.NewChat],
            [HeaderAction.History]:
                texts.headerHistoryTooltip ??
                headerProps.actionTooltipTexts?.[HeaderAction.History],
            [HeaderAction.Close]:
                texts.headerCloseTooltip ?? headerProps.actionTooltipTexts?.[HeaderAction.Close],
            [HeaderAction.Folding]: {
                collapsed:
                    texts.headerFoldingCollapsedTooltip ??
                    headerProps.actionTooltipTexts?.[HeaderAction.Folding]?.collapsed,
                opened:
                    texts.headerFoldingOpenedTooltip ??
                    headerProps.actionTooltipTexts?.[HeaderAction.Folding]?.opened,
            },
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
            actionTooltipTexts,
            menuButtonQa:
                resolveChatContainerQa(qaMap, 'headerMenuButton', 'header-menu-button') ??
                headerProps.menuButtonQa,
            menuButtonTooltip: texts.headerMenuTooltip ?? headerProps.menuButtonTooltip,
            menuItemQa: resolveHeaderMenuItemQa(
                qaMap,
                headerProps.menuItems,
                headerProps.menuItemQa,
            ),
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
        texts.headerMenuTooltip,
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
            alignment: {
                ...emptyContainerProps.alignment,
                ...welcomeConfig?.alignment,
                ...(mascotView === 'hero' &&
                mascotNode &&
                emptyContainerProps.alignment?.hero === undefined &&
                welcomeConfig?.alignment?.hero === undefined
                    ? {hero: 'center' as const}
                    : {}),
            },
            heroContent:
                emptyContainerProps.heroContent ?? (mascotView === 'hero' ? mascotNode : undefined),
            layout: welcomeConfig?.layout ?? emptyContainerProps.layout,
            wrapText: welcomeConfig?.wrapText ?? emptyContainerProps.wrapText,
            showMore: welcomeConfig?.showMore,
            showMoreText:
                texts.emptyStateShowMoreText ??
                welcomeConfig?.showMoreText ??
                emptyContainerProps.showMoreText ??
                i18n('empty-state-show-more'),
            onSuggestionClick: async (
                content: string,
                suggestionId?: string,
                suggestionData?: Record<string, unknown>,
            ) => {
                const suggestion = toSuggestionContext(suggestionId, suggestionData);

                await wrappedOnSendMessage({
                    content,
                    ...(suggestion && {suggestion}),
                });
            },
        };
    }, [
        welcomeConfig,
        emptyContainerProps,
        wrappedOnSendMessage,
        qaMap,
        texts.emptyStateTitle,
        texts.emptyStateDescription,
        texts.emptyStateSuggestionsTitle,
        texts.emptyStateShowMoreText,
        mascotNode,
        mascotView,
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
            onRetry: wrappedOnRetry,
            showActionsOnHover,
            transformOptions,
            shouldParseIncompleteMarkdown,
            openMarkdownLinksInNewTab,
            mdxProps,
            qa:
                resolveChatContainerQa(qaMap, 'messageList', 'message-list') ??
                messageListConfig?.qa,
            actionPopupProps: {
                ...messageListConfig?.actionPopupProps,
                qa:
                    resolveChatContainerQa(qaMap, 'actionPopup', 'action-popup') ??
                    messageListConfig?.actionPopupProps?.qa,
            },
            footerContent:
                mascotView === 'chat' && mascotNode !== undefined && mascotNode !== null ? (
                    <Fragment>
                        {messageListConfig?.footerContent}
                        {mascotNode}
                    </Fragment>
                ) : (
                    messageListConfig?.footerContent
                ),
        }),
        [
            messages,
            status,
            error,
            wrappedOnRetry,
            showActionsOnHover,
            transformOptions,
            shouldParseIncompleteMarkdown,
            openMarkdownLinksInNewTab,
            mdxProps,
            messageListConfig,
            qaMap,
            texts.errorText,
            mascotNode,
            mascotView,
        ],
    );

    // Build props for PromptInput
    const finalPromptInputProps = useMemo(
        () =>
            buildFinalPromptInputProps({
                promptInputProps,
                onSendMessage: wrappedOnSendMessage,
                onCancel: wrappedOnCancel,
                status,
                contextItems,
                showContextIndicator,
                contextIndicatorProps,
                texts,
                promptInputKey: hookState.promptInputKey,
                qaMap,
                onValueChange: mascotConfig ? mascotState.handleValueChange : undefined,
            }),
        [
            wrappedOnSendMessage,
            wrappedOnCancel,
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
            mascotState.handleValueChange,
            mascotConfig,
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
            onOpenChange: (open: boolean) => {
                historyProps.onOpenChange?.(open);
                hookState.handleHistoryOpenChange(open);
            },
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
        <MobileProvider mobile={isMobile}>
            <div
                className={b({mobile: isMobile}, className)}
                data-qa={resolveChatContainerRootQa(qaMap)}
            >
                <div className={b('header', headerClassName)}>
                    <Header {...finalHeaderProps} />
                </div>
                <div className={b('content', {view: hookState.chatContentView}, contentClassName)}>
                    <ChatContent {...finalContentProps} />
                </div>
                {showFooter && (
                    <div
                        className={b('footer', {view: hookState.chatContentView}, footerClassName)}
                    >
                        {finalPromptInputProps && (
                            <PromptInput
                                key={hookState.promptInputKey}
                                {...finalPromptInputProps}
                            />
                        )}
                        {finalDisclaimerProps && <Disclaimer {...finalDisclaimerProps} />}
                    </div>
                )}
                {/* History is integrated via popup anchored to button in Header */}
                <History {...finalHistoryProps} />
            </div>
        </MobileProvider>
    );
}
