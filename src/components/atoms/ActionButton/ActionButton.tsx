import React from 'react';

import {ActionTooltip, ActionTooltipProps, Button, ButtonButtonProps} from '@gravity-ui/uikit';

export interface ActionButtonProps extends Omit<ButtonButtonProps, 'className'> {
    /**
     * Button content (icon, text, or any ReactNode)
     */
    children?: React.ReactNode;
    /**
     * Additional CSS class for the button
     */
    className?: string;
    /**
     * Tooltip title text
     */
    tooltipTitle?: ActionTooltipProps['title'];
    /**
     * Tooltip placement
     */
    tooltipPlacement?: ActionTooltipProps['placement'];
    /**
     * Tooltip disabled state
     */
    tooltipDisabled?: ActionTooltipProps['disabled'];
    /**
     * Tooltip open delay in ms
     */
    tooltipOpenDelay?: ActionTooltipProps['openDelay'];
    /**
     * Tooltip close delay in ms
     */
    tooltipCloseDelay?: ActionTooltipProps['closeDelay'];
    /**
     * Additional CSS class for the wrapper
     */
    wrapperClassName?: string;
}

/**
 * ActionButton component combines Button with ActionTooltip
 *
 * This component wraps a Button inside an ActionTooltip, providing
 * a convenient way to add tooltips to action buttons throughout the application.
 *
 * @param props - Component props
 * @returns ActionButton component
 */
export function ActionButton({
    tooltipTitle,
    tooltipPlacement,
    tooltipDisabled,
    tooltipOpenDelay,
    tooltipCloseDelay,
    wrapperClassName,
    className,
    children,
    ...buttonProps
}: ActionButtonProps) {
    const button = (
        <Button {...buttonProps} className={className}>
            {children}
        </Button>
    );

    // If no tooltip props provided, return button without tooltip
    if (!tooltipTitle) {
        return button;
    }

    return (
        <ActionTooltip
            title={tooltipTitle}
            placement={tooltipPlacement}
            disabled={tooltipDisabled}
            openDelay={tooltipOpenDelay}
            closeDelay={tooltipCloseDelay}
            className={wrapperClassName}
        >
            {button}
        </ActionTooltip>
    );
}
