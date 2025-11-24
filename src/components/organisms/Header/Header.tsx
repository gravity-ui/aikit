import React from 'react';

import {
    ChevronsCollapseUpRight,
    ChevronsExpandUpRight,
    ClockArrowRotateLeft,
    Plus,
    Sparkles,
    Xmark,
} from '@gravity-ui/icons';
import {Button, Icon, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';
import {ButtonGroup} from '../../molecules';

import {i18n} from './i18n';
import {HeaderAction, type HeaderProps} from './types';
import {ActionItem, useHeader} from './useHeader';

import './Header.scss';

const b = block('header');

// Icons for base actions
const ACTION_ICONS: Record<HeaderAction, typeof Xmark> = {
    [HeaderAction.NewChat]: Plus,
    [HeaderAction.History]: ClockArrowRotateLeft,
    [HeaderAction.Folding]: ChevronsCollapseUpRight, // Default icon, will be switched based on state
    [HeaderAction.Close]: Xmark,
};

// Icons for folding states
const FOLDING_ICONS = {
    collapsed: ChevronsExpandUpRight,
    opened: ChevronsCollapseUpRight,
};

/**
 * Header component for displaying chat header with navigation and actions
 *
 * @param props - Component props
 * @returns Header component
 */
export function Header(props: HeaderProps) {
    const {
        title,
        preview,
        icon,
        baseActions,
        additionalActions,
        titlePosition,
        withIcon,
        className,
        historyButtonRef,
    } = useHeader(props);

    // Render base action
    const renderBaseAction = (action: ActionItem) => {
        let IconComponent = ACTION_ICONS[action.id as HeaderAction];

        // Handle folding icon based on state
        if (action.id === HeaderAction.Folding && action.foldingState) {
            IconComponent = FOLDING_ICONS[action.foldingState];
        }

        if (!IconComponent) {
            return null;
        }

        // Get tooltip text
        let tooltipKey = `action-tooltip-${action.id}`;
        if (action.id === HeaderAction.Folding && action.foldingState) {
            tooltipKey = `action-tooltip-folding-${action.foldingState}`;
        }

        // Determine ref for history button
        const buttonRef = action.id === HeaderAction.History ? historyButtonRef : undefined;

        return (
            <ActionButton
                key={action.id}
                ref={buttonRef as React.Ref<HTMLButtonElement>}
                tooltipTitle={i18n(tooltipKey as Parameters<typeof i18n>[0])}
                size="m"
                view="flat"
                onClick={action.onClick}
                className={b('action-button')}
                qa={`header-action-${action.id}`}
            >
                <Icon data={IconComponent} size={16} />
            </ActionButton>
        );
    };

    // Render additional action
    const renderAdditionalAction = (action: (typeof additionalActions)[0], index: number) => {
        if (action.content && React.isValidElement(action.content)) {
            return (
                <React.Fragment key={action.id || `additional-${index}`}>
                    {action.content}
                </React.Fragment>
            );
        }

        if (action.buttonProps) {
            return <Button key={action.id} {...action.buttonProps} />;
        }

        return null;
    };

    // Determine class for title positioning
    const titlePositionClass = b('title-container', {position: titlePosition});

    const iconElement = icon ? (
        <div className={b('icon')}>{icon}</div>
    ) : (
        <Icon data={Sparkles} size={16} />
    );

    return (
        <div className={b('', className)}>
            {/* Left part: icon */}
            {withIcon && iconElement}

            {/* Center part: title with preview */}
            <div className={titlePositionClass}>
                {title && (
                    <Text as="div" variant="subheader-2" className={b('title')}>
                        {title}
                    </Text>
                )}
                {preview && <div className={b('preview')}>{preview}</div>}
            </div>

            {/* Right part: additional and base actions */}
            <ButtonGroup>
                {additionalActions.map((action, index) => renderAdditionalAction(action, index))}
                {baseActions.map((action) => renderBaseAction(action))}
            </ButtonGroup>
        </div>
    );
}
