import type {ButtonButtonProps, IconData} from '@gravity-ui/uikit';

import type {Action} from '../../../types/common';

export type HeaderMenuItem = {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Optional leading icon (rendered only when provided) */
    icon?: React.ReactNode;
};

export enum HeaderAction {
    NewChat = 'newChat',
    History = 'history',
    Folding = 'folding',
    Close = 'close',
}

/** Composite and service action groups that can participate in header ordering. */
export enum HeaderActionGroup {
    Menu = 'menu',
    Additional = 'additional',
}

export type HeaderActionSide = 'left' | 'right';

export type HeaderActionsPlacement = {
    /** Side for individual built-in actions. Unspecified actions stay on the right. */
    base?: Partial<Record<HeaderAction, HeaderActionSide>>;
    /** Side for the menu button. */
    menu?: HeaderActionSide;
    /** Side for the whole additional actions group. */
    additional?: HeaderActionSide;
};

export type HeaderActionOrderItem = HeaderAction | HeaderActionGroup;

export type HeaderActionsOrder = Partial<
    Record<HeaderActionSide, readonly HeaderActionOrderItem[]>
>;

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
    actionsPlacement?: HeaderActionsPlacement;
    /** Order of action groups on each side. Unlisted available actions keep their legacy order. */
    actionsOrder?: HeaderActionsOrder;
    /** Default size for built-in, menu, and configured additional action buttons. */
    actionSize?: ButtonButtonProps['size'];
    /** Custom icons for built-in actions. Unspecified actions keep their default icons. */
    actionIcons?: Partial<Record<HeaderAction, IconData>>;

    /**
     * Menu items for the "..." dropdown. Labels and handlers are provided by the consumer.
     * The menu button is rendered only when the array is non-empty.
     */
    menuItems?: HeaderMenuItem[];
    /** Tooltip for the menu button (default: built-in i18n) */
    menuButtonTooltip?: string;
    /** Custom menu button icon (default: horizontal Ellipsis) */
    menuButtonIcon?: React.ReactNode;
    /** data-qa for the menu button (default: `header-menu-button`) */
    menuButtonQa?: string;
    /** data-qa overrides per menu item id (default: `header-menu-item-${id}`) */
    menuItemQa?: Partial<Record<string, string>>;
    /** Show the mobile menu sheet title (default: `true`); it stays in `aria-label` either way */
    showSheetTitle?: boolean;

    /**
     * Notification callback fired by ChatContainer when the history popup is toggled
     * via the Header action button. Receives the next open state (the value the chat
     * will be in after the toggle).
     */
    onHistoryToggle?: (open: boolean) => void;

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
