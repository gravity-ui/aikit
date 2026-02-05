import {ReactNode} from 'react';

import {block} from '../../../utils/cn';
import {Suggestions} from '../../molecules/Suggestions';

import {PromptInputSuggestionsConfig} from './types';

const b = block('prompt-input');

/**
 * Props for the PromptInputWithSuggestions component
 */
export type PromptInputWithSuggestionsProps = {
    /** Child component (PromptInput) */
    children: ReactNode;
    /** Suggestions-related props */
    suggestionsProps?: PromptInputSuggestionsConfig;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputWithSuggestions component - wrapper that shows suggestions above the prompt input
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputWithSuggestions(props: PromptInputWithSuggestionsProps) {
    const {children, suggestionsProps = {}, className, qa} = props;

    const {
        showSuggestions = false,
        suggestions = [],
        suggestTitle,
        onSuggestionClick,
        suggestionsLayout,
        suggestionsTextAlign = 'center',
    } = suggestionsProps;

    return (
        <div className={b('suggestions-wrapper', className)} data-qa={qa}>
            {showSuggestions && (
                <div className={b('suggestions')}>
                    <Suggestions
                        items={suggestions}
                        onClick={onSuggestionClick || (() => {})}
                        title={suggestTitle}
                        layout={suggestionsLayout}
                        textAlign={suggestionsTextAlign}
                    />
                </div>
            )}
            {children}
        </div>
    );
}
