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
        onSelectChat,
        showHistory = true,
        showNewChat = true,
        showClose = false,
    } = props;

    // Refs for History integration with Header
    const historyButtonRef = useRef<HTMLElement>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
    }, [onCreateChat]);

    // Handler for toggling history
    const handleHistoryToggle = useCallback(() => {
        setIsHistoryOpen((prev) => !prev);
    }, []);

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
            }
        },
        [onSelectChat],
    );

    // Handler for history popup state changes
    const handleHistoryOpenChange = useCallback((open: boolean) => {
        setIsHistoryOpen(open);
    }, []);

    // Build baseActions for Header
    const baseActions = useMemo(() => {
        const actions: HeaderAction[] = [];

        if (showNewChat) {
            actions.push(HeaderAction.NewChat);
        }

        if (showHistory) {
            actions.push(HeaderAction.History);
        }

        if (showClose) {
            actions.push(HeaderAction.Close);
        }

        return actions;
    }, [showNewChat, showHistory, showClose]);

    return {
        // State
        chatContentView,
        isHistoryOpen,
        activeChat,

        // Refs
        historyButtonRef,

        // Handlers
        handleNewChat,
        handleHistoryToggle,
        handleClose,
        handleSelectChat,
        handleHistoryOpenChange,

        // Configuration
        baseActions,
    };
}
