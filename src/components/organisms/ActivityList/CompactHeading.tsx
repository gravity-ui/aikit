import type {ReactNode} from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {StepIcon} from './StepIcon';
import {i18n} from './i18n';
import type {ActivityListProps, ActivityStep} from './types';

const b = block('thinking-message-group');

interface CompactHeadingProps
    extends Pick<ActivityListProps, 'stepTypes' | 'iconMode' | 'activeStepLabel'> {
    status: NonNullable<ActivityListProps['status']>;
    activeStep?: ActivityStep;
    summary: ReactNode;
    hasDetails: boolean;
    isExpanded: boolean;
}

export function CompactHeading({
    activeStep,
    stepTypes,
    iconMode,
    activeStepLabel,
    status,
    summary,
    hasDetails,
    isExpanded,
}: CompactHeadingProps) {
    const isThinking = status === 'thinking';
    const hasSummary =
        summary !== null && summary !== undefined && summary !== false && summary !== '';
    const showCompletedSummary = status === 'thought' && hasSummary;
    const label =
        (isThinking && activeStepLabel) ||
        (isThinking && activeStep?.title) ||
        i18n(`status-${status}`);
    const showIcon = status !== 'thought' && iconMode !== 'none';
    const operationIcon = isThinking && activeStep ? stepTypes?.[activeStep.type]?.icon : null;
    const showSecondarySummary = !showCompletedSummary && hasSummary;
    return (
        <span className={b('compact-heading')}>
            <span className={b('compact-current')}>
                {showIcon && (
                    <span
                        className={b('step-icon', {error: status === 'error'})}
                        aria-hidden="true"
                    >
                        <StepIcon
                            status={status}
                            operationIcon={operationIcon}
                            iconMode={iconMode}
                        />
                    </span>
                )}
                <span
                    className={b('compact-label', {
                        active:
                            isThinking &&
                            (activeStep?.status === 'thinking' || Boolean(activeStepLabel)),
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
                <span className={b('compact-summary', {indented: showIcon})}>{summary}</span>
            )}
        </span>
    );
}
