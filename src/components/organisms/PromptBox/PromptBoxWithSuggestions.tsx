import {ReactNode} from 'react';

import {block} from '../../../utils/cn';
import {Suggestions} from '../../molecules/Suggestions';

import {PromptBoxSuggestionsProps} from './types';

const b = block('prompt-box');

/**
 * Props for the PromptBoxWithSuggestions component
 */
export type PromptBoxWithSuggestionsProps = {
    /** Child component (PromptBox) */
    children: ReactNode;
    /** Suggestions-related props */
    suggestionsProps?: PromptBoxSuggestionsProps;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptBoxWithSuggestions component - wrapper that shows suggestions above the prompt box
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptBoxWithSuggestions(props: PromptBoxWithSuggestionsProps) {
    const {children, suggestionsProps = {}, className, qa} = props;

    const {
        showSuggestions = false,
        suggestions,
        onSuggestionClick,
        suggestionsLayout,
        suggestionsTextAlign = 'center',
    } = suggestionsProps;

    const hasSuggestions = showSuggestions && suggestions && suggestions.length > 0;

    return (
        <div className={className} data-qa={qa}>
            {hasSuggestions && (
                <div className={b('suggestions')}>
                    <Suggestions
                        items={suggestions}
                        onClick={onSuggestionClick || (() => {})}
                        layout={suggestionsLayout}
                        textAlign={suggestionsTextAlign}
                    />
                </div>
            )}
            {children}
        </div>
    );
}
