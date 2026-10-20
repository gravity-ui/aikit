import type {ReactNode} from 'react';

/** Serializable application data attached to a single submitted draft. */
export type PromptSelection = {
    sourceId: string;
    id: string;
    title: string;
    data?: Record<string, unknown>;
};

export type PromptCommandItem = {
    id: string;
    title: string;
    description?: string;
    icon?: ReactNode;
    keywords?: string[];
    disabled?: boolean;
    data?: Record<string, unknown>;
    /** Replaces the active trigger and query. Omit to remove them. */
    insertText?: string;
    /** Keep this item in the draft and submit it. Defaults to true. */
    keepSelected?: boolean;
};

export type PromptCommandSource = {
    id: string;
    title: string;
    trigger?: '/' | '@';
    /** Also expose a button opening this source. */
    buttonLabel?: string;
    items?: readonly PromptCommandItem[];
    /** Overrides items; the application owns remote filtering. */
    getItems?: (
        query: string,
        options: {signal: AbortSignal},
    ) => Promise<readonly PromptCommandItem[]>;
    /** Called before committing the selection. Throw to keep the picker open. */
    onSelect?: (
        item: PromptCommandItem,
        context: {query: string; origin: 'input' | 'button'},
    ) => void;
};

export type PromptCommandsConfig = {
    sources: readonly PromptCommandSource[];
    /** Controlled selections. Reset these when switching conversations. */
    selections?: readonly PromptSelection[];
    onSelectionsChange?: (selections: PromptSelection[]) => void;
};
