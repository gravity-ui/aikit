'use client';

import type {HTMLAttributes, ReactNode} from 'react';

import {OptionsType} from '@diplodoc/transform/lib/typings';
import {ChevronDown, ChevronUp, Copy} from '@gravity-ui/icons';
import {Button, DOMProps, Icon, QAProps, Text} from '@gravity-ui/uikit';

import {MarkdownContent} from '../../../markdown/MarkdownProvider';
import {type MarkdownRendererMdxOptions, type MermaidOptions} from '../../../markdown/types';
import type {ThinkingMessageContentData} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {Loader} from '../../atoms/Loader';
import {CompactRow} from '../CompactRow/CompactRow';

import {useThinkingMessage} from '../../organisms/ThinkingMessage/useThinkingMessage';

import '../../organisms/ThinkingMessage/ThinkingMessage.scss';

const b = block('thinking-message');

/**
 * Props for the ThinkingMessage component.
 * Combines DOM props, QA props, and thinking message data.
 */
export type ThinkingMessageProps = DOMProps &
    QAProps &
    ThinkingMessageContentData & {
        /**
         * How thinking content strings are rendered.
         * @default 'plain'
         */
        format?: 'plain' | 'markdown';
        /** @experimental Compact presentation may change in minor releases. */
        view?: 'default' | 'compact';
        /** @experimental Show the compact row icon. Defaults to true. */
        showIcon?: boolean;
        /** @experimental Compact presentation API may change in minor releases. */
        icon?: ReactNode;
        /** @experimental Compact presentation API may change in minor releases. */
        secondaryText?: ReactNode;
        /**
         * Options for @diplodoc/transform when `format` is `'markdown'`.
         * Shallow-merged with the component defaults (`disableCommonAnchors: true`).
         */
        transformOptions?: OptionsType;
        mermaidOptions?: MermaidOptions;
        openMarkdownLinksInNewTab?: boolean;
        mdxOptions?: MarkdownRendererMdxOptions;
        mdxContext?: Record<string, unknown>;
        /** Extra props forwarded to the root container `div` of each rendered markdown block. */
        markdownExtraProps?: HTMLAttributes<HTMLDivElement>;
    };

const defaultTransformOptions: OptionsType = {
    disableCommonAnchors: true,
};

/**
 * ThinkingMessage component displays AI model's internal reasoning process.
 * Shows a collapsible block with thinking content and a copy button.
 * Displays a loader when the thinking process is still in progress.
 *
 * @param props - Component props
 * @returns Rendered thinking message component
 */
export const ThinkingMessageView = (props: ThinkingMessageProps) => {
    const {
        className,
        qa,
        style,
        format = 'plain',
        view = 'default',
        showIcon = true,
        icon,
        secondaryText,
        transformOptions,
        mermaidOptions,
        openMarkdownLinksInNewTab,
        mdxOptions,
        mdxContext,
        markdownExtraProps,
        ...data
    } = props;

    const markdownTransformOptions: OptionsType = {
        ...defaultTransformOptions,
        ...transformOptions,
    };

    const {
        isExpanded,
        toggleExpanded,
        buttonTitle,
        content,
        showLoader,
        handleCopy,
        showCopyButton,
    } = useThinkingMessage(data);

    if (view === 'compact') {
        return (
            <div className={className} data-qa={qa} style={style}>
                <CompactRow
                    label={data.title || buttonTitle}
                    icon={icon}
                    showIcon={showIcon}
                    context={secondaryText}
                    active={showLoader}
                    expanded={isExpanded}
                    onToggle={toggleExpanded}
                >
                    {content.map((item, index) =>
                        format === 'markdown' ? (
                            <MarkdownContent
                                key={index}
                                content={item}
                                transformOptions={markdownTransformOptions}
                                mermaidOptions={mermaidOptions}
                                openLinksInNewTab={openMarkdownLinksInNewTab}
                                mdxOptions={mdxOptions}
                                mdxContext={mdxContext}
                                extraProps={markdownExtraProps}
                            />
                        ) : (
                            <p key={index}>{item}</p>
                        ),
                    )}
                    {showCopyButton && (
                        <ActionButton onClick={handleCopy}>
                            <Icon data={Copy} size={16} />
                        </ActionButton>
                    )}
                </CompactRow>
            </div>
        );
    }

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
                    {content.map((item, index) =>
                        format === 'markdown' ? (
                            <MarkdownContent
                                className={b('content')}
                                key={index}
                                content={item}
                                transformOptions={markdownTransformOptions}
                                mermaidOptions={mermaidOptions}
                                openLinksInNewTab={openMarkdownLinksInNewTab}
                                mdxOptions={mdxOptions}
                                mdxContext={mdxContext}
                                extraProps={markdownExtraProps}
                            />
                        ) : (
                            <Text className={b('content')} key={index}>
                                {item}
                            </Text>
                        ),
                    )}
                </div>
            )}
        </div>
    );
};
