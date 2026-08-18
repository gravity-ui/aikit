import React, {useMemo} from 'react';

import {useMobile} from '@gravity-ui/uikit';

import type {Action} from '../../../types/common';

import {HeaderAction, type HeaderMenuItem, type HeaderProps} from './types';

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
    actionsPlacement: NonNullable<HeaderProps['actionsPlacement']>;
    actionsOrder: NonNullable<HeaderProps['actionsOrder']>;
    actionSize: NonNullable<HeaderProps['actionSize']>;
    isMobile: boolean;
    titlePosition: 'left' | 'center';
    withIcon: boolean;
    showTitle: boolean;
    className?: string;
    historyButtonRef?: React.RefObject<HTMLElement>;
    qa?: string;
    actionQa?: HeaderProps['actionQa'];
    actionTooltipTexts?: HeaderProps['actionTooltipTexts'];
    menuItems: HeaderMenuItem[];
    menuButtonTooltip?: string;
    menuButtonIcon?: React.ReactNode;
    menuButtonQa?: string;
    menuItemQa?: HeaderProps['menuItemQa'];
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
        actionsPlacement = {},
        actionsOrder = {},
        actionSize: actionSizeProp,
        menuItems = [],
        menuButtonTooltip,
        menuButtonIcon,
        menuButtonQa,
        menuItemQa,
        titlePosition = 'left',
        withIcon = true,
        showTitle = true,
        className,
        historyButtonRef,
        qa,
        actionQa,
        actionTooltipTexts,
    } = props;

    const isMobile = useMobile();
    const actionSize = actionSizeProp ?? (isMobile ? 'xl' : 'm');

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
        actionsPlacement,
        actionsOrder,
        actionSize,
        isMobile,
        titlePosition,
        withIcon,
        showTitle,
        className,
        historyButtonRef,
        qa,
        actionQa,
        actionTooltipTexts,
        menuItems,
        menuButtonTooltip,
        menuButtonIcon,
        menuButtonQa,
        menuItemQa,
    };
}
