import React from 'react';

import {
    ArrowRotateLeft,
    Copy as CopyIcon,
    Pencil,
    ThumbsDown,
    ThumbsUp,
    TrashBin,
} from '@gravity-ui/icons';
import {Icon, IconData} from '@gravity-ui/uikit';

import type {BaseMessageProps} from '../../../types/messages';
import {isActionConfig} from '../../../utils/actionUtils';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';
import {ChatDate} from '../../atoms/ChatDate';
import {ButtonGroup} from '../ButtonGroup';

import {i18n} from './i18n';

import './BaseMessage.scss';

const b = block('base-message');

export enum BaseMessageActionType {
    Copy = 'copy',
    Edit = 'edit',
    Retry = 'retry',
    Like = 'like',
    Unlike = 'unlike',
    Delete = 'delete',
}

const BaseMessageActionIcons: Record<BaseMessageActionType | string, IconData> = {
    [BaseMessageActionType.Copy]: CopyIcon,
    [BaseMessageActionType.Edit]: Pencil,
    [BaseMessageActionType.Retry]: ArrowRotateLeft,
    [BaseMessageActionType.Like]: ThumbsUp,
    [BaseMessageActionType.Unlike]: ThumbsDown,
    [BaseMessageActionType.Delete]: TrashBin,
};

export const BaseMessage = (props: BaseMessageProps) => {
    const {
        className,
        qa,
        showActionsOnHover,
        actions,
        children,
        role: variant,
        showTimestamp,
        timestamp = '',
    } = props;

    // Get tooltip text for action
    const getTooltipText = (actionType?: string): string => {
        if (!actionType) {
            return '';
        }
        const tooltipKey = `action-tooltip-${actionType}`;
        // Check if tooltip exists in i18n, otherwise return empty string
        try {
            return i18n(tooltipKey as Parameters<typeof i18n>[0]);
        } catch {
            return '';
        }
    };
    const hasActions = actions && actions.length > 0;

    return (
        <div className={b({variant, 'btn-hover': showActionsOnHover}, className)} data-qa={qa}>
            {children}
            {hasActions && (
                <div className={b('actions', {reverse: variant !== 'user'})}>
                    {showTimestamp ? <ChatDate date={timestamp} format="HH:mm" showTime /> : null}
                    <ButtonGroup>
                        {actions?.map((action, index) => {
                            if (!isActionConfig(action)) {
                                return <React.Fragment key={index}>{action}</React.Fragment>;
                            }

                            const tooltipText = getTooltipText(action.actionType);
                            const defaultIcon = action.actionType
                                ? BaseMessageActionIcons[action.actionType]
                                : undefined;

                            // Determine tooltip title
                            let tooltipTitle: string | undefined;
                            if (action.label) {
                                tooltipTitle = action.label;
                            } else if (tooltipText && action.actionType !== 'custom') {
                                tooltipTitle = tooltipText;
                            }

                            // Determine button content
                            let buttonContent: React.ReactNode;
                            if (action.icon) {
                                buttonContent = action.icon;
                            } else if (defaultIcon) {
                                buttonContent = <Icon size={16} data={defaultIcon} />;
                            } else if (action.label) {
                                buttonContent = action.label;
                            } else {
                                buttonContent = action.actionType;
                            }

                            return (
                                <ActionButton
                                    key={action.actionType || index}
                                    {...action}
                                    tooltipTitle={tooltipTitle}
                                    view={action.view || 'flat-secondary'}
                                >
                                    {buttonContent}
                                </ActionButton>
                            );
                        })}
                    </ButtonGroup>
                </div>
            )}
        </div>
    );
};
