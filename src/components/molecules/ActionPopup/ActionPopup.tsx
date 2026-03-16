import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon, Popup, type PopupPlacement, Text} from '@gravity-ui/uikit';

import type {ActionPopupConfig, ActionPopupContext} from '../../../types/messages';
import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './ActionPopup.scss';

const b = block('action-popup');

export type {ActionPopupConfig, ActionPopupContext};

export interface ActionPopupProps {
    /** Control popup open state */
    open: boolean;
    /** Callback when popup open state changes */
    onOpenChange: (open: boolean) => void;
    /** Anchor element for the popup */
    anchorElement: HTMLElement | null;
    /** Optional title text */
    title?: string;
    /** Optional subtitle text */
    subtitle?: string;
    /** Content to display in popup */
    children: React.ReactNode;
    /** Popup placement relative to anchor (default: 'bottom-start') */
    placement?: PopupPlacement;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}

/**
 * ActionPopup - Universal anchored popup container for displaying content near action buttons
 *
 * This component provides a flexible popup container that can be anchored to any element
 * (typically action buttons). It supports optional title and subtitle, and can contain
 * any React content as children.
 *
 * @example
 * ```tsx
 * <ActionPopup
 *   open={isOpen}
 *   onOpenChange={(open) => setIsOpen(open)}
 *   anchorElement={buttonRef.current}
 *   title="Feedback"
 *   placement="bottom-start"
 * >
 *   <FeedbackForm onSubmit={handleSubmit} />
 * </ActionPopup>
 * ```
 */
export function ActionPopup({
    open,
    onOpenChange,
    anchorElement,
    title,
    subtitle,
    children,
    placement = 'bottom-start',
    className,
    qa,
}: ActionPopupProps) {
    const hasHeader = title || subtitle;

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Popup
            open={open}
            onOpenChange={onOpenChange}
            anchorElement={anchorElement}
            placement={placement}
            className={b(null, className)}
            qa={qa}
        >
            <div className={b('container')}>
                {hasHeader && (
                    <div className={b('header')}>
                        <div className={b('header-content')}>
                            {title && <Text variant="subheader-2">{title}</Text>}
                            {subtitle && (
                                <Text variant="body-1" color="secondary">
                                    {subtitle}
                                </Text>
                            )}
                        </div>
                        <Button
                            view="flat-secondary"
                            size="s"
                            onClick={handleClose}
                            className={b('close-button')}
                            qa={`${qa}-close`}
                            aria-label={i18n('close')}
                        >
                            <Icon data={Xmark} size={16} />
                        </Button>
                    </div>
                )}
                {children}
            </div>
        </Popup>
    );
}
