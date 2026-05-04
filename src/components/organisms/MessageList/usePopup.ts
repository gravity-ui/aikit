import {useCallback, useState} from 'react';

import type {
    ActionPopupContext,
    BaseMessageActionConfig,
    TChatMessage,
    TMessageContent,
} from '../../../types/messages';

const INITIAL_POPUP_STATE = {
    open: false,
    messageId: null,
    actionType: null,
    anchorElement: null,
    content: null,
    title: undefined,
    subtitle: undefined,
    actionConfig: null,
} as const;

interface PopupState {
    open: boolean;
    messageId: string | null;
    actionType: string | null;
    anchorElement: HTMLElement | null;
    content: React.ReactNode | null;
    title: string | undefined;
    subtitle: string | undefined;
    actionConfig: BaseMessageActionConfig | null;
}

/**
 * Hook for managing action popup state in MessageList.
 * Handles opening, closing, and dynamic content/title updates for popups
 * triggered by message action buttons.
 *
 * @returns Popup state, open/close handlers, and whether the action popup should render.
 */
export function usePopup<TContent extends TMessageContent, TMessageMetadata>() {
    const [popupState, setPopupState] = useState<PopupState>(INITIAL_POPUP_STATE);

    const handleActionPopup = useCallback(
        (
            message: TChatMessage<TContent, TMessageMetadata>,
            action: BaseMessageActionConfig,
            anchorElement: HTMLElement,
        ) => {
            if (!action.popup) {
                return;
            }

            const context: ActionPopupContext = {
                setContent: (newContent: React.ReactNode) => {
                    setPopupState((prev) => ({
                        ...prev,
                        content: newContent,
                    }));
                },
                setTitle: (newTitle: string | undefined) => {
                    setPopupState((prev) => ({
                        ...prev,
                        title: newTitle,
                    }));
                },
                setSubtitle: (newSubtitle: string | undefined) => {
                    setPopupState((prev) => ({
                        ...prev,
                        subtitle: newSubtitle,
                    }));
                },
                closePopup: () => {
                    setPopupState(INITIAL_POPUP_STATE);
                },
            };

            const content = action.popup.getContent(message, context);

            setPopupState({
                open: true,
                messageId: message.id || null,
                actionType: action.actionType || null,
                anchorElement,
                content,
                title: action.popup.title,
                subtitle: action.popup.subtitle,
                actionConfig: action,
            });
        },
        [],
    );

    const handlePopupOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setPopupState(INITIAL_POPUP_STATE);
        }
    }, []);

    const showActionPopup =
        popupState.open && popupState.content !== null && popupState.anchorElement !== null;

    return {
        popupState,
        handleActionPopup,
        handlePopupOpenChange,
        showActionPopup,
    };
}
