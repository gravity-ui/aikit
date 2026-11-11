'use client';

import {useId, useState} from 'react';

import {Copy} from '@gravity-ui/icons';
import {Button, Icon, Text} from '@gravity-ui/uikit';

import {MarkdownContent} from '../../../markdown/MarkdownProvider';
import {copyToClipboard} from '../../../utils/clipboardUtils';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';

import {CompactHeading} from './CompactHeading';
import {StepIcon} from './StepIcon';
import {i18n} from './i18n';
import type {ActivityListProps, ActivityStep} from './types';

import './ActivityList.scss';

const b = block('thinking-message-group');

function shouldShowStatus(
    step: ActivityStep,
    iconMode: ActivityListProps['iconMode'],
    hasContent: boolean,
) {
    if (iconMode !== 'none') return false;
    const isEmpty = !step.title && !hasContent;
    return isEmpty || (step.status !== 'thinking' && step.status !== 'thought');
}

export function ActivityList(props: ActivityListProps) {
    const {t} = i18n.useTranslation();
    const {
        steps,
        iconMode,
        activeStepLabel,
        stepTypes,
        status = steps[steps.length - 1]?.status ?? 'thought',
        activeStepId,
        expanded,
        defaultExpanded = false,
        maxHistoryHeight = 480,
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
    const headingId = `${detailsId}-heading`;
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
        Boolean(activeStepLabel && activeStep?.title && activeStepLabel !== activeStep.title) ||
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
        completedSteps.length > 0 ? t('completed-steps', {count: completedSteps.length}) : null;
    const summary = renderSummary ? renderSummary(completedSteps) : defaultSummary;
    const heading = (
        <CompactHeading
            activeStep={activeStep}
            stepTypes={stepTypes}
            iconMode={iconMode}
            activeStepLabel={activeStepLabel}
            status={status}
            summary={summary}
            hasDetails={hasDetails}
            isExpanded={isExpanded}
        />
    );

    return (
        <div
            className={b({'without-icons': iconMode === 'none'}, className)}
            data-qa={qa}
            style={style}
        >
            {hasDetails ? (
                <Button
                    id={headingId}
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
                <ol
                    className={b('steps')}
                    id={detailsId}
                    aria-labelledby={headingId}
                    tabIndex={0}
                    style={{maxHeight: maxHistoryHeight}}
                >
                    {steps.map((step) => {
                        const type = stepTypes?.[step.type];
                        const typeLabel = type?.label;
                        const content = Array.isArray(step.content) ? step.content : [step.content];
                        const hasContent = Boolean(renderStepContent) || content.some(Boolean);
                        const showStatus = shouldShowStatus(step, iconMode, hasContent);
                        return (
                            <li className={b('step')} key={step.id}>
                                <span
                                    className={b('step-marker', {
                                        status: step.status,
                                        hidden: iconMode === 'none',
                                    })}
                                    role="img"
                                    aria-label={t(`status-${step.status}`)}
                                >
                                    <StepIcon
                                        status={step.status}
                                        operationIcon={type?.icon}
                                        iconMode={iconMode}
                                    />
                                </span>
                                <div className={b('step-body')}>
                                    {step.title && (
                                        <Text variant="body-1" className={b('step-title')}>
                                            {step.title}
                                        </Text>
                                    )}
                                    {(typeLabel || showStatus) && (
                                        <span className={b('step-meta')}>
                                            {typeLabel && <span>{typeLabel}</span>}
                                            {showStatus && (
                                                <span
                                                    className={b('step-status', {
                                                        error: step.status === 'error',
                                                    })}
                                                >
                                                    {t(`status-${step.status}`)}
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
                                                          <MarkdownContent
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
                                                aria-label={t('copy')}
                                                tooltipTitle={t('copy')}
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
