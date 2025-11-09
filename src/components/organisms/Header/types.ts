import type {ButtonProps} from '@gravity-ui/uikit';

export enum HeaderAction {
    NewChat = 'newChat',
    History = 'history',
    Folding = 'folding',
    Close = 'close',
}

export type AdditionalActionsConfig = ButtonProps | React.ReactNode;

export type HeaderProps = {
    // Content
    icon?: React.ReactNode;
    title?: string;
    preview?: React.ReactNode;

    // Actions
    baseActions?: HeaderAction[];
    handleNewChat?: () => void;
    handleHistoryToggle?: () => void;
    handleFolding?: (value: 'collapsed' | 'opened') => void;
    handleClose?: () => void;
    additionalActions?: AdditionalActionsConfig[];

    // Folding state
    foldingState?: 'collapsed' | 'opened';

    // Display settings
    titlePosition?: 'left' | 'center'; // default: left

    className?: string;
};
