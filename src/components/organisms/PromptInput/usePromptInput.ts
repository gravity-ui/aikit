import {useCallback, useState} from 'react';

import {ChatStatus, TSubmitData} from '../../../types';

/**
 * Hook props for managing PromptInput state
 */
export type UsePromptInputProps = {
    /** Callback when message is sent */
    onSend: (data: TSubmitData) => Promise<void>;
    /** Callback when sending is cancelled */
    onCancel?: () => Promise<void>;
    /** Initial value */
    initialValue?: string;
    /** Maximum length of input */
    maxLength?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Chat status to determine input behavior */
    status?: ChatStatus;
};

/**
 * Hook return type for PromptInput state management
 */
export type UsePromptInputReturn = {
    /** Current input value */
    value: string;
    /** Set the input value */
    setValue: (value: string) => void;
    /** Can submit the form */
    canSubmit: boolean;
    /** Submit button state */
    submitButtonState: 'enabled' | 'disabled' | 'loading' | 'cancelable';
    /** Is input disabled (when loading) */
    isInputDisabled: boolean;
    /** Handle input change */
    handleChange: (value: string) => void;
    /** Handle key down */
    handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    /** Handle submit */
    handleSubmit: () => Promise<void>;
    /** Attachments */
    attachments: File[];
    /** Set attachments */
    setAttachments: (files: File[]) => void;
};

/**
 * Custom hook for managing PromptInput state and behavior
 *
 * @param props - Hook props
 * @returns Hook return value with state and handlers
 */
export function usePromptInput(props: UsePromptInputProps): UsePromptInputReturn {
    const {
        onSend,
        onCancel,
        initialValue = '',
        maxLength,
        disabled = false,
        status = 'ready',
    } = props;

    const [value, setValue] = useState(initialValue);
    const [attachments, setAttachments] = useState<File[]>([]);
    const isSubmitted = status === 'submitted';

    const trimmedValue = value.trim();
    const canSubmit = !disabled && !isSubmitted && trimmedValue.length > 0;

    // Map ChatStatus to submit button state
    // ChatStatus.ready → submitButtonState.enabled
    // ChatStatus.error → submitButtonState.enabled
    // ChatStatus.streaming → submitButtonState.cancelable
    // ChatStatus.streaming_loading → submitButtonState.cancelable (same as streaming)
    // ChatStatus.submitted → submitButtonState.loading
    let submitButtonState: 'enabled' | 'disabled' | 'loading' | 'cancelable' = 'disabled';

    // disabled by props or empty value and status is ready
    if (disabled) {
        submitButtonState = 'disabled';
    } else if (!trimmedValue && (status === 'ready' || status === 'error')) {
        submitButtonState = 'disabled';
    } else {
        switch (status) {
            case 'ready':
            case 'error':
                submitButtonState = 'enabled';
                break;
            case 'streaming':
            case 'streaming_loading':
                submitButtonState = onCancel ? 'cancelable' : 'enabled';
                break;
            case 'submitted':
                submitButtonState = 'loading';
                break;
            default:
                submitButtonState = 'enabled';
        }
    }

    // Input is disabled when loading
    const isInputDisabled = submitButtonState === 'loading';

    const handleChange = useCallback(
        (newValue: string) => {
            if (maxLength && newValue.length > maxLength) {
                return;
            }
            setValue(newValue);
        },
        [maxLength],
    );

    const handleSubmit = useCallback(async () => {
        if (submitButtonState === 'cancelable' && onCancel) {
            await onCancel();
            return;
        }

        if (!canSubmit) {
            return;
        }

        const submitData: TSubmitData = {
            content: trimmedValue,
            ...(attachments.length > 0 && {attachments}),
        };

        onSend(submitData);
        setValue('');
        setAttachments([]);
    }, [submitButtonState, canSubmit, trimmedValue, attachments, onSend, onCancel]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const isEnter = event.code === 'Enter' || event.code === 'NumpadEnter';

            // Insert new line on Ctrl/Cmd + Enter
            if (isEnter && (event.ctrlKey || event.metaKey)) {
                setValue((prev) => prev + '\n');
                event.preventDefault();
                return;
            }

            // Prevent submission if can't submit
            if (isEnter && !event.shiftKey && !canSubmit) {
                event.preventDefault();
                return;
            }

            // Submit on Enter (without Shift)
            if (isEnter && !event.shiftKey && canSubmit) {
                event.preventDefault();
                handleSubmit();
            }
        },
        [canSubmit, handleSubmit],
    );

    return {
        value,
        setValue,
        canSubmit,
        submitButtonState,
        isInputDisabled,
        handleChange,
        handleKeyDown,
        handleSubmit,
        attachments,
        setAttachments,
    };
}
