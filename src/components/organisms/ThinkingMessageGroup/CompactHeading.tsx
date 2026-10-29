import type {ReactNode} from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {StepIcon} from './StepIcon';
import {i18n} from './i18n';
import type {ThinkingMessageGroupProps, ThinkingStep} from './types';

const b = block('thinking-message-group');

interface CompactHeadingProps extends Pick<ThinkingMessageGroupProps, 'stepTypes'> {
    status: NonNullable<ThinkingMessageGroupProps['status']>;
    activeStep?: ThinkingStep;
    summary: ReactNode;
    hasDetails: boolean;
    isExpanded: boolean;
}

export function CompactHeading({
    activeStep,
    stepTypes,
    status,
    summary,
    hasDetails,
    isExpanded,
}: CompactHeadingProps) {
    const isThinking = status === 'thinking';
    const showActiveStep = Boolean(activeStep && isThinking);
    const hasSummary =
        summary !== null && summary !== undefined && summary !== false && summary !== '';
    const showCompletedSummary = status === 'thought' && hasSummary;
    const label = (showActiveStep && activeStep?.title) || i18n(`status-${status}`);
    const operationIcon = showActiveStep && activeStep ? stepTypes?.[activeStep.type]?.icon : null;
    const showSecondarySummary = !showCompletedSummary && hasSummary;
    return (
        <span className={b('compact-heading')}>
            <span className={b('compact-current')}>
                {status !== 'thought' && (
                    <span
                        className={b('step-icon', {error: status === 'error'})}
                        aria-hidden="true"
                    >
                        <StepIcon status={status} operationIcon={operationIcon} />
                    </span>
                )}
                <span
                    className={b('compact-label', {
                        active: isThinking && activeStep?.status === 'thinking',
                        error: status === 'error',
                    })}
                    title={showCompletedSummary ? undefined : label}
                >
                    {showCompletedSummary ? summary : label}
                </span>
                {hasDetails && (
                    <span className={b('disclosure', {expanded: isExpanded})} aria-hidden="true">
                        <Icon data={ChevronRight} size={12} />
                    </span>
                )}
            </span>
            {showSecondarySummary && (
                <span className={b('compact-summary', {indented: true})}>{summary}</span>
            )}
        </span>
    );
}
