import React from 'react';

import {ChevronLeft, ChevronRight} from '@gravity-ui/icons';
import type {ButtonButtonProps} from '@gravity-ui/uikit';
import {Icon, Text, useMobile} from '@gravity-ui/uikit';

import {getControlIconSize, useMobileControlSize} from '../../../hooks/useMobileControlSize';
import type {SuggestionClickHandler, SuggestionsItem} from '../../../types/common';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';

import './Suggestions.scss';

const b = block('suggestions');

/**
 * Props for the Suggestions component
 */
export type SuggestionsProps = {
    /** Array of suggestion items to display */
    items: SuggestionsItem[];
    /** Callback function called when a suggestion is clicked */
    onClick: SuggestionClickHandler;
    /** Title to display above suggestions - can be string or custom React element */
    title?: React.ReactNode;
    /** Layout orientation: 'grid' for horizontal, 'list' for vertical */
    layout?: 'grid' | 'list';
    /** Text alignment inside buttons: 'left', 'center', or 'right'. A non-default value disables the mobile chevron */
    textAlign?: 'left' | 'center' | 'right';
    /**
     * Size of suggestion buttons. Defaults to `m`, or `xl` in mobile mode.
     * An explicit size also opts out of the rest of the mobile appearance:
     * `normal` view, text wrapping, chevron and `body-2` typography.
     */
    size?: ButtonButtonProps['size'];
    /** Enable text wrapping inside buttons instead of ellipsis. Defaults to true in mobile mode */
    wrapText?: boolean;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * Suggestions component displays a group of clickable suggestion buttons
 * arranged in either horizontal (grid) or vertical (list) layout
 *
 * @param props - Component props
 * @returns React component
 */
export function Suggestions(props: SuggestionsProps) {
    const {
        items,
        onClick,
        title,
        layout = 'list',
        textAlign = 'left',
        wrapText: wrapTextProp,
        size,
        className,
        qa,
    } = props;

    const isMobile = useMobile();
    const isMobileAppearance = isMobile && size === undefined;
    const wrapText = wrapTextProp ?? isMobileAppearance;
    const buttonSize = useMobileControlSize(size, 'm', 'xl');
    const iconSize = getControlIconSize(buttonSize);

    const handleClick = async (item: SuggestionsItem) => {
        await item.onClick?.(item.title, item.id, item.data);
        await onClick(item.title, item.id, item.data);
    };

    const renderButton = (item: SuggestionsItem, index: number) => {
        const resolvedIcon =
            item.icon ?? (isMobileAppearance && textAlign === 'left' ? 'right' : undefined);
        const icon = resolvedIcon === 'none' ? undefined : resolvedIcon;

        return (
            <ActionButton
                key={item.id || index}
                tooltipTitle={wrapText ? undefined : item.title}
                size={buttonSize}
                view={item.view || (isMobileAppearance ? 'normal' : 'outlined')}
                onClick={() => handleClick(item)}
                className={b('button', {layout, mobile: isMobileAppearance, size: buttonSize})}
                width="auto"
            >
                <div
                    className={b('button-content', {
                        layout,
                        'text-align': icon ? undefined : textAlign,
                    })}
                >
                    {icon === 'left' && (
                        <div className={b('button-icon')}>
                            <Icon data={ChevronLeft} size={iconSize} />
                        </div>
                    )}
                    <Text
                        as="div"
                        variant={isMobileAppearance ? 'body-2' : undefined}
                        className={b(wrapText ? 'button-text-wrap' : 'button-text')}
                    >
                        {item.title}
                    </Text>
                    {icon === 'right' && (
                        <div className={b('button-icon')}>
                            <Icon data={ChevronRight} size={iconSize} />
                        </div>
                    )}
                </div>
            </ActionButton>
        );
    };

    return (
        <div className={b('container', className)} data-qa={qa}>
            {title && (
                <div className={b('title')}>
                    {typeof title === 'string' ? (
                        <Text variant="body-1" color="primary">
                            {title}
                        </Text>
                    ) : (
                        title
                    )}
                </div>
            )}
            <div className={b({layout})}>
                {items.map((item, index) => renderButton(item, index))}
            </div>
        </div>
    );
}
