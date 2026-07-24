import {ButtonButtonProps} from '@gravity-ui/uikit';

/**
 * Action configuration object with properties
 */
export type ActionConfig = {
    actionType?: string;
    label?: string;
    icon?: React.ReactNode;
} & ButtonButtonProps;

/**
 * Action can be either:
 * - ActionConfig object with properties (label, icon, onClick, view)
 * - React.ReactNode for fully custom content
 */
export type Action = ActionConfig | React.ReactNode;

/**
 * Callback invoked when a suggestion is clicked
 */
export type SuggestionClickHandler = (
    content: string,
    id?: string,
    data?: Record<string, unknown>,
) => void | Promise<void>;

/**
 * Single suggestion item displayed as a button
 */
export type SuggestionsItem = {
    /** Optional unique identifier for the item */
    id?: string;
    /** Title text to display on the button */
    title: string;
    /** Optional payload passed to click handlers and submit data */
    data?: Record<string, unknown>;
    /** Button view */
    view?: ButtonButtonProps['view'];
    /** Icon position: 'left' for ChevronLeft, 'right' for ChevronRight */
    icon?: 'left' | 'right';
    /** Additional callback invoked when this suggestion is clicked */
    onClick?: SuggestionClickHandler;
};
