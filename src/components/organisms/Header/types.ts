import type {Action} from '../../../types/common';

export enum HeaderAction {
    NewChat = 'newChat',
    History = 'history',
    Folding = 'folding',
    Close = 'close',
}

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
    additionalActions?: Action[];

    // Refs
    historyButtonRef?: React.RefObject<HTMLElement>;

    // Folding state
    foldingState?: 'collapsed' | 'opened';

    // Display settings
    titlePosition?: 'left' | 'center'; // default: left
    withIcon?: boolean; // default: true
    showTitle?: boolean; // default: true - controls visibility of title and preview

    className?: string;
};
