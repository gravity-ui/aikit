import React from 'react';

import {ArrowRotateRight} from '@gravity-ui/icons';
import {Button, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {Suggestions, SuggestionsItem} from '../../molecules/Suggestions';

import {i18n} from './i18n';

import './EmptyContainer.scss';

const b = block('empty-container');

/**
 * Suggestion item for EmptyContainer
 */
export type Suggestion = SuggestionsItem;

/**
 * Alignment options for content elements
 */
export type ContentAlignment = 'left' | 'center' | 'right';

/**
 * Alignment configuration for different sections
 */
export interface AlignmentConfig {
    /** Alignment for the image */
    image?: ContentAlignment;
    /** Alignment for the title */
    title?: ContentAlignment;
    /** Alignment for the description */
    description?: ContentAlignment;
}

/**
 * Props for the EmptyContainer component
 */
export interface EmptyContainerProps {
    /** Image or icon to display at the top */
    image?: React.ReactNode;
    /** Title text or custom React element for the welcome screen */
    title?: React.ReactNode;
    /** Description text or custom React element explaining the functionality */
    description?: React.ReactNode;
    /** Title for the suggestions section - can be string or custom React element */
    suggestionTitle?: React.ReactNode;
    /** Array of suggestion items */
    suggestions?: Suggestion[];
    /** Callback when a suggestion is clicked */
    onSuggestionClick?: (content: string, id?: string) => void;
    /** Alignment configuration for image, title, and description */
    alignment?: AlignmentConfig;
    /** Layout orientation for suggestions: 'grid' for horizontal, 'list' for vertical */
    layout?: 'grid' | 'list';
    /** Enable text wrapping inside suggestion buttons instead of ellipsis */
    wrapText?: boolean;
    /** Callback for showing more suggestions */
    showMore?: () => void;
    /** Custom text for the show more button */
    showMoreText?: string;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}

/**
 * EmptyContainer component - displays a welcome screen with image, title, description,
 * and suggestions
 *
 * @param props - Component props
 * @returns React component
 */
export function EmptyContainer(props: EmptyContainerProps) {
    const {
        image,
        title,
        description,
        suggestionTitle,
        suggestions = [],
        onSuggestionClick,
        alignment,
        layout = 'grid',
        wrapText = false,
        showMore,
        showMoreText,
        className,
        qa,
    } = props;

    const hasContent = title || description || (suggestions && suggestions.length > 0);

    // Define alignment for each element
    const imageAlignment = alignment?.image || 'left';
    const titleAlignment = alignment?.title || 'left';
    const descriptionAlignment = alignment?.description || 'left';

    // Define text for "Show more" button with localization support
    const showMoreButtonText = showMoreText || i18n('show-more-button');

    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('content')}>
                {hasContent && (
                    <>
                        <div className={b('welcome-section')}>
                            {image && (
                                <div className={b('image-container', {align: imageAlignment})}>
                                    {image}
                                </div>
                            )}

                            <div className={b('text-container')}>
                                {title && (
                                    <Text
                                        variant="header-2"
                                        className={b('title', {align: titleAlignment})}
                                    >
                                        {title}
                                    </Text>
                                )}

                                {description && (
                                    <Text
                                        variant="body-2"
                                        color="complementary"
                                        className={b('description', {align: descriptionAlignment})}
                                    >
                                        {description}
                                    </Text>
                                )}
                            </div>
                        </div>

                        {suggestions && suggestions.length > 0 && onSuggestionClick && (
                            <div className={b('suggestions-section')}>
                                {suggestionTitle && (
                                    <div className={b('suggestions-title')}>
                                        {typeof suggestionTitle === 'string' ? (
                                            <Text variant="subheader-3" color="primary">
                                                {suggestionTitle}
                                            </Text>
                                        ) : (
                                            suggestionTitle
                                        )}
                                    </div>
                                )}
                                <div>
                                    <Suggestions
                                        items={suggestions}
                                        onClick={onSuggestionClick}
                                        layout={layout}
                                        wrapText={wrapText}
                                    />
                                </div>
                                {showMore && (
                                    <div className={b('show-more')}>
                                        <Button
                                            view="flat-secondary"
                                            size="l"
                                            onClick={showMore}
                                            className={b('show-more-button')}
                                        >
                                            <Button.Icon>
                                                <ArrowRotateRight />
                                            </Button.Icon>
                                            {showMoreButtonText}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
