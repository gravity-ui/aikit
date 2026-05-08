import {ReactNode} from 'react';

import type {SuggestionsItem} from '../../../types/common';
import {PromptInputHeaderProps} from '../../molecules/PromptInputHeader';
import type {SuggestionsProps} from '../../molecules/Suggestions';

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
    /**
     * Auto focus textarea when a new chat is opened via the plus icon.
     * Only applies inside ChatContainer. Defaults to false.
     */
    autoFocusOnNewChat?: boolean;
    /**
     * Auto focus textarea when a chat is selected from history.
     * Only applies inside ChatContainer. Defaults to false.
     */
    autoFocusOnChatSelect?: boolean;
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
    /**
     * Replaces the built-in attachment icon button with a custom node (e.g. AttachmentPicker).
     * When set, `showAttachment` and `onAttachmentClick` are ignored.
     */
    attachmentContent?: ReactNode;
    /** Show microphone icon in footer */
    showMicrophone?: boolean;
    /** Microphone icon click handler */
    onMicrophoneClick?: () => void;
    /** Custom tooltip for submit button in enabled state */
    submitButtonTooltipSend?: string;
    /** Custom tooltip for submit button in cancelable state */
    submitButtonTooltipCancel?: string;
    /** Custom cancelable text (if provided, will be shown in cancelable state) */
    submitButtonCancelableText?: string;
    /** QA/test identifier for submit button */
    submitButtonQa?: string;
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
