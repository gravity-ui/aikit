'use client';

import {useState} from 'react';

import {
    ChevronRight,
    CircleCheck,
    CircleDashed,
    CircleExclamation,
    CircleXmark,
    Eye,
    Xmark,
} from '@gravity-ui/icons';
import {ActionTooltip, Button, Icon, Popup, Spin, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './PlanProgress.scss';

const b = block('plan-progress');

const statusIcons = {
    pending: CircleDashed,
    completed: CircleCheck,
    failed: CircleExclamation,
    cancelled: CircleXmark,
};

/** @experimental May change or be removed in minor releases. */
export interface PlanStep {
    id: string;
    title: string;
    /** Formatted elapsed time supplied by the host. */
    elapsedLabel?: string;
    status: keyof typeof statusIcons | 'running';
}

/** @experimental May change or be removed in minor releases. */
export interface PlanStepListProps {
    steps: readonly PlanStep[];
    onStepClick?: (id: string) => void;
}

/** @experimental May change or be removed in minor releases. */
export function PlanStepList({steps, onStepClick}: PlanStepListProps) {
    const {t} = i18n.useTranslation();

    return (
        <ol className={b('steps')}>
            {steps.map(({id, title, status, elapsedLabel}) => {
                const content = (
                    <>
                        <span className={b('status', {status})} role="img" aria-label={t(status)}>
                            {status === 'running' ? (
                                <Spin size="xs" className={b('spinner')} />
                            ) : (
                                <Icon data={statusIcons[status]} size={14} />
                            )}
                        </span>
                        <span>{title}</span>
                    </>
                );
                const elapsed = elapsedLabel && (
                    <span className={b('step-elapsed')}>{elapsedLabel}</span>
                );
                return (
                    <li key={id} aria-current={status === 'running' ? 'step' : undefined}>
                        {onStepClick ? (
                            <button
                                type="button"
                                className={b('step', {interactive: true})}
                                onClick={() => onStepClick(id)}
                            >
                                {content}
                                <span className={b('step-trailing')}>
                                    {elapsed}
                                    <Icon
                                        className={b('step-chevron')}
                                        data={ChevronRight}
                                        size={12}
                                        aria-hidden
                                    />
                                </span>
                            </button>
                        ) : (
                            <div className={b('step')}>
                                {content}
                                {elapsed && <span className={b('step-trailing')}>{elapsed}</span>}
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/** @experimental May change or be removed in minor releases. */
export type PlanStatus = PlanStep['status'];

/** @experimental May change or be removed in minor releases. */
export interface PlanProgressProps extends PlanStepListProps {
    status: PlanStatus;
    view?: 'pill' | 'card';
    onCancel?: () => void;
    onOpenPreview?: () => void;
    className?: string;
    qa?: string;
}

/** @experimental May change or be removed in minor releases. */
export function PlanProgress({
    steps,
    status,
    view = 'pill',
    onStepClick,
    onCancel,
    onOpenPreview,
    className,
    qa,
}: PlanProgressProps) {
    const {t} = i18n.useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const id = useUniqId();
    if (!steps.length) {
        return null;
    }

    const total = steps.length;
    const completed = steps.filter((step) => step.status === 'completed').length;
    const statusLabel = t(`plan-${status}`);
    const cancel = view === 'pill' && status === 'running' ? onCancel : undefined;

    return (
        <div className={b({view, split: Boolean(cancel)}, className)} data-qa={qa}>
            <Button
                ref={setAnchor}
                className={b('summary', {view})}
                view="outlined"
                pin={cancel ? 'round-clear' : undefined}
                aria-label={`${statusLabel}. ${t('progress', {completed, total})}`}
                aria-haspopup="dialog"
                aria-expanded={expanded}
                aria-controls={expanded ? id : undefined}
                onClick={() => setExpanded(!expanded)}
            >
                <span className={b('status', {status})} aria-hidden>
                    {status === 'running' ? (
                        <Spin size="xs" className={b('spinner')} />
                    ) : (
                        <Icon data={statusIcons[status]} size={14} />
                    )}
                </span>
                {statusLabel}
                <span className={b('count')} aria-hidden>
                    {completed}/{total}
                </span>
            </Button>
            {cancel && (
                <ActionTooltip title={t('cancel')} placement="top">
                    <Button
                        className={b('cancel')}
                        view="outlined"
                        pin="brick-round"
                        aria-label={t('cancel')}
                        onClick={() => {
                            setExpanded(false);
                            cancel();
                        }}
                    >
                        <Icon data={Xmark} size={16} aria-hidden />
                    </Button>
                </ActionTooltip>
            )}
            {view === 'card' && completed > 0 && onOpenPreview && (
                <Button view="action" onClick={onOpenPreview}>
                    <Icon data={Eye} size={16} />
                    {t('view-preview')}
                </Button>
            )}
            <Popup
                id={id}
                role="dialog"
                floatingRef={(node) => node?.setAttribute('aria-label', t('title'))}
                modal
                placement="top"
                offset={8}
                anchorElement={anchor}
                open={expanded && Boolean(anchor)}
                onOpenChange={setExpanded}
                className={b('popup')}
            >
                <div className={b('content')} tabIndex={0}>
                    <PlanStepList
                        steps={steps}
                        onStepClick={
                            onStepClick &&
                            ((stepId) => {
                                setExpanded(false);
                                onStepClick(stepId);
                            })
                        }
                    />
                </div>
            </Popup>
        </div>
    );
}
