import type {ButtonView} from '@gravity-ui/uikit';

export type ToolStatus =
    | 'success'
    | 'error'
    | 'loading'
    | 'waitingConfirmation'
    | 'waitingSubmission';

export type ToolActionBase = {
    label: string;
    onClick?: () => void;
};

export type ToolHeaderAction = ToolActionBase & {
    icon?: React.ReactNode;
};

export type ToolFooterAction = ToolActionBase & {
    view: ButtonView;
};

export type ToolHeaderProps = {
    toolIcon?: React.ReactNode;
    toolName: string;
    content?: React.ReactNode;
    actions?: ToolHeaderAction[];
    status?: ToolStatus;
    className?: string;
    qa?: string;
};

export type ToolFooterProps = {
    content?: React.ReactNode;
    actions: ToolFooterAction[];
    showLoader?: boolean;
    className?: string;
    qa?: string;
};

export type ToolMessageProps = {
    toolName: string;
    toolIcon?: React.ReactNode;
    footerActions?: ToolFooterAction[];
    headerActions?: ToolHeaderAction[];
    bodyContent?: React.ReactNode;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    status?: ToolStatus;
    expandable?: boolean;
    initialExpanded?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    className?: string;
    qa?: string;
};
