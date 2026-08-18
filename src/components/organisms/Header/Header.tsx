import React, {useCallback, useMemo, useState} from 'react';

import {
    ChevronsCollapseUpRight,
    ChevronsExpandUpRight,
    ClockArrowRotateLeft,
    Ellipsis,
    Plus,
    Sparkles,
    Xmark,
} from '@gravity-ui/icons';
import {DropdownMenu, Icon, Menu, Sheet, Text, useUniqId} from '@gravity-ui/uikit';

import {Action} from 'src/types';

import {getControlIconSize} from '../../../hooks/useMobileControlSize';
import {isActionConfig} from '../../../utils/actionUtils';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {ButtonGroup} from '../../molecules/ButtonGroup';

import {i18n} from './i18n';
import {
    HeaderAction,
    HeaderActionGroup,
    type HeaderActionOrderItem,
    type HeaderMenuItem,
    type HeaderProps,
} from './types';
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

type NormalizedMenuItem = HeaderMenuItem & {qa: string};

function getNormalizedMenuItem(
    item: HeaderMenuItem,
    menuItemQa: HeaderProps['menuItemQa'],
): NormalizedMenuItem {
    return {...item, qa: menuItemQa?.[item.id] ?? `header-menu-item-${item.id}`};
}

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
        actionsPlacement,
        actionsOrder,
        actionSize,
        isMobile,
        menuItems,
        menuButtonTooltip,
        menuButtonIcon,
        menuButtonQa,
        menuItemQa,
        titlePosition,
        withIcon,
        showTitle = true,
        className,
        historyButtonRef,
        qa,
        actionQa,
        actionTooltipTexts,
    } = useHeader(props);

    const [isMenuSheetVisible, setIsMenuSheetVisible] = useState(false);
    const menuSheetId = useUniqId();

    const iconSize = getControlIconSize(actionSize);

    // Determine class for title positioning
    const titlePositionClass = b('title-container', {position: titlePosition});

    const iconElement = icon ? (
        <div className={b('icon')}>{icon}</div>
    ) : (
        <Icon data={Sparkles} size={16} />
    );

    // Render base action
    const renderBaseAction = useCallback(
        (action: ActionItem, ref?: React.RefObject<HTMLElement>) => {
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
            let tooltipOverride: string | undefined;
            if (action.id === HeaderAction.Folding && action.foldingState) {
                tooltipKey = `action-tooltip-folding-${action.foldingState}`;
                tooltipOverride = actionTooltipTexts?.[HeaderAction.Folding]?.[action.foldingState];
            } else {
                tooltipOverride =
                    actionTooltipTexts?.[action.id as Exclude<HeaderAction, HeaderAction.Folding>];
            }

            // Determine ref for history button
            const buttonRef = action.id === HeaderAction.History ? ref : undefined;

            return (
                <ActionButton
                    key={action.id}
                    ref={buttonRef as React.Ref<HTMLButtonElement>}
                    tooltipTitle={tooltipOverride ?? i18n(tooltipKey as Parameters<typeof i18n>[0])}
                    size={actionSize}
                    view="flat"
                    onClick={action.onClick}
                    className={b('action-button')}
                    qa={actionQa?.[action.id as HeaderAction] ?? `header-action-${action.id}`}
                >
                    <Icon data={IconComponent} size={iconSize} />
                </ActionButton>
            );
        },
        [actionQa, actionSize, actionTooltipTexts, iconSize],
    );

    // Render additional action
    const renderAdditionalAction = useCallback(
        (action: Action, index: number) => {
            const id = `additional-${index}`;

            if (!isActionConfig(action)) {
                return <React.Fragment key={id}>{action}</React.Fragment>;
            }

            return (
                <ActionButton
                    key={`${index}`}
                    {...action}
                    view={action.view || 'flat'}
                    size={action.size ?? actionSize}
                >
                    {action.icon || action.label}
                </ActionButton>
            );
        },
        [actionSize],
    );

    const normalizedMenuItems = useMemo(
        () => menuItems.map((item) => getNormalizedMenuItem(item, menuItemQa)),
        [menuItems, menuItemQa],
    );

    const dropdownMenuItems = useMemo(
        () =>
            normalizedMenuItems.map((item) => ({
                text: item.label,
                action: item.onClick,
                disabled: item.disabled,
                qa: item.qa,
                ...(item.icon ? {iconStart: item.icon} : {}),
            })),
        [normalizedMenuItems],
    );

    const headerMenu = useMemo(() => {
        if (normalizedMenuItems.length === 0) {
            return null;
        }

        const switcherContent = menuButtonIcon ?? <Icon data={Ellipsis} size={iconSize} />;
        const switcherTooltip = menuButtonTooltip ?? i18n('action-tooltip-menu');
        const switcherQa = menuButtonQa ?? 'header-menu-button';

        if (isMobile) {
            return (
                <React.Fragment>
                    <ActionButton
                        tooltipTitle={switcherTooltip}
                        size={actionSize}
                        view="flat"
                        className={b('action-button')}
                        qa={switcherQa}
                        onClick={() => setIsMenuSheetVisible(true)}
                    >
                        {switcherContent}
                    </ActionButton>
                    <Sheet
                        id={menuSheetId}
                        title={i18n('menu-sheet-title')}
                        visible={isMenuSheetVisible}
                        onClose={() => setIsMenuSheetVisible(false)}
                        contentClassName={b('menu-sheet-content')}
                        qa="header-menu-sheet-container"
                    >
                        <Menu size="xl" qa="header-menu-sheet">
                            {normalizedMenuItems.map((item) => (
                                <Menu.Item
                                    key={item.id}
                                    disabled={item.disabled}
                                    iconStart={item.icon}
                                    qa={item.qa}
                                    onClick={() => {
                                        setIsMenuSheetVisible(false);
                                        item.onClick();
                                    }}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </Sheet>
                </React.Fragment>
            );
        }

        return (
            <DropdownMenu
                items={dropdownMenuItems}
                renderSwitcher={(switcherProps) => (
                    <ActionButton
                        {...switcherProps}
                        tooltipTitle={switcherTooltip}
                        size={actionSize}
                        view="flat"
                        className={b('action-button')}
                        qa={switcherQa}
                    >
                        {switcherContent}
                    </ActionButton>
                )}
            />
        );
    }, [
        actionSize,
        iconSize,
        isMobile,
        isMenuSheetVisible,
        menuSheetId,
        dropdownMenuItems,
        normalizedMenuItems,
        menuButtonIcon,
        menuButtonQa,
        menuButtonTooltip,
    ]);

    const [leftBaseActions, rightBaseActions] = useMemo(() => {
        const left: ActionItem[] = [];
        const right: ActionItem[] = [];
        baseActions.forEach((action) => {
            (actionsPlacement.base?.[action.id as HeaderAction] === 'left' ? left : right).push(
                action,
            );
        });
        return [left, right];
    }, [actionsPlacement.base, baseActions]);

    const renderActions = (side: 'left' | 'right') => {
        const sideAdditionalActions =
            (actionsPlacement.additional ?? 'right') === side ? additionalActions : [];
        const sideMenu = (actionsPlacement.menu ?? 'right') === side ? headerMenu : null;
        const sideBaseActions = side === 'left' ? leftBaseActions : rightBaseActions;
        if (sideAdditionalActions.length === 0 && !sideMenu && sideBaseActions.length === 0) {
            return null;
        }
        const legacyOrder: HeaderActionOrderItem[] = [
            ...(sideAdditionalActions.length > 0 ? [HeaderActionGroup.Additional] : []),
            ...(sideMenu ? [HeaderActionGroup.Menu] : []),
            ...sideBaseActions.map((action) => action.id as HeaderAction),
        ];
        const requestedOrder = actionsOrder[side] ?? [];
        const available = new Set(legacyOrder);
        const ordered = [...new Set([...requestedOrder, ...legacyOrder])].filter((item) =>
            available.has(item),
        );

        const renderOrderedAction = (item: HeaderActionOrderItem) => {
            if (item === HeaderActionGroup.Additional) {
                return sideAdditionalActions.map((action, index) =>
                    renderAdditionalAction(action, index),
                );
            }
            if (item === HeaderActionGroup.Menu) {
                return <React.Fragment key="menu">{sideMenu}</React.Fragment>;
            }
            const action = sideBaseActions.find((candidate) => candidate.id === item);
            return action ? renderBaseAction(action, historyButtonRef) : null;
        };

        return <ButtonGroup>{ordered.map(renderOrderedAction)}</ButtonGroup>;
    };

    const leftActions = renderActions('left');
    const rightActions = renderActions('right');

    return (
        <div className={b('', className)} data-qa={qa}>
            {(withIcon || leftActions) && (
                <div className={b('left')}>
                    {withIcon && iconElement}
                    {leftActions}
                </div>
            )}

            {/* Center part: title with preview */}
            {showTitle && (
                <div className={titlePositionClass}>
                    {title && (
                        <Text title={title} as="div" variant="subheader-2" className={b('title')}>
                            {title}
                        </Text>
                    )}
                    {preview && <div className={b('preview')}>{preview}</div>}
                </div>
            )}

            {rightActions}
        </div>
    );
}
