'use client';

import {ChevronDown, ChevronUp, Copy} from '@gravity-ui/icons';
import {Button, DOMProps, Icon, QAProps, Text} from '@gravity-ui/uikit';

import type {ThinkingMessageContentData} from '../../../types/messages';
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
export type ThinkingMessageProps = DOMProps & QAProps & ThinkingMessageContentData;

/**
 * ThinkingMessage component displays AI model's internal reasoning process.
 * Shows a collapsible block with thinking content and a copy button.
 * Displays a loader when the thinking process is still in progress.
 *
 * @param props - Component props
 * @returns Rendered thinking message component
 */
export const ThinkingMessage = (props: ThinkingMessageProps) => {
    const {className, qa, style, ...data} = props;

    const {
        isExpanded,
        toggleExpanded,
        buttonTitle,
        content,
        showLoader,
        handleCopy,
        showCopyButton,
    } = useThinkingMessage(data);

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
                    showCopyButton && (
                        <ActionButton size="s" onClick={handleCopy}>
                            <Icon data={Copy} size={16} />
                        </ActionButton>
                    )
                )}
            </div>
            {isExpanded && (
                <div className={b('container')}>
                    {content.map((item, index) => (
                        <Text className={b('content')} key={index}>
                            {item}
                        </Text>
                    ))}
                </div>
            )}
        </div>
    );
};
