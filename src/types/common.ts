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
 * Single suggestion item displayed as a button
 */
export type SuggestionsItem = {
    /** Optional unique identifier for the item */
    id?: string;
    /** Title text to display on the button */
    title: string;
    /** Button view */
    view?: ButtonButtonProps['view'];
    /** Icon position: 'left' for ChevronLeft, 'right' for ChevronRight */
    icon?: 'left' | 'right';
};
