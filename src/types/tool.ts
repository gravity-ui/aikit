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
    /** @experimental Compact presentation may change in minor releases. */
    view?: 'default' | 'compact';
    /** @experimental Show the compact row icon. Defaults to true. */
    showIcon?: boolean;
    /** @experimental Compact presentation API may change in minor releases. */
    footerActionSize?: 's' | 'm';
    /** Render attention separately when embedding the tool in a folded trace. */
    /** @experimental Compact presentation API may change in minor releases. */
    attentionPlacement?: 'inline' | 'external';
    /** @experimental Compact presentation API may change in minor releases. */
    secondaryText?: React.ReactNode;
    /** @experimental Compact presentation API may change in minor releases. */
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
