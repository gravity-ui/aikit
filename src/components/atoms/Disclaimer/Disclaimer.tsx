import React from 'react';

import type {TextProps} from '@gravity-ui/uikit';
import {Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Disclaimer.scss';

/**
 * Props for the Disclaimer component
 */
export type DisclaimerProps = React.PropsWithChildren<{
    /** Additional CSS class */
    className?: string;
    /** Disclaimer text — plain string or a React node */
    text?: string | React.ReactNode;
    /** Text variant for typography styling (applied only when text is a string) */
    variant?: TextProps['variant'];
    /** QA/test identifier */
    qa?: string;
}>;

const b = block('disclaimer');

/**
 * Disclaimer component displays informational or warning messages
 *
 * @param props - Component props
 * @returns React component
 */
export function Disclaimer(props: DisclaimerProps) {
    const {className, qa, children, text, variant} = props;

    let textContent: React.ReactNode | null = null;

    if (text) {
        if (typeof text === 'string') {
            textContent = (
                <Text color="secondary" variant={variant}>
                    {text}
                </Text>
            );
        } else {
            textContent = text;
        }
    } else {
        textContent = null;
    }

    return (
        <div className={b('container', className)} data-qa={qa}>
            {textContent}
            {children}
        </div>
    );
}
