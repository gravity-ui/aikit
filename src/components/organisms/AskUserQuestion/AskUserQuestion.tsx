import {useCallback, useEffect, useId, useRef, useState} from 'react';

import {ChevronLeft, ChevronRight, CircleQuestion} from '@gravity-ui/icons';
import {Button, Hotkey, Icon, Label, TextInput} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';

import {i18n} from './i18n';
import type {AskUserQuestionAnswer, AskUserQuestionProps} from './types';
import {useQuestionTransition} from './useQuestionTransition';

import './AskUserQuestion.scss';

const b = block('ask-user-question');

export function AskUserQuestion({
    question,
    options,
    onAnswer,
    selectedAnswer,
    questionIndex = 0,
    questionCount = 1,
    answeredQuestionIndices,
    onProgressComplete,
    onQuestionChange,
    onClose,
    allowCustomAnswer = true,
    customAnswer,
    onCustomAnswerChange,
    customAnswerPlaceholder,
    showShortcuts = true,
    footer,
    className,
    qa,
}: AskUserQuestionProps) {
    const {t} = i18n.useTranslation();
    const titleId = useId();
    const answered = new Set(
        answeredQuestionIndices?.filter(
            (index) => Number.isInteger(index) && index >= 0 && index < questionCount,
        ),
    );
    const progressRef = useRef<HTMLDivElement>(null);
    const progressCompleteCallback = useRef(onProgressComplete);
    progressCompleteCallback.current = onProgressComplete;
    const progressComplete =
        Boolean(answeredQuestionIndices) && questionCount > 1 && answered.size === questionCount;
    useEffect(() => {
        if (!progressComplete) {
            return undefined;
        }
        let cancelled = false;
        const animations = progressRef.current?.getAnimations({subtree: true}) ?? [];
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
            if (!cancelled) {
                progressCompleteCallback.current?.();
            }
        });
        return () => {
            cancelled = true;
        };
    }, [progressComplete]);
    const contentRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useQuestionTransition(rootRef, contentRef);
    const inputRef = useRef<HTMLInputElement>(null);
    const customRowRef = useRef<HTMLDivElement>(null);
    const selectedOptions = useRef(new Map<string, AskUserQuestionAnswer>());
    const questionKey = `${questionIndex}:${question}`;
    const selectedAnswerRef = useRef(selectedAnswer);
    selectedAnswerRef.current = selectedAnswer;
    const [keyboardFocus, setKeyboardFocus] = useState(true);
    const answerOption = useCallback(
        (optionId: string) => {
            selectedOptions.current.set(questionKey, {type: 'option', optionId});
            onAnswer({type: 'option', optionId});
        },
        [onAnswer, questionKey],
    );

    useEffect(() => {
        const root = rootRef.current;
        if (!root || root.closest('[inert]')) {
            return;
        }
        const active = root.ownerDocument.activeElement;
        if (
            active &&
            !root.contains(active) &&
            active.matches(
                'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
            ) &&
            !(active instanceof HTMLTextAreaElement && !active.value.trim())
        ) {
            return;
        }
        if (active?.closest('[data-question-shortcuts]') && !root.contains(active)) {
            return;
        }
        setKeyboardFocus(true);
        const answers = Array.from(root.querySelectorAll<HTMLElement>('[data-question-answer]'));
        const saved = selectedAnswerRef.current ?? selectedOptions.current.get(questionKey);
        const target =
            (saved?.type === 'custom'
                ? customRowRef.current
                : answers.find((item) => item.dataset.questionAnswer === saved?.optionId)) ??
            answers[0];
        target?.focus({preventScroll: true});
    }, [questionKey]);
    const [draft, setDraft] = useState({questionKey, value: ''});
    const value = customAnswer ?? (draft.questionKey === questionKey ? draft.value : '');
    const hasValue = Boolean(value.trim());

    const submitCustom = () => {
        if (hasValue) {
            selectedOptions.current.set(questionKey, {type: 'custom', value: value.trim()});
            onAnswer({type: 'custom', value: value.trim()});
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat || event.isComposing) {
                return;
            }
            const root = rootRef.current;
            const target = event.target as HTMLElement;
            if (!root || !target.closest) {
                return;
            }
            const focusedCard = target.closest('[data-question-shortcuts]');
            const firstCard = Array.from(
                root.ownerDocument.querySelectorAll<HTMLElement>(
                    '[data-question-shortcuts="true"]',
                ),
            ).find((card) => !card.closest('[inert]') && card.getClientRects().length > 0);
            if (focusedCard ? focusedCard !== root : firstCard !== root) {
                return;
            }
            if (event.key === 'Escape' && onClose && root.contains(target)) {
                event.preventDefault();
                event.stopPropagation();
                onClose();
                return;
            }
            if (
                !showShortcuts ||
                [event.altKey, event.ctrlKey, event.metaKey].some(Boolean) ||
                target.closest(
                    'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
                )
            ) {
                return;
            }
            const index = Number(event.key) - 1;
            if (!/^[1-9]$/.test(event.key)) {
                return;
            }
            const option = options[index];
            if (option) {
                event.preventDefault();
                answerOption(option.id);
            } else if (allowCustomAnswer && index === options.length) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        const doc = rootRef.current?.ownerDocument;
        doc?.addEventListener('keydown', handleKeyDown);
        return () => doc?.removeEventListener('keydown', handleKeyDown);
    }, [allowCustomAnswer, answerOption, onClose, options, showShortcuts]);

    return (
        <div
            className={b({'keyboard-focus': keyboardFocus}, className)}
            data-qa={qa}
            role="group"
            aria-labelledby={titleId}
            ref={rootRef}
            data-question-shortcuts={showShortcuts}
            tabIndex={0}
            onPointerDown={() => setKeyboardFocus(false)}
            onKeyDown={(event) => {
                setKeyboardFocus(true);
                if (
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.nativeEvent.isComposing
                ) {
                    return;
                }
                const target = event.target as HTMLElement;
                if (target.closest('input, textarea, select, [contenteditable="true"]')) {
                    return;
                }
                const answers = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>('[data-question-answer]'),
                );
                const currentAnswer = target.closest<HTMLElement>('[data-question-answer]');
                const current = currentAnswer ? answers.indexOf(currentAnswer) : -1;
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const next =
                        current < 0
                            ? 0
                            : (current + (event.key === 'ArrowDown' ? 1 : -1) + answers.length) %
                              answers.length;
                    answers[next]?.focus({preventScroll: true});
                } else if (event.key === 'Enter' && target === customRowRef.current) {
                    event.preventDefault();
                    inputRef.current?.focus();
                }
            }}
        >
            <div ref={contentRef} className={b('body')}>
                <div className={b('header')}>
                    <div id={titleId} className={b('question')}>
                        {question}
                    </div>
                    <div className={b('actions')}>
                        <span className={b('tool-label')}>
                            <Icon data={CircleQuestion} size={16} />
                            {t('tool-name')}
                        </span>
                        {questionCount > 1 && (
                            <div className={b('navigation')}>
                                <ActionButton
                                    view="flat"
                                    size="m"
                                    aria-label={t('previous')}
                                    tooltipTitle={t('previous')}
                                    tooltipPlacement="top"
                                    disabled={!onQuestionChange || questionIndex <= 0}
                                    onClick={() => onQuestionChange?.(questionIndex - 1)}
                                >
                                    <Icon data={ChevronLeft} size={16} />
                                </ActionButton>
                                <span className={b('progress')} aria-live="polite">
                                    {t('progress', {
                                        current: questionIndex + 1,
                                        total: questionCount,
                                    })}
                                </span>
                                <ActionButton
                                    view="flat"
                                    size="m"
                                    aria-label={t('next')}
                                    tooltipTitle={t('next')}
                                    tooltipPlacement="top"
                                    disabled={
                                        !onQuestionChange || questionIndex >= questionCount - 1
                                    }
                                    onClick={() => onQuestionChange?.(questionIndex + 1)}
                                >
                                    <Icon data={ChevronRight} size={16} />
                                </ActionButton>
                            </div>
                        )}
                        {onClose && (
                            <Button className={b('skip')} view="normal" size="m" onClick={onClose}>
                                {t('skip')}
                            </Button>
                        )}
                    </div>
                </div>
                <div className={b('answers')}>
                    {options.map((option, index) => (
                        <button
                            key={option.id}
                            type="button"
                            className={b('option', {
                                selected:
                                    selectedAnswer?.type === 'option' &&
                                    selectedAnswer.optionId === option.id,
                            })}
                            aria-pressed={
                                selectedAnswer?.type === 'option' &&
                                selectedAnswer.optionId === option.id
                            }
                            data-question-answer={option.id}
                            onClick={() => answerOption(option.id)}
                        >
                            {showShortcuts && index < 9 && (
                                <span className={b('shortcut')} aria-hidden="true">
                                    <Hotkey className={b('hotkey')} value={String(index + 1)} />
                                </span>
                            )}
                            <span className={b('content')}>
                                <span className={b('title')}>
                                    <span>{option.title}</span>
                                    {option.recommended && (
                                        <Label size="xxs" theme="success">
                                            {t('recommended')}
                                        </Label>
                                    )}
                                </span>
                                {option.description && (
                                    <span className={b('description')}>{option.description}</span>
                                )}
                            </span>
                            <span className={b('trailing')} aria-hidden="true">
                                <Icon data={ChevronRight} size={16} />
                            </span>
                        </button>
                    ))}
                    {allowCustomAnswer && (
                        <div
                            className={b('custom', {
                                filled: hasValue,
                                selected: selectedAnswer?.type === 'custom',
                            })}
                            ref={customRowRef}
                            data-question-answer="custom"
                            role="group"
                            aria-label={customAnswerPlaceholder ?? t('placeholder')}
                            tabIndex={-1}
                        >
                            {showShortcuts && options.length < 9 && (
                                <span className={b('shortcut')} aria-hidden="true">
                                    <Hotkey
                                        className={b('hotkey')}
                                        value={String(options.length + 1)}
                                    />
                                </span>
                            )}
                            <TextInput
                                controlRef={inputRef}
                                view="clear"
                                size="m"
                                className={b('input')}
                                value={value}
                                placeholder={customAnswerPlaceholder ?? t('placeholder')}
                                controlProps={{
                                    'aria-label': customAnswerPlaceholder ?? t('placeholder'),
                                }}
                                onUpdate={(nextValue) => {
                                    setDraft({questionKey, value: nextValue});
                                    onCustomAnswerChange?.(nextValue);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                                        event.preventDefault();
                                        submitCustom();
                                    }
                                }}
                            />
                            {hasValue && (
                                <Button view="normal" size="m" onClick={submitCustom}>
                                    {t('confirm')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {footer && <div className={b('footer')}>{footer}</div>}
                {answeredQuestionIndices && questionCount > 1 && (
                    <div
                        className={b('progress-track')}
                        ref={progressRef}
                        role="progressbar"
                        aria-label={t('answered-progress')}
                        aria-valuemin={0}
                        aria-valuemax={questionCount}
                        aria-valuenow={answered.size}
                        aria-valuetext={t('answered-count', {
                            count: answered.size,
                            total: questionCount,
                        })}
                    >
                        {Array.from({length: questionCount}, (_, index) => (
                            <span
                                key={index}
                                className={b('progress-segment', {
                                    answered: answered.has(index),
                                })}
                            >
                                <span className={b('progress-fill')} />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
