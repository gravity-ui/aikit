import {ReactNode, type Ref} from 'react';

import type {ButtonButtonProps, TextAreaProps} from '@gravity-ui/uikit';

import type {SuggestionClickHandler, SuggestionsItem} from '../../../types/common';
import type {SubmitButtonProps} from '../../atoms/SubmitButton';
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
 * Props for the header section of PromptInput.
 * Custom content (`topContent`) and default header props are mutually exclusive:
 * `topContent` replaces the default header entirely.
 */
export type PromptInputHeaderConfig = {
    /** QA/test identifier for header wrapper */
    qa?: string;
} & (
    | {
          /** Custom content for header area (replaces the default header) */
          topContent?: ReactNode;
          /** Not allowed together with custom content */
          contextItems?: never;
          /** Not allowed together with custom content */
          showContextIndicator?: never;
          /** Not allowed together with custom content */
          contextIndicatorProps?: never;
      }
    | {
          /** Not allowed together with default header props */
          topContent?: never;
          /** Array of context items to display on the left */
          contextItems?: PromptInputHeaderProps['contextItems'];
          /** Show context indicator in header */
          showContextIndicator?: boolean;
          /** Props for context indicator */
          contextIndicatorProps?: PromptInputHeaderProps['contextIndicatorProps'];
      }
);

/**
 * Props for the body/textarea section of PromptInput
 */
export type PromptInputBodyConfig = {
    /** QA/test identifier for body wrapper */
    qa?: string;
    /** Ref to the textarea input */
    inputRef?: Ref<HTMLTextAreaElement>;
    /** Placeholder text for textarea */
    placeholder?: string;
    /** Size of the textarea. Defaults to `l`, or `xl` in mobile mode */
    size?: TextAreaProps['size'];
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
    /** QA/test identifier for footer wrapper */
    qa?: string;
    /** Additional CSS class for the footer wrapper */
    className?: string;
    /** Additional CSS class for the custom content wrapper */
    contentClassName?: string;
    /** Size of footer action buttons */
    buttonSize?: ButtonButtonProps['size'];
    /** Props for the submit button. State, click handling, and size are managed by PromptInput. */
    submitButtonProps?: Omit<SubmitButtonProps, 'state' | 'onClick' | 'size'>;
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
    onSuggestionClick?: SuggestionClickHandler;
};
