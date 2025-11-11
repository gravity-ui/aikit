import {ReactNode} from 'react';

import {block} from '../../../utils/cn';
import {ContextIndicator, ContextIndicatorProps} from '../../atoms/ContextIndicator';

import './PromptInputHeader.scss';

const b = block('prompt-input-header');

/**
 * Props for the PromptInputHeader component
 */
export type PromptInputHeaderProps = {
    /** Show context indicator */
    showContextIndicator?: boolean;
    /** Props for the context indicator */
    contextIndicatorProps?: ContextIndicatorProps;
    /** Custom content to replace the default header */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputHeader component displays the header section of prompt input
 * with optional context indicator or custom content
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputHeader(props: PromptInputHeaderProps) {
    const {showContextIndicator = false, contextIndicatorProps, children, className, qa} = props;

    // If custom content is provided, render it
    if (children) {
        return (
            <div className={b(null, className)} data-qa={qa}>
                {children}
            </div>
        );
    }

    // If context indicator should be shown and props are provided, render it
    if (showContextIndicator && contextIndicatorProps) {
        return (
            <div className={b(null, className)} data-qa={qa}>
                <div className={b('context')}>
                    <ContextIndicator {...contextIndicatorProps} />
                </div>
            </div>
        );
    }

    // Return null if nothing to display
    return null;
}
