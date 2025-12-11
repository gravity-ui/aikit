import {ButtonView} from '@gravity-ui/uikit';

/**
 * Action configuration object with properties
 */
export type ActionConfig = {
    label?: string;
    onClick?: () => void;
    view?: ButtonView;
    icon?: React.ReactNode;
};

/**
 * Action can be either:
 * - ActionConfig object with properties (label, icon, onClick, view)
 * - React.ReactNode for fully custom content
 */
export type Action = ActionConfig | React.ReactNode;
