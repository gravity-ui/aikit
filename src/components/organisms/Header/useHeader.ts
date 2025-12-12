import React, {useMemo} from 'react';

import type {Action} from '../../../types/common';

import {HeaderAction, type HeaderProps} from './types';

export type ActionItem = {
    id: string;
    type: 'base' | 'additional';
    onClick?: () => void;
    foldingState?: 'collapsed' | 'opened';
};

export function useHeader(props: HeaderProps): {
    title: string | undefined;
    preview: React.ReactNode | undefined;
    icon: React.ReactNode | undefined;
    baseActions: ActionItem[];
    additionalActions: Action[];
    titlePosition: 'left' | 'center';
    withIcon: boolean;
    showTitle: boolean;
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
        showTitle = true,
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
                    onClick: handler,
                });
            }
        });

        return actions;
    }, [baseActions, handleNewChat, handleHistoryToggle, handleClose, handleFolding, foldingState]);

    return {
        title,
        preview,
        icon,
        baseActions: baseActionsList,
        additionalActions,
        titlePosition,
        withIcon,
        showTitle,
        className,
        historyButtonRef,
    };
}
