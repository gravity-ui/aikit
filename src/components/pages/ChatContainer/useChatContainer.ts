import {useCallback, useMemo, useRef, useState} from 'react';

import {HeaderAction} from '../../organisms/Header';

import type {ChatContainerProps} from './types';

/**
 * Hook for managing ChatContainer state
 *
 * @param props - ChatContainer component props
 * @returns object with state and handlers
 */
export function useChatContainer(props: ChatContainerProps) {
    const {
        messages = [],
        activeChat,
        onCreateChat,
        onClose,
        onFold,
        onSelectChat,
        showHistory = true,
        showNewChat = true,
        showFolding = false,
        showClose = false,
        promptInputProps,
    } = props;

    const autoFocusOnNewChat = promptInputProps?.bodyProps?.autoFocusOnNewChat ?? true;
    const autoFocusOnChatSelect = promptInputProps?.bodyProps?.autoFocusOnChatSelect ?? true;

    // Refs for History integration with Header
    const historyButtonRef = useRef<HTMLElement>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Key incremented on each new chat to remount PromptInput with autofocus
    const [promptInputKey, setPromptInputKey] = useState(0);

    // Determine view for ChatContent (empty or chat)
    const chatContentView = useMemo(() => {
        // If there is an active chat (selected from history), show chat view
        // even if there are no messages yet
        if (activeChat) {
            return 'chat';
        }
        // If no active chat, determine by the presence of messages
        return messages.length === 0 ? 'empty' : 'chat';
    }, [messages.length, activeChat]);

    // Handler for creating new chat
    const handleNewChat = useCallback(() => {
        onCreateChat?.();
        if (autoFocusOnNewChat) {
            setPromptInputKey((prev) => prev + 1);
        }
    }, [onCreateChat, autoFocusOnNewChat]);

    // Handler for toggling history
    const handleHistoryToggle = useCallback(() => {
        setIsHistoryOpen((prev) => !prev);
    }, []);

    const handleFolding = useCallback(
        (value: 'collapsed' | 'opened') => {
            onFold?.(value);
        },
        [onFold],
    );

    // Handler for closing
    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    // Handler for selecting chat from history
    const handleSelectChat = useCallback(
        (chat: ChatContainerProps['activeChat']) => {
            if (chat) {
                onSelectChat?.(chat);
                setIsHistoryOpen(false);
                if (autoFocusOnChatSelect) {
                    setPromptInputKey((prev) => prev + 1);
                }
            }
        },
        [onSelectChat, autoFocusOnChatSelect],
    );

    // Handler for history popup state changes
    const handleHistoryOpenChange = useCallback((open: boolean) => {
        setIsHistoryOpen(open);
    }, []);

    // Build baseActions for Header
    const baseActions = useMemo(() => {
        const actions: HeaderAction[] = [];

        if (showNewChat && chatContentView !== 'empty') {
            actions.push(HeaderAction.NewChat);
        }

        if (showHistory) {
            actions.push(HeaderAction.History);
        }

        if (showFolding) {
            actions.push(HeaderAction.Folding);
        }

        if (showClose) {
            actions.push(HeaderAction.Close);
        }

        return actions;
    }, [showNewChat, showHistory, showFolding, showClose, chatContentView]);

    return {
        // State
        chatContentView,
        isHistoryOpen,
        activeChat,
        promptInputKey,

        // Refs
        historyButtonRef,

        // Handlers
        handleNewChat,
        handleHistoryToggle,
        handleFolding,
        handleClose,
        handleSelectChat,
        handleHistoryOpenChange,

        // Configuration
        baseActions,
    };
}
