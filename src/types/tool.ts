import {Action} from './common';

export type TToolStatus =
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
    status?: TToolStatus;
    className?: string;
    qa?: string;
};

export type ToolFooterProps = {
    content?: React.ReactNode;
    actions: Action[];
    showLoader?: boolean;
    actionSize?: 's' | 'm';
    className?: string;
    qa?: string;
};

export type ToolMessageProps = {
    view?: 'default' | 'compact';
    footerActionSize?: 's' | 'm';
    /** Render attention separately when embedding the tool in a folded trace. */
    attentionPlacement?: 'inline' | 'external';
    secondaryText?: React.ReactNode;
    contextTooltip?: React.ReactNode;
    toolName: string;
    toolIcon?: React.ReactNode;
    footerActions?: Action[];
    headerActions?: Action[];
    bodyContent?: React.ReactNode;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    status?: TToolStatus;
    expandable?: boolean;
    initialExpanded?: boolean;
    autoCollapseOnSuccess?: boolean;
    autoCollapseOnCancelled?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    className?: string;
    qa?: string;
};
