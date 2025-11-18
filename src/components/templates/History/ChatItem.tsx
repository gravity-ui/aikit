import React from 'react';

import {TrashBin} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {ChatType} from '../../../types';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';

import {i18n} from './i18n';

const b = block('history');

/**
 * Props for ChatItem component
 */
export interface ChatItemProps {
    chat: ChatType;
    showActions: boolean;
    onChatClick: (chat: ChatType) => void;
    onDeleteClick?: (e: React.MouseEvent, chat: ChatType) => void;
}

/**
 * Chat item component with hover state for actions
 *
 * @returns React element
 */
export function ChatItem({chat, showActions, onChatClick, onDeleteClick}: ChatItemProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const showDeleteButton = showActions && onDeleteClick && isHovered;

    return (
        <div
            className={b('chat-item')}
            onClick={() => onChatClick(chat)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={b('chat-content')}>
                <Text variant="body-1">{chat.lastMessage || chat.name}</Text>
            </div>
            {showDeleteButton && (
                <ActionButton
                    view="flat"
                    size="s"
                    color="secondary"
                    className={b('delete-button')}
                    onClick={(e) => onDeleteClick(e, chat)}
                    tooltipTitle={i18n('tooltip-delete')}
                >
                    <Icon className={b('icon-button')} data={TrashBin} size={16} />
                </ActionButton>
            )}
        </div>
    );
}
