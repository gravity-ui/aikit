'use client';

import {type ReactNode, useState} from 'react';

import {CircleCheck, CircleExclamation, CircleStop, Hand, Pause} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {ToolMessageProps} from '../../../types/tool';
import type {ThinkingMessageProps} from '../ThinkingMessage';
import {ThinkingMessage} from '../ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

import {CompactRow} from './CompactRow';

export type RunActivityState =
    | 'running'
    | 'completed'
    | 'cancelled'
    | 'error'
    | 'needs-input'
    | 'paused';
export type RunActivityStep =
    | {id: string; kind: 'thinking'; props: ThinkingMessageProps}
    | {
          id: string;
          kind: 'tool';
          toolCallId?: string;
          input?: unknown;
          output?: unknown;
          props: ToolMessageProps;
      }
    | {id: string; kind: 'commentary'; content: ReactNode};

export interface RunActivityProps {
    /** Stable identity supplied by the host. */
    id: string;
    steps: readonly RunActivityStep[];
    state: RunActivityState;
    /** Recorded elapsed time, excluding pauses. Never inferred from mount time. */
    durationMs: number;
    currentAction?: {label: ReactNode; icon?: ReactNode};
    label?: ReactNode;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    renderStep?: (step: RunActivityStep) => ReactNode;
    /** Approvals, questions and actionable errors stay outside the folded history. */
    attention?: ReactNode;
    className?: string;
}

export function RunActivity({
    id,
    steps,
    state,
    durationMs,
    currentAction,
    label,
    defaultExpanded = false,
    expanded: controlled,
    onExpandedChange,
    renderStep,
    attention,
    className,
}: RunActivityProps) {
    const [localExpanded, setExpanded] = useState(defaultExpanded);
    const expanded = controlled ?? localExpanded;
    const seconds = Math.max(0, Math.round(durationMs / 1000));
    const labels = {
        running: 'Thinking',
        completed: `Worked for ${seconds} s`,
        cancelled: `Stopped after ${seconds} s`,
        error: `Work interrupted · ${seconds} s`,
        'needs-input': 'Waiting for your approval',
        paused: `Paused · ${seconds} s`,
    };
    const statusIcons = {
        completed: CircleCheck,
        cancelled: CircleStop,
        error: CircleExclamation,
        'needs-input': Hand,
        paused: Pause,
    };
    const icon =
        state === 'running' ? currentAction?.icon : <Icon size={14} data={statusIcons[state]} />;
    function renderDefaultStep(step: RunActivityStep) {
        if (step.kind === 'thinking') return <ThinkingMessage {...step.props} view="compact" />;
        if (step.kind === 'tool') return <ToolMessage {...step.props} view="compact" />;
        return <div style={{margin: '6px 0 6px 24px'}}>{step.content}</div>;
    }
    return (
        <section data-run-id={id} className={className}>
            <CompactRow
                persistentChevron
                label={
                    label ??
                    (state === 'running' ? (currentAction?.label ?? labels.running) : labels[state])
                }
                icon={icon}
                active={state === 'running'}
                expanded={expanded}
                onToggle={() => {
                    setExpanded(!expanded);
                    onExpandedChange?.(!expanded);
                }}
            >
                <ol style={{listStyle: 'none', padding: 0, margin: '8px 0 0 -24px'}}>
                    {steps.map((step) => (
                        <li key={step.id}>
                            {renderStep ? renderStep(step) : renderDefaultStep(step)}
                        </li>
                    ))}
                </ol>
            </CompactRow>
            {attention}
        </section>
    );
}
