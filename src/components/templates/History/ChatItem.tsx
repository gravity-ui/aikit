import React, {useEffect, useRef, useState} from 'react';

import {TrashBin} from '@gravity-ui/icons';
import {Icon, InputControlSize, Text, Tooltip, useMobile} from '@gravity-ui/uikit';

import {getControlIconSize, resolveMobileControlSize} from '../../../hooks/useMobileControlSize';
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
    /** Size of the row actions (default: `s`, `xl` in mobile mode) */
    size?: InputControlSize;
}

/**
 * Chat item component with hover state for actions.
 * In mobile mode there is no hover, so actions are always visible.
 *
 * @returns React element
 */
export function ChatItem({chat, showActions, isActive, onDeleteClick, size}: ChatItemProps) {
    const [isDeleteProccesing, setIsDeleteProcessing] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);
    const chatLabel = chat.lastMessage || chat.name;
    const isMobile = useMobile();
    const deleteButtonSize = resolveMobileControlSize({
        size,
        desktopDefault: 's',
        mobileDefault: 'xl',
        isMobile,
    });
    const deleteIconSize = getControlIconSize(deleteButtonSize);

    useEffect(() => {
        const label = labelRef.current;
        setHasOverflow(Boolean(label && label.scrollWidth > label.clientWidth));
    }, [chatLabel]);

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

    const label = (
        <div className={b('chat-content')}>
            <Text variant="body-1" ref={labelRef}>
                {chatLabel}
            </Text>
        </div>
    );

    return (
        <div
            className={b('chat-item', {
                active: isActive,
                mobile: isMobile,
                ['is-delete-processing']: isDeleteProccesing,
            })}
            onClick={handleClick}
        >
            {hasOverflow ? (
                <Tooltip content={chatLabel} openDelay={300}>
                    {label}
                </Tooltip>
            ) : (
                label
            )}

            {showDeleteAction ? (
                <ActionButton
                    view="flat"
                    size={deleteButtonSize}
                    color="secondary"
                    loading={isDeleteProccesing}
                    className={b('delete-button')}
                    onClick={handleDeleteChat}
                    tooltipTitle={i18n('tooltip-delete')}
                >
                    <Icon className={b('icon-button')} data={TrashBin} size={deleteIconSize} />
                </ActionButton>
            ) : null}
        </div>
    );
}
