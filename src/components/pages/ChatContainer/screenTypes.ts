import type {ReactNode} from 'react';

/** Why the container requests a different screen. */
export type ChatScreenChangeReason = 'open' | 'back' | 'unavailable';

export interface ChatScreenChangeDetails {
    previousScreen: string;
    reason: ChatScreenChangeReason;
}

export interface ChatScreenLeaveIntent {
    action: 'open' | 'back' | 'close';
    nextScreen?: string;
}

export interface ChatScreenContext {
    /** Open another registered screen, replacing the current secondary screen. */
    open: (id: string) => void;
    /** Return to the chat root after the leave check. */
    back: () => void;
    /** Ask the host to close the panel after the leave check. */
    requestClose: () => void;
    /** A leave check is pending. */
    pending: boolean;
}

export interface ChatScreenDefinition {
    /** Unique ID. The built-in `chat` ID is reserved. */
    id: string;
    title: string;
    /** Unavailable screens cannot be opened and are removed from the menu. */
    enabled?: boolean;
    /** Optional entry in the chat header menu. */
    menu?: {label: string; icon?: ReactNode};
    /** Render a component here; do not call hooks inside this callback. */
    render: (context: ChatScreenContext) => ReactNode;
    /** Optional screen actions below its scrollable content. */
    footer?: (context: ChatScreenContext) => ReactNode;
    /** False or rejection keeps the current screen. External prop assignments bypass this check. */
    beforeLeave?: (intent: ChatScreenLeaveIntent) => boolean | Promise<boolean>;
}

export interface ChatScreenNavigationProps {
    screens?: readonly ChatScreenDefinition[];
    /** Controlled selection. Pair with onScreenChange to accept navigation requests. */
    activeScreen?: string;
    /** Initial uncontrolled selection; defaults to `chat`. */
    defaultActiveScreen?: string;
    onScreenChange?: (screen: string, details: ChatScreenChangeDetails) => void;
    /** Reports a rejected leave check without navigating. */
    onScreenNavigationError?: (error: unknown) => void;
}
