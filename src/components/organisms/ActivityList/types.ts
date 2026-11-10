import type {CSSProperties, ReactNode} from 'react';

import type {ThinkingMessageProps} from '../ThinkingMessage';

/** Execution state is independent of the application-defined category. */
export type ActivityStepStatus = 'thinking' | 'thought' | 'error' | 'cancelled' | 'paused';

export interface ActivityStep {
    /** Stable identity across streaming updates. */
    id: string;
    type: string;
    title?: string;
    status: ActivityStepStatus;
    /** Paragraphs belonging to this step, not separate actions. */
    content?: string | string[];
    enabledCopy?: boolean;
    onCopyClick?: () => void;
}

export interface ActivityStepType {
    /** Operation icon used by default or with iconMode="type" while thinking and after completion; other states use their status icon. */
    icon?: ReactNode;
    /** Shown only in the expanded history. */
    label?: string;
}

export interface ActivityListProps
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
    steps: readonly ActivityStep[];
    /** When omitted, preserves supplied category icons and otherwise uses status icons. Explicit modes override this behavior. */
    iconMode?: 'type' | 'status' | 'none';
    /** Plain-text running heading supplied by the application; overrides the active step title. */
    activeStepLabel?: string;
    stepTypes?: Readonly<Record<string, ActivityStepType>>;
    /** Defaults to the last step's status. Explicit run status takes precedence. */
    status?: ActivityStepStatus;
    /** Defaults to the last thinking step while the group is running. */
    activeStepId?: string;
    expanded?: boolean;
    defaultExpanded?: boolean;
    /** Maximum expanded history height. Defaults to 480px; use "none" to disable the limit. */
    maxHistoryHeight?: CSSProperties['maxHeight'];
    onExpandedChange?: (expanded: boolean) => void;
    renderSummary?: (completedSteps: ActivityStep[]) => ReactNode;
    renderStepContent?: (step: ActivityStep) => ReactNode;
}
