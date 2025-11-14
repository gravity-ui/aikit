'use client';

import {ChevronDown, ChevronUp, Copy} from '@gravity-ui/icons';
import {Button, DOMProps, Icon, QAProps, Text} from '@gravity-ui/uikit';

import type {ThinkingMessagePart} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';
import {Loader} from '../../atoms/Loader';

import {useThinkingMessage} from './useThinkingMessage';

import './ThinkingMessage.scss';

const b = block('thinking-message');

/**
 * Props for the ThinkingMessage component.
 * Combines DOM props, QA props, and thinking message data.
 */
export type ThinkingMessageProps = DOMProps &
    QAProps &
    ThinkingMessagePart & {
        /** Whether the thinking content should be expanded by default */
        defaultExpanded?: boolean;
        /** Whether to show the status indicator (loader) */
        showStatusIndicator?: boolean;
        /** Callback fired when the copy button is clicked */
        onCopyClick?: () => void;
    };

/**
 * ThinkingMessage component displays AI model's internal reasoning process.
 * Shows a collapsible block with thinking content and a copy button.
 * Displays a loader when the thinking process is still in progress.
 *
 * @param props - Component props
 * @returns Rendered thinking message component
 */
export const ThinkingMessage = (props: ThinkingMessageProps) => {
    const {className, qa, style, onCopyClick, ...data} = props;

    const {isExpanded, toggleExpanded, buttonTitle, content, showLoader} = useThinkingMessage({
        ...data,
    });

    return (
        <div className={b(null, className)} data-qa={qa} style={style}>
            <div className={b('buttons')}>
                <Button size="s" onClick={toggleExpanded}>
                    {buttonTitle}
                    <Icon data={isExpanded ? ChevronUp : ChevronDown} />
                </Button>
                {showLoader ? (
                    <Loader view="loading" size="xs" />
                ) : (
                    onCopyClick && (
                        <ActionButton size="s" onClick={onCopyClick}>
                            <Icon data={Copy} size={16} />
                        </ActionButton>
                    )
                )}
            </div>
            {isExpanded && (
                <div className={b('container')}>
                    {content.map((item) => (
                        <Text className={b('content')} key={item}>
                            {item}
                        </Text>
                    ))}
                </div>
            )}
        </div>
    );
};
