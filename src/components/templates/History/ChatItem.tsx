import React, {useState} from 'react';

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
    isActive?: boolean;
    onDeleteClick?: (e: React.MouseEvent, chat: ChatType) => Promise<void>;
}

/**
 * Chat item component with hover state for actions
 *
 * @returns React element
 */
export function ChatItem({chat, showActions, isActive, onDeleteClick}: ChatItemProps) {
    const [isDeleteProccesing, setIsDeleteProcessing] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isDeleteProccesing) {
            e.stopPropagation();
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            setIsDeleteProcessing(true);
            await onDeleteClick?.(e, chat);
        } finally {
            setIsDeleteProcessing(false);
        }
    };

    const showDeleteAction = isDeleteProccesing || (showActions && onDeleteClick);

    return (
        <div
            className={b('chat-item', {
                active: isActive,
                ['is-delete-processing']: isDeleteProccesing,
            })}
            onClick={handleClick}
        >
            <div className={b('chat-content')}>
                <Text variant="body-1">{chat.lastMessage || chat.name}</Text>
            </div>

            {showDeleteAction ? (
                <ActionButton
                    view="flat"
                    size="s"
                    color="secondary"
                    loading={isDeleteProccesing}
                    className={b('delete-button')}
                    onClick={handleDeleteChat}
                    tooltipTitle={i18n('tooltip-delete')}
                >
                    <Icon className={b('icon-button')} data={TrashBin} size={16} />
                </ActionButton>
            ) : null}
        </div>
    );
}
