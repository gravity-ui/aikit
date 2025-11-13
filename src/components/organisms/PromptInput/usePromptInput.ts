import {useCallback, useState} from 'react';

import {TSubmitData} from '../../../types';

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
    /** Is streaming state */
    isStreaming?: boolean;
};

/**
 * Hook return type for PromptInput state management
 */
export type UsePromptInputReturn = {
    /** Current input value */
    value: string;
    /** Set the input value */
    setValue: (value: string) => void;
    /** Is currently sending */
    isSending: boolean;
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
        isStreaming = false,
    } = props;

    const [value, setValue] = useState(initialValue);
    const [isSending, setIsSending] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

    const trimmedValue = value.trim();
    const canSubmit = !disabled && !isSending && trimmedValue.length > 0;

    // Determine submit button state
    let submitButtonState: 'enabled' | 'disabled' | 'loading' | 'cancelable' = 'disabled';
    if (disabled || !trimmedValue) {
        submitButtonState = 'disabled';
    } else if (isSending) {
        submitButtonState = 'loading';
    } else if (isStreaming && onCancel) {
        submitButtonState = 'cancelable';
    } else {
        submitButtonState = 'enabled';
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

        setIsSending(true);

        try {
            const submitData: TSubmitData = {
                content: trimmedValue,
                ...(attachments.length > 0 && {attachments}),
            };

            await onSend(submitData);
            setValue('');
            setAttachments([]);
        } finally {
            setIsSending(false);
        }
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
        isSending,
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
