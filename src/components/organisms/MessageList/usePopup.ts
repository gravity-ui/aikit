import {useCallback, useRef, useState} from 'react';

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

export interface PopupState {
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

    // Mirror the latest popup state so the stable (deps: []) handler can read it without
    // re-creating itself on every popup change (it is passed to memoized message items).
    const popupStateRef = useRef(popupState);
    popupStateRef.current = popupState;

    const handleActionPopup = useCallback(
        (
            message: TChatMessage<TContent, TMessageMetadata>,
            action: BaseMessageActionConfig,
            anchorElement: HTMLElement,
        ) => {
            if (!action.popup) {
                return;
            }

            const messageId = message.id || null;
            const actionType = action.actionType || null;

            // Toggle off: clicking the same action that already opened the popup (e.g. un-pressing
            // dislike) closes the popup instead of re-opening it.
            const current = popupStateRef.current;
            if (
                current.open &&
                current.messageId === messageId &&
                current.actionType === actionType
            ) {
                setPopupState(INITIAL_POPUP_STATE);
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
                messageId,
                actionType,
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

/** Whether an action popup is open and anchored to the given message. */
export function isActionPopupOpenForMessage(
    popupState: PopupState,
    messageId: string | undefined,
): boolean {
    return Boolean(popupState.open && messageId && popupState.messageId === messageId);
}
