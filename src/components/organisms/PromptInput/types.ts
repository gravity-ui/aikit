import {ReactNode} from 'react';

import {PromptInputHeaderProps} from '../../molecules/PromptInputHeader';
import {SuggestionsItem, SuggestionsProps} from '../../molecules/Suggestions';

/**
 * Props for a panel (top or bottom)
 */
export type PromptInputPanelConfig = {
    /** Is panel open */
    isOpen: boolean;
    /** Panel content */
    children?: ReactNode;
};

/**
 * Props for the header section of PromptInput
 */
export type PromptInputHeaderConfig = {
    /** Custom content for header area */
    topContent?: ReactNode;
    /** Array of context items to display on the left */
    contextItems?: PromptInputHeaderProps['contextItems'];
    /** Show context indicator in header */
    showContextIndicator?: boolean;
    /** Props for context indicator */
    contextIndicatorProps?: PromptInputHeaderProps['contextIndicatorProps'];
};

/**
 * Props for the body/textarea section of PromptInput
 */
export type PromptInputBodyConfig = {
    /** Placeholder text for textarea */
    placeholder?: string;
    /** Minimum number of textarea rows */
    minRows?: number;
    /** Maximum number of textarea rows */
    maxRows?: number;
    /** Auto focus textarea on mount */
    autoFocus?: boolean;
};

/**
 * Props for the footer section of PromptInput
 */
export type PromptInputFooterConfig = {
    /** Custom content for footer area (SubmitButton will still be shown) */
    bottomContent?: ReactNode;
    /** Show settings icon in footer */
    showSettings?: boolean;
    /** Settings icon click handler */
    onSettingsClick?: () => void;
    /** Show attachment icon in footer */
    showAttachment?: boolean;
    /** Attachment icon click handler */
    onAttachmentClick?: () => void;
    /** Show microphone icon in footer */
    showMicrophone?: boolean;
    /** Microphone icon click handler */
    onMicrophoneClick?: () => void;
    /** Custom tooltip for submit button in enabled state */
    submitButtonTooltipSend?: string;
    /** Custom tooltip for submit button in cancelable state */
    submitButtonTooltipCancel?: string;
};

/**
 * Props for the suggestions section of PromptInput
 */
export type PromptInputSuggestionsConfig = {
    /** Submit suggestions array */
    suggestions?: SuggestionsItem[];
    /** Show submit suggestions */
    showSuggestions?: boolean;
    /** Title for the suggestions section - can be string or custom React element */
    suggestTitle?: string | ReactNode;
    /** Layout orientation for suggestions: 'grid' for horizontal, 'list' for vertical */
    suggestionsLayout?: SuggestionsProps['layout'];
    /** Text alignment inside suggestion buttons */
    suggestionsTextAlign?: SuggestionsProps['textAlign'];
    /** Callback when suggestion is clicked */
    onSuggestionClick?: (content: string, id?: string) => void;
};
