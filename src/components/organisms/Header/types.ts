import type {Action} from '../../../types/common';

export enum HeaderAction {
    NewChat = 'newChat',
    History = 'history',
    Folding = 'folding',
    Close = 'close',
}

export type HeaderActionTooltipTexts = Partial<
    Record<Exclude<HeaderAction, HeaderAction.Folding>, string>
> & {
    /** Tooltip texts for {@link HeaderAction.Folding}. */
    [HeaderAction.Folding]?: Partial<Record<'collapsed' | 'opened', string>>;
};

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

    /** QA/test identifier on header root */
    qa?: string;
    /** Per base action `data-qa` (defaults to `header-action-${id}`) */
    actionQa?: Partial<Record<HeaderAction, string>>;
    /**
     * Override tooltip texts per base action. When a value is undefined, the built-in
     * localized string is used (e.g. `i18n('action-tooltip-newChat')`).
     */
    actionTooltipTexts?: HeaderActionTooltipTexts;
};
