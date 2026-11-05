import {type ButtonHTMLAttributes, forwardRef} from 'react';

import {ArrowDown, Hand} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './ScrollToBottomButton.scss';

const b = block('scroll-to-bottom-button');

export interface ScrollToBottomButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Show an activity indicator until the button is hovered or keyboard-focused. */
    streaming?: boolean;
    waitingForApproval?: boolean;
    /** QA/test identifier. */
    qa?: string;
}

/** Presentational scroll control. The parent owns visibility and scroll behavior. */
export const ScrollToBottomButton = forwardRef<HTMLButtonElement, ScrollToBottomButtonProps>(
    (
        {
            streaming = false,
            waitingForApproval = false,
            className,
            qa,
            type = 'button',
            'aria-label': label = 'Scroll to bottom',
            ...props
        },
        ref,
    ) => (
        <button
            {...props}
            ref={ref}
            type={type}
            aria-label={label}
            className={b({streaming: streaming || waitingForApproval}, className)}
            data-qa={qa}
        >
            <span className={b('arrow')} aria-hidden="true">
                <Icon data={ArrowDown} size={14} />
            </span>
            {waitingForApproval ? (
                <span className={b('activity')} aria-hidden="true">
                    <Icon data={Hand} size={16} />
                </span>
            ) : streaming ? (
                <span className={b('activity')} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
            ) : null}
        </button>
    ),
);
ScrollToBottomButton.displayName = 'ScrollToBottomButton';
