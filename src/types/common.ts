import {ButtonView} from '@gravity-ui/uikit';

export type Action = {
    label?: string;
    onClick?: () => void;
    view?: ButtonView;
    icon?: React.ReactNode;
};
