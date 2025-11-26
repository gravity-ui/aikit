import {Action} from './common';

export type ToolStatus =
    | 'success'
    | 'error'
    | 'loading'
    | 'waitingConfirmation'
    | 'waitingSubmission'
    | 'cancelled';

export type ToolHeaderProps = {
    toolIcon?: React.ReactNode;
    toolName: string;
    content?: React.ReactNode;
    actions?: Action[];
    status?: ToolStatus;
    className?: string;
    qa?: string;
};

export type ToolFooterProps = {
    content?: React.ReactNode;
    actions: Action[];
    showLoader?: boolean;
    className?: string;
    qa?: string;
};

export type ToolMessageProps = {
    toolName: string;
    toolIcon?: React.ReactNode;
    footerActions?: Action[];
    headerActions?: Action[];
    bodyContent?: React.ReactNode;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    status?: ToolStatus;
    expandable?: boolean;
    initialExpanded?: boolean;
    autoCollapseOnSuccess?: boolean;
    autoCollapseOnCancelled?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    className?: string;
    qa?: string;
};
