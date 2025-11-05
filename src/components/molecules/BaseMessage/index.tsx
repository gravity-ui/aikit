import {ArrowRotateLeft, Copy, Pencil, ThumbsDown, ThumbsUp, TrashBin} from '@gravity-ui/icons';
import {Button, Icon, IconData} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ButtonGroup} from '../ButtonGroup';

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
    [BaseMessageAction.Copy]: Copy,
    [BaseMessageAction.Edit]: Pencil,
    [BaseMessageAction.Retry]: ArrowRotateLeft,
    [BaseMessageAction.Like]: ThumbsUp,
    [BaseMessageAction.Unlike]: ThumbsDown,
    [BaseMessageAction.Delete]: TrashBin,
};

export type BaseMessageProps = {
    children: React.ReactNode;
    variant: 'user' | 'assistant' | 'system';
    actions?: Array<{
        type: BaseMessageAction | string;
        onClick: () => void;
        icon?: IconData;
    }>;
    showActionsOnHover?: boolean;
    className?: string;
    qa?: string;
};

export const BaseMessage = (props: BaseMessageProps) => {
    const {className, qa, showActionsOnHover, actions, children, variant} = props;

    return (
        <div className={b({variant, 'btn-hover': showActionsOnHover}, className)} data-qa={qa}>
            {children}
            <ButtonGroup className={b('actions')}>
                {actions?.map((action) => (
                    <Button key={action.type} view="flat-secondary" onClick={action.onClick}>
                        {action.icon || BaseMessageActionIcons[action.type] ? (
                            <Icon
                                size={16}
                                data={action.icon || BaseMessageActionIcons[action.type]}
                            />
                        ) : (
                            action.type
                        )}
                    </Button>
                ))}
            </ButtonGroup>
        </div>
    );
};
