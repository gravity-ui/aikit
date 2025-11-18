import {ReactNode} from 'react';

import {block} from '../../../utils/cn';
import {ContextIndicator, ContextIndicatorProps} from '../../atoms/ContextIndicator';
import {ContextItem} from '../../atoms/ContextItem';

import './PromptInputHeader.scss';

const b = block('prompt-input-header');

/**
 * Context item configuration
 */
export type ContextItemConfig = {
    /** Unique identifier for the context item */
    id: string;
    /** Content to display in the context item */
    content: ReactNode;
    /** Callback when context item is removed */
    onRemove: () => void;
};

/**
 * Props for the PromptInputHeader component
 */
export type PromptInputHeaderProps = {
    /** Array of context items to display on the left */
    contextItems?: ContextItemConfig[];
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
 * with optional context items on the left, context indicator on the right, or custom content
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputHeader(props: PromptInputHeaderProps) {
    const {
        contextItems = [],
        showContextIndicator = false,
        contextIndicatorProps,
        children,
        className,
        qa,
    } = props;

    // If custom content is provided, render it
    if (children) {
        return (
            <div className={b(null, className)} data-qa={qa}>
                {children}
            </div>
        );
    }

    // Check if we have anything to display
    const hasContextItems = contextItems.length > 0;
    const hasContextIndicator = showContextIndicator && contextIndicatorProps;
    const shouldRender = hasContextItems || hasContextIndicator;

    if (!shouldRender) {
        return null;
    }

    return (
        <div className={b(null, className)} data-qa={qa}>
            {/* Context items on the left */}
            {hasContextItems && (
                <div className={b('context-items')}>
                    {contextItems.map((item) => (
                        <ContextItem
                            key={item.id}
                            content={item.content}
                            onClick={item.onRemove}
                            qa={`${qa}-context-item-${item.id}`}
                        />
                    ))}
                </div>
            )}

            {/* Context indicator on the right */}
            {hasContextIndicator && (
                <div className={b('context-indicator')}>
                    <ContextIndicator {...contextIndicatorProps} />
                </div>
            )}
        </div>
    );
}
