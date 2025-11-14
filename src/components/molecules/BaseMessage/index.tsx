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
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';
import {ChatDate} from '../../atoms/ChatDate';
import {ButtonGroup} from '../ButtonGroup';

import {i18n} from './i18n';

import './BaseMessage.scss';

const b = block('base-message');

export enum BaseMessageAction {
    Copy = 'copy',
    Edit = 'edit',
    Retry = 'retry',
    Like = 'like',
    Unlike = 'unlike',
    Delete = 'delete',
}

const BaseMessageActionIcons: Record<BaseMessageAction | string, IconData> = {
    [BaseMessageAction.Copy]: CopyIcon,
    [BaseMessageAction.Edit]: Pencil,
    [BaseMessageAction.Retry]: ArrowRotateLeft,
    [BaseMessageAction.Like]: ThumbsUp,
    [BaseMessageAction.Unlike]: ThumbsDown,
    [BaseMessageAction.Delete]: TrashBin,
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
    const getTooltipText = (actionType: BaseMessageAction | string): string => {
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
                        {actions?.map((action) => {
                            const tooltipText = getTooltipText(action.type);

                            return (
                                <ActionButton
                                    key={action.type}
                                    tooltipTitle={
                                        tooltipText && action.type !== 'custom'
                                            ? tooltipText
                                            : undefined
                                    }
                                    view="flat-secondary"
                                    onClick={action.onClick}
                                >
                                    {action.icon || BaseMessageActionIcons[action.type] ? (
                                        <Icon
                                            size={16}
                                            data={
                                                action.icon || BaseMessageActionIcons[action.type]
                                            }
                                        />
                                    ) : (
                                        action.type
                                    )}
                                </ActionButton>
                            );
                        })}
                    </ButtonGroup>
                </div>
            )}
        </div>
    );
};
