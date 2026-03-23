import {useState} from 'react';

import {Button, Text, TextArea} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './FeedbackForm.scss';

const b = block('feedback-form');

export interface FeedbackOption {
    /** Unique identifier for the option */
    id: string;
    /** Display label for the option */
    label: string;
}

export interface FeedbackFormProps {
    /** Array of reason options to display as selectable chips */
    options: FeedbackOption[];
    /** Callback when form is submitted with selected reasons and comment */
    onSubmit: (reasons: string[], comment: string) => void;
    /** Label text for reasons section */
    reasonsLabel?: string;
    /** Label text for comment field */
    commentLabel?: string;
    /** Placeholder text for comment field */
    commentPlaceholder?: string;
    /** Whether to show the comment textarea (default: true) */
    showComment?: boolean;
    /** Text for submit button */
    submitLabel?: string;
    /** Disable form interaction */
    disabled?: boolean;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}

/**
 * FeedbackForm - Reusable feedback form with reason selection and comment field
 *
 * This component provides a user-friendly way to collect feedback with multiple
 * selectable reasons (rendered as chips) and an optional comment field.
 * Can be used standalone or inside ActionPopup.
 *
 * @returns React element with feedback form
 */
export function FeedbackForm({
    options,
    onSubmit,
    reasonsLabel,
    commentLabel,
    commentPlaceholder,
    showComment = true,
    submitLabel,
    disabled = false,
    className,
    qa,
}: FeedbackFormProps) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [comment, setComment] = useState('');

    const handleReasonToggle = (reasonId: string) => {
        setSelectedReasons((prev) =>
            prev.includes(reasonId) ? prev.filter((id) => id !== reasonId) : [...prev, reasonId],
        );
    };

    const handleSubmit = () => {
        onSubmit(selectedReasons, comment);
        setSelectedReasons([]);
        setComment('');
    };

    const isReasonSelected = (reasonId: string) => selectedReasons.includes(reasonId);

    // Submit button is disabled if no reason selected AND no comment provided (when comment is shown)
    const isSubmitDisabled =
        disabled || (selectedReasons.length === 0 && (!showComment || comment.trim() === ''));

    const displayCommentPlaceholder = commentPlaceholder || i18n('comment-placeholder');
    const displaySubmitLabel = submitLabel || i18n('submit');

    return (
        <div className={b(null, className)} data-qa={qa}>
            {reasonsLabel && (
                <Text variant="subheader-2" data-qa={qa ? `${qa}-reasons-label` : undefined}>
                    {reasonsLabel}
                </Text>
            )}
            <div className={b('reasons')} data-qa={qa ? `${qa}-reasons` : undefined}>
                {options.map((option) => {
                    const selected = isReasonSelected(option.id);
                    return (
                        <Button
                            key={option.id}
                            view="normal"
                            size="m"
                            selected={selected}
                            onClick={() => handleReasonToggle(option.id)}
                            className={b('reason-chip', {selected})}
                            data-qa={qa ? `${qa}-reason-${option.id}` : undefined}
                            disabled={disabled}
                        >
                            {option.label}
                        </Button>
                    );
                })}
            </div>

            {showComment && (
                <>
                    {commentLabel && (
                        <Text
                            variant="subheader-2"
                            data-qa={qa ? `${qa}-comment-label` : undefined}
                        >
                            {commentLabel}
                        </Text>
                    )}
                    <TextArea
                        value={comment}
                        onUpdate={setComment}
                        placeholder={displayCommentPlaceholder}
                        rows={2}
                        className={b('comment')}
                        disabled={disabled}
                        qa={qa ? `${qa}-comment` : undefined}
                    />
                </>
            )}

            <Button
                view="action"
                size="l"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={b('submit')}
                qa={qa ? `${qa}-submit` : undefined}
            >
                {displaySubmitLabel}
            </Button>
        </div>
    );
}
