import type {CSSProperties, ReactNode} from 'react';

import type {ThinkingMessageProps} from '../ThinkingMessage';

/** Execution state is independent of the application-defined category. */
export type ThinkingStepStatus = 'thinking' | 'thought' | 'error' | 'cancelled' | 'paused';

export interface ThinkingStep {
    /** Stable identity across streaming updates. */
    id: string;
    type: string;
    title?: string;
    status: ThinkingStepStatus;
    /** Paragraphs belonging to this step, not separate actions. */
    content?: string | string[];
    enabledCopy?: boolean;
    onCopyClick?: () => void;
}

export interface ThinkingStepType {
    /** Operation icon shown while thinking and after completion; error, paused, and cancelled states use their status icon. */
    icon?: ReactNode;
    /** Shown only in the expanded history. */
    label?: string;
}

export interface ThinkingMessageGroupProps
    extends Pick<
        ThinkingMessageProps,
        | 'format'
        | 'transformOptions'
        | 'mermaidOptions'
        | 'openMarkdownLinksInNewTab'
        | 'mdxOptions'
        | 'mdxContext'
        | 'markdownExtraProps'
        | 'className'
        | 'qa'
        | 'style'
    > {
    /** Ordered, accumulated steps supplied by the application. */
    steps: readonly ThinkingStep[];
    stepTypes?: Readonly<Record<string, ThinkingStepType>>;
    /** Defaults to the last step's status. Explicit run status takes precedence. */
    status?: ThinkingStepStatus;
    /** Defaults to the last thinking step while the group is running. */
    activeStepId?: string;
    expanded?: boolean;
    defaultExpanded?: boolean;
    /** Maximum expanded history height. Defaults to 480px; use "none" to disable the limit. */
    maxHistoryHeight?: CSSProperties['maxHeight'];
    onExpandedChange?: (expanded: boolean) => void;
    renderSummary?: (completedSteps: ThinkingStep[]) => ReactNode;
    renderStepContent?: (step: ThinkingStep) => ReactNode;
}
