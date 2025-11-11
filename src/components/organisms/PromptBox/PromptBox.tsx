import {TSubmitData} from '../../../types';

import {PromptBoxFull} from './PromptBoxFull';
import {PromptBoxSimple} from './PromptBoxSimple';
import {PromptBoxWithSuggestions} from './PromptBoxWithSuggestions';
import {
    PromptBoxBodyProps,
    PromptBoxFooterProps,
    PromptBoxHeaderProps,
    PromptBoxSuggestionsProps,
} from './types';
import {usePromptBox} from './usePromptBox';

import './PromptBox.scss';
/**
 * Props for the PromptBox component
 */
export type PromptBoxProps = {
    /** View variant: 'full' with all features, 'simple' with minimal UI */
    view?: 'full' | 'simple';
    /** Callback when message is sent */
    onSend: (data: TSubmitData) => Promise<void>;
    /** Callback when sending is cancelled */
    onCancel?: () => Promise<void>;
    /** Disabled state */
    disabled?: boolean;
    /** Is streaming state */
    isStreaming?: boolean;
    /** Maximum length of input */
    maxLength?: number;
    /** Header-related props */
    headerProps?: PromptBoxHeaderProps;
    /** Body/textarea-related props */
    bodyProps?: PromptBoxBodyProps;
    /** Footer-related props */
    footerProps?: PromptBoxFooterProps;
    /** Suggestions-related props */
    suggestionsProps?: PromptBoxSuggestionsProps;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptBox component - a flexible input component for chat interfaces
 * with support for simple and full views, attachments, suggestions, and more
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptBox(props: PromptBoxProps) {
    const {
        view = 'simple',
        onSend,
        onCancel,
        disabled = false,
        isStreaming = false,
        maxLength,
        headerProps,
        bodyProps,
        footerProps,
        suggestionsProps,
        className,
        qa,
    } = props;

    const hookState = usePromptBox({
        onSend,
        onCancel,
        disabled,
        isStreaming,
        maxLength,
    });

    // Handle suggestion click with custom handler or default to input change
    const handleSuggestionClick = (suggestion: string) => {
        if (suggestionsProps?.onSuggestionClick) {
            suggestionsProps.onSuggestionClick(suggestion);
        } else {
            hookState.handleChange(suggestion);
        }
    };

    const isFullView = view === 'full';

    // Prepare suggestions props with wrapped handler
    const wrappedSuggestionsProps = suggestionsProps
        ? {
              ...suggestionsProps,
              onSuggestionClick: handleSuggestionClick,
          }
        : undefined;

    return (
        <PromptBoxWithSuggestions suggestionsProps={wrappedSuggestionsProps}>
            {isFullView ? (
                <PromptBoxFull
                    hookState={hookState}
                    headerProps={headerProps}
                    bodyProps={bodyProps}
                    footerProps={footerProps}
                    className={className}
                    qa={qa}
                />
            ) : (
                <PromptBoxSimple
                    hookState={hookState}
                    bodyProps={bodyProps}
                    footerProps={footerProps}
                    className={className}
                    qa={qa}
                />
            )}
        </PromptBoxWithSuggestions>
    );
}
