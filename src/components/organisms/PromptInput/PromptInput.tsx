import {TSubmitData} from '../../../types';

import {PromptInputFull} from './PromptInputFull';
import {PromptInputSimple} from './PromptInputSimple';
import {PromptInputWithPanels} from './PromptInputWithPanels';
import {PromptInputWithSuggestions} from './PromptInputWithSuggestions';
import {
    PromptInputBodyConfig,
    PromptInputFooterConfig,
    PromptInputHeaderConfig,
    PromptInputPanelConfig,
    PromptInputSuggestionsConfig,
} from './types';
import {usePromptInput} from './usePromptInput';

import './PromptInput.scss';

/**
 * Props for the PromptInput component
 */
export type PromptInputProps = {
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
    headerProps?: PromptInputHeaderConfig;
    /** Body/textarea-related props */
    bodyProps?: PromptInputBodyConfig;
    /** Footer-related props */
    footerProps?: PromptInputFooterConfig;
    /** Suggestions-related props */
    suggestionsProps?: PromptInputSuggestionsConfig;
    /** Top panel configuration */
    topPanel?: PromptInputPanelConfig;
    /** Bottom panel configuration */
    bottomPanel?: PromptInputPanelConfig;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInput component - a flexible input component for chat interfaces
 * with support for simple and full views, attachments, suggestions, and expandable panels
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInput(props: PromptInputProps) {
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
        topPanel,
        bottomPanel,
        className,
        qa,
    } = props;

    const hookState = usePromptInput({
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
        <PromptInputWithSuggestions suggestionsProps={wrappedSuggestionsProps}>
            <PromptInputWithPanels topPanel={topPanel} bottomPanel={bottomPanel}>
                {isFullView ? (
                    <PromptInputFull
                        hookState={hookState}
                        headerProps={headerProps}
                        bodyProps={bodyProps}
                        footerProps={footerProps}
                        className={className}
                        qa={qa}
                    />
                ) : (
                    <PromptInputSimple
                        hookState={hookState}
                        bodyProps={bodyProps}
                        footerProps={footerProps}
                        className={className}
                        qa={qa}
                    />
                )}
            </PromptInputWithPanels>
        </PromptInputWithSuggestions>
    );
}
