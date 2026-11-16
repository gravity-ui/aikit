import type {ReactNode} from 'react';

export interface AskUserQuestionOption {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    recommended?: boolean;
}

export type AskUserQuestionAnswer =
    | {type: 'option'; optionId: string}
    | {type: 'custom'; value: string};

export interface AskUserQuestionProps {
    question: string;
    options: AskUserQuestionOption[];
    /** Emits one answer. The host saves it and resumes the run once all required answers are collected. */
    onAnswer: (answer: AskUserQuestionAnswer) => void;
    /** Saved answer for the current question, controlled by the host. */
    selectedAnswer?: AskUserQuestionAnswer;
    /** Zero-based question index. Navigation is controlled by the host. */
    questionIndex?: number;
    questionCount?: number;
    /** Optional segmented progress. Zero-based indices of answered questions; skips are excluded. */
    answeredQuestionIndices?: readonly number[];
    /** All progress segments are filled and their animations have finished. Not emitted without multi-question progress. */
    onProgressComplete?: () => void;
    onQuestionChange?: (index: number) => void;
    /** Close/skip notification only; does not submit an answer or select a default. */
    onClose?: () => void;
    allowCustomAnswer?: boolean;
    customAnswer?: string;
    onCustomAnswerChange?: (value: string) => void;
    customAnswerPlaceholder?: string;
    showShortcuts?: boolean;
    /** Optional additional host-provided footer content. */
    footer?: ReactNode;
    className?: string;
    qa?: string;
}
