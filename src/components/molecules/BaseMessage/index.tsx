import React from 'react';

import {
    ArrowRotateLeft,
    Copy as CopyIcon,
    Pencil,
    ThumbsDown,
    ThumbsDownFill,
    ThumbsUp,
    ThumbsUpFill,
    TrashBin,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {BaseMessageProps, UserRating} from '../../../types/messages';
import {BaseMessageActionType} from '../../../types/messages';
import {isActionConfig} from '../../../utils/actionUtils';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {ChatDate} from '../../atoms/ChatDate';
import {ButtonGroup} from '../ButtonGroup';

import {i18n} from './i18n';

import './BaseMessage.scss';

const b = block('base-message');

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
        userRating,
        onActionPopup,
    } = props;

    // Get tooltip text for action
    const getTooltipText = (actionType?: string): string => {
        const knownTypes: string[] = Object.values(BaseMessageActionType);
        if (!actionType || !knownTypes.includes(actionType)) {
            return '';
        }
        try {
            return i18n(`action-tooltip-${actionType}` as Parameters<typeof i18n>[0]);
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

                            const defaultIcon = getDefaultIcon(action.actionType, userRating);

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

                            // Exclude custom props that shouldn't be passed to DOM
                            const {
                                actionType: _actionType,
                                popup: _popup,
                                icon: _icon,
                                label: _label,
                                onClick: actionOnClick,
                                ...buttonProps
                            } = action;

                            return (
                                <ActionButton
                                    key={action.actionType || index}
                                    {...buttonProps}
                                    tooltipTitle={tooltipTitle}
                                    view={action.view || 'flat-secondary'}
                                    onClick={(e) => {
                                        // Check if action has popup config and callback exists
                                        if ('popup' in action && action.popup && onActionPopup) {
                                            onActionPopup(action, e.currentTarget);
                                        }
                                        // Call original onClick even when popup exists
                                        actionOnClick?.(e);
                                    }}
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

function getDefaultIcon(actionType?: string, userRating?: UserRating) {
    switch (actionType) {
        case BaseMessageActionType.Copy:
            return CopyIcon;
        case BaseMessageActionType.Edit:
            return Pencil;
        case BaseMessageActionType.Retry:
            return ArrowRotateLeft;
        case BaseMessageActionType.Delete:
            return TrashBin;
        case BaseMessageActionType.Like:
            return userRating === 'like' ? ThumbsUpFill : ThumbsUp;
        case BaseMessageActionType.Unlike:
            return userRating === 'dislike' ? ThumbsDownFill : ThumbsDown;
        default:
            return undefined;
    }
}
