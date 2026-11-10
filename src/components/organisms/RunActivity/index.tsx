'use client';

import {type ReactNode, useContext, useState} from 'react';

import {CircleCheck, CircleExclamation, CircleStop, Hand, Pause} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';
import type {ToolMessageProps} from '../../../types/tool';
import {CompactRow} from '../../internal/CompactRow/CompactRow';
import {MessageMarkdownContext} from '../../internal/MessageMarkdownContext';
import {ThinkingMessageView} from '../../internal/ThinkingMessage/ThinkingMessageView';
import type {ThinkingMessageProps} from '../ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

import {i18n} from './i18n';

const ThinkingStep = withDefaultMarkdown(ThinkingMessageView);

/** @experimental May change or be removed in minor releases. */
export type RunActivityState =
    | 'running'
    | 'completed'
    | 'cancelled'
    | 'error'
    | 'needs-input'
    | 'paused';
/** @experimental May change or be removed in minor releases. */
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

/** @experimental May change or be removed in minor releases. */
export interface RunActivityProps {
    /** Stable identity supplied by the host. */
    id: string;
    steps: readonly RunActivityStep[];
    state: RunActivityState;
    /** Recorded elapsed time, excluding pauses. Never inferred from mount time. */
    durationMs: number;
    /** Show summary and step icons. Individual steps can override this setting. */
    showIcon?: boolean;
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

/** @experimental May change or be removed in minor releases. */
export function RunActivity({
    id,
    steps,
    state,
    durationMs,
    currentAction,
    showIcon = true,
    label,
    defaultExpanded = false,
    expanded: controlled,
    onExpandedChange,
    renderStep,
    attention,
    className,
}: RunActivityProps) {
    const {t} = i18n.useTranslation();
    const markdownOptions = useContext(MessageMarkdownContext);
    const [localExpanded, setExpanded] = useState(defaultExpanded);
    const expanded = controlled ?? localExpanded;
    const seconds = Math.max(0, Math.round(durationMs / 1000));
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
        if (step.kind === 'thinking') {
            return (
                <ThinkingStep
                    format={markdownOptions ? 'markdown' : undefined}
                    {...step.props}
                    transformOptions={
                        step.props.transformOptions ?? markdownOptions?.transformOptions
                    }
                    mermaidOptions={step.props.mermaidOptions ?? markdownOptions?.mermaidOptions}
                    openMarkdownLinksInNewTab={
                        step.props.openMarkdownLinksInNewTab ??
                        markdownOptions?.openMarkdownLinksInNewTab
                    }
                    mdxOptions={step.props.mdxOptions ?? markdownOptions?.mdxOptions}
                    mdxContext={step.props.mdxContext ?? markdownOptions?.mdxContext}
                    markdownExtraProps={
                        step.props.markdownExtraProps ?? markdownOptions?.markdownExtraProps
                    }
                    showIcon={step.props.showIcon ?? showIcon}
                    view="compact"
                />
            );
        }
        if (step.kind === 'tool') {
            return (
                <ToolMessage
                    {...step.props}
                    showIcon={step.props.showIcon ?? showIcon}
                    view="compact"
                />
            );
        }
        return <div style={{margin: '6px 0 6px 24px'}}>{step.content}</div>;
    }
    return (
        <section data-run-id={id} className={className}>
            <CompactRow
                persistentChevron
                label={
                    label ??
                    (state === 'running'
                        ? (currentAction?.label ?? t('running'))
                        : t(state, {seconds}))
                }
                icon={icon}
                showIcon={showIcon}
                active={state === 'running'}
                expanded={expanded}
                onToggle={() => {
                    setExpanded(!expanded);
                    onExpandedChange?.(!expanded);
                }}
            >
                <ol
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: showIcon ? '8px 0 0 -24px' : '8px 0 0',
                    }}
                >
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
