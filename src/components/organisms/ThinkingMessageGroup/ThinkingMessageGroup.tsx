'use client';

import {type ReactNode, useId, useState} from 'react';

import {Check, ChevronRight, Copy} from '@gravity-ui/icons';
import {Button, Icon, Text} from '@gravity-ui/uikit';

import {copyToClipboard} from '../../../utils/clipboardUtils';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';

import {i18n} from './i18n';
import type {ThinkingMessageGroupProps, ThinkingStep} from './types';

import './ThinkingMessageGroup.scss';

const b = block('thinking-message-group');

export function ThinkingMessageGroup(props: ThinkingMessageGroupProps) {
    const {
        steps,
        stepTypes,
        status = steps[steps.length - 1]?.status ?? 'thought',
        activeStepId,
        expanded,
        defaultExpanded = false,
        onExpandedChange,
        renderSummary,
        renderStepContent,
        className,
        qa,
        style,
        format = 'plain',
        transformOptions,
        mermaidOptions,
        openMarkdownLinksInNewTab,
        mdxOptions,
        mdxContext,
        markdownExtraProps,
    } = props;
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const detailsId = useId();
    const isExpanded = expanded ?? internalExpanded;
    const activeStep =
        activeStepId === undefined
            ? [...steps].reverse().find((step) => step.status === 'thinking')
            : steps.find((step) => step.id === activeStepId);
    const completedSteps = steps.filter((step) => step.status === 'thought');
    const isThinking = status === 'thinking';
    const hasDetails =
        !isThinking ||
        steps.length > 1 ||
        Boolean(renderStepContent) ||
        steps.some((step) => {
            const content = Array.isArray(step.content) ? step.content : [step.content];
            return (
                Boolean(stepTypes?.[step.type]?.label || step.enabledCopy || step.onCopyClick) ||
                content.some(Boolean)
            );
        });

    if (steps.length === 0) {
        return null;
    }

    const toggleExpanded = () => {
        const nextExpanded = !isExpanded;
        if (expanded === undefined) {
            setInternalExpanded(nextExpanded);
        }
        onExpandedChange?.(nextExpanded);
    };

    const defaultSummary =
        completedSteps.length > 0 ? i18n('completed-steps', {count: completedSteps.length}) : null;
    const summary = renderSummary ? renderSummary(completedSteps) : defaultSummary;
    const heading = (
        <CompactHeading
            activeStep={activeStep}
            stepTypes={stepTypes}
            status={status}
            summary={summary}
            hasDetails={hasDetails}
            isExpanded={isExpanded}
        />
    );

    return (
        <div className={b(null, className)} data-qa={qa} style={style}>
            {hasDetails ? (
                <Button
                    className={b('compact-toggle')}
                    view="flat-secondary"
                    width="auto"
                    onClick={toggleExpanded}
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? detailsId : undefined}
                >
                    {heading}
                </Button>
            ) : (
                <div className={b('compact-header')}>{heading}</div>
            )}
            {hasDetails && isExpanded && (
                <ol className={b('steps')} id={detailsId}>
                    {steps.map((step) => {
                        const type = stepTypes?.[step.type];
                        const content = Array.isArray(step.content) ? step.content : [step.content];
                        return (
                            <li className={b('step')} key={step.id}>
                                <span
                                    className={b('step-marker', {status: step.status})}
                                    role="img"
                                    aria-label={i18n(`status-${step.status}`)}
                                >
                                    {type?.icon ||
                                        (step.status === 'thought' ? (
                                            <Icon data={Check} size={14} />
                                        ) : (
                                            <span className={b('step-dot')} />
                                        ))}
                                </span>
                                <div className={b('step-body')}>
                                    <Text
                                        className={b('step-title', {
                                            active:
                                                step.id === activeStep?.id &&
                                                step.status === 'thinking' &&
                                                isThinking,
                                        })}
                                    >
                                        {step.title || i18n(`status-${step.status}`)}
                                    </Text>
                                    {(type?.label ||
                                        (step.status !== 'thinking' &&
                                            step.status !== 'thought')) && (
                                        <span className={b('step-meta')}>
                                            {type?.label && <span>{type.label}</span>}
                                            {step.status !== 'thinking' &&
                                                step.status !== 'thought' && (
                                                    <span
                                                        className={b('step-status', {
                                                            error: step.status === 'error',
                                                        })}
                                                    >
                                                        {i18n(`status-${step.status}`)}
                                                    </span>
                                                )}
                                        </span>
                                    )}
                                    <div className={b('step-details')}>
                                        {renderStepContent
                                            ? renderStepContent(step)
                                            : content.map((item, index) => {
                                                  if (!item) {
                                                      return null;
                                                  }
                                                  if (format === 'markdown') {
                                                      return (
                                                          <MarkdownRenderer
                                                              className={b('step-content')}
                                                              key={index}
                                                              content={item}
                                                              transformOptions={{
                                                                  disableCommonAnchors: true,
                                                                  ...transformOptions,
                                                              }}
                                                              mermaidOptions={mermaidOptions}
                                                              openLinksInNewTab={
                                                                  openMarkdownLinksInNewTab
                                                              }
                                                              mdxOptions={mdxOptions}
                                                              mdxContext={mdxContext}
                                                              extraProps={markdownExtraProps}
                                                          />
                                                      );
                                                  }
                                                  return (
                                                      <Text
                                                          className={b('step-content', {
                                                              plain: true,
                                                          })}
                                                          key={index}
                                                      >
                                                          {item}
                                                      </Text>
                                                  );
                                              })}
                                    </div>
                                    {step.status !== 'thinking' &&
                                        (step.enabledCopy || step.onCopyClick) && (
                                            <ActionButton
                                                size="xs"
                                                aria-label={i18n('copy')}
                                                tooltipTitle={i18n('copy')}
                                                className={b('copy')}
                                                onClick={() => {
                                                    if (step.onCopyClick) step.onCopyClick();
                                                    else copyToClipboard(step.content ?? '');
                                                }}
                                            >
                                                <Icon data={Copy} size={14} />
                                            </ActionButton>
                                        )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}

interface CompactHeadingProps extends Pick<ThinkingMessageGroupProps, 'stepTypes'> {
    status: NonNullable<ThinkingMessageGroupProps['status']>;
    activeStep?: ThinkingStep;
    summary: ReactNode;
    hasDetails: boolean;
    isExpanded: boolean;
}

function CompactHeading({
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
    const headerIcon = showActiveStep && activeStep ? stepTypes?.[activeStep.type]?.icon : null;
    const showSecondarySummary = !showCompletedSummary && hasSummary;
    return (
        <span className={b('compact-heading')}>
            <span className={b('compact-current')}>
                {headerIcon && (
                    <span className={b('step-icon')} aria-hidden="true">
                        {headerIcon}
                    </span>
                )}
                <span
                    className={b('compact-label', {
                        active: isThinking && activeStep?.status === 'thinking',
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
                <span className={b('compact-summary', {indented: Boolean(headerIcon)})}>
                    {summary}
                </span>
            )}
        </span>
    );
}
