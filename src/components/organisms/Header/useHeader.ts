import React, {useMemo} from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';

import {HeaderAction, type HeaderProps} from './types';

export type ActionItem = {
    id: string;
    type: 'base' | 'additional';
    content: React.ReactNode;
    onClick?: () => void;
    buttonProps?: ButtonProps;
    foldingState?: 'collapsed' | 'opened';
};

export function useHeader(props: HeaderProps): {
    title: string | undefined;
    preview: React.ReactNode | undefined;
    icon: React.ReactNode | undefined;
    baseActions: ActionItem[];
    additionalActions: ActionItem[];
    titlePosition: 'left' | 'center';
    withIcon: boolean;
    className?: string;
    historyButtonRef?: React.RefObject<HTMLElement>;
} {
    const {
        icon,
        title,
        preview,
        baseActions = [],
        handleNewChat,
        handleHistoryToggle,
        handleClose,
        handleFolding,
        foldingState = 'opened',
        additionalActions = [],
        titlePosition = 'left',
        withIcon = true,
        className,
        historyButtonRef,
    } = props;

    // Build base actions
    const baseActionsList = useMemo(() => {
        const actions: ActionItem[] = [];

        baseActions.forEach((action) => {
            if (action === HeaderAction.Folding) {
                if (handleFolding) {
                    actions.push({
                        id: action,
                        type: 'base',
                        content: null, // Will be rendered in component
                        onClick: () => {
                            const newState = foldingState === 'opened' ? 'collapsed' : 'opened';
                            handleFolding(newState);
                        },
                        foldingState,
                    });
                }
                return;
            }

            const actionMap: Partial<Record<HeaderAction, () => void>> = {
                [HeaderAction.NewChat]: handleNewChat,
                [HeaderAction.History]: handleHistoryToggle,
                [HeaderAction.Close]: handleClose,
            };

            const handler = actionMap[action];
            if (handler) {
                actions.push({
                    id: action,
                    type: 'base',
                    content: null, // Will be rendered in component
                    onClick: handler,
                });
            }
        });

        return actions;
    }, [baseActions, handleNewChat, handleHistoryToggle, handleClose, handleFolding, foldingState]);

    // Build additional actions
    const additionalActionsList = useMemo(() => {
        return additionalActions.map((action, index) => {
            if (React.isValidElement(action)) {
                return {
                    id: `additional-${index}`,
                    type: 'additional' as const,
                    content: action,
                };
            }

            // If it's ButtonProps, create a button
            const buttonProps = action as ButtonProps;
            return {
                id: buttonProps.qa || `additional-${index}`,
                type: 'additional' as const,
                content: null, // Will be rendered in component
                buttonProps,
            };
        });
    }, [additionalActions]);

    return {
        title,
        preview,
        icon,
        baseActions: baseActionsList,
        additionalActions: additionalActionsList,
        titlePosition,
        withIcon,
        className,
        historyButtonRef,
    };
}
