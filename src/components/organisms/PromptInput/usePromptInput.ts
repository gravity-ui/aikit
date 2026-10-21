import {useCallback, useEffect, useRef, useState} from 'react';

import {ChatStatus, TSubmitData} from '../../../types';

/**
 * Hook props for managing PromptInput state
 */
export type UsePromptInputProps = {
    /** Callback when message is sent */
    onSend: (data: TSubmitData) => Promise<void | false>;
    resetKey?: string | number;
    captureSubmission?: () => {restore: () => void; hasChanged: () => boolean; clear: () => void};
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
    /** Called whenever the hook changes its internal value. */
    onValueChange?: (value: string) => void;
};

/**
 * Hook return type for PromptInput state management
 */
export type UsePromptInputReturn = {
    sendError?: boolean;
    /** Current input value */
    value: string;
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
    submit: (data?: TSubmitData) => Promise<void>;
    clearFailedDraft: () => boolean;
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
        onValueChange,
        resetKey,
        captureSubmission,
    } = props;

    const [value, setValue] = useState(initialValue);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(false);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const revision = useRef(0);
    const inFlight = useRef(false);
    const [attachments, updateAttachments] = useState<File[]>([]);
    const setAttachments = useCallback((files: File[]) => {
        revision.current++;
        updateAttachments(files);
    }, []);
    const failedDraft = useRef<(() => boolean) | null>(null);
    useEffect(() => {
        revision.current++;
        failedDraft.current = null;
    }, [resetKey]);

    const updateValue = useCallback(
        (nextValue: string) => {
            revision.current++;
            setSendError(false);
            setValue(nextValue);
            onValueChange?.(nextValue);
        },
        [onValueChange],
    );
    const isSubmitted = status === 'submitted' || sending;

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
    if (sending && submitButtonState !== 'cancelable') submitButtonState = 'loading';
    const isInputDisabled = submitButtonState === 'loading';

    const handleChange = useCallback(
        (newValue: string) => {
            if (maxLength && newValue.length > maxLength) {
                return;
            }
            updateValue(newValue);
        },
        [maxLength, updateValue],
    );

    const submit = useCallback(
        async (override?: TSubmitData) => {
            const content = override?.content.trim() ?? trimmedValue;
            if (disabled || isSubmitted || inFlight.current || !content) return;
            const draftValue = value;
            const submitData: TSubmitData = {
                ...override,
                content,
                ...(attachments.length > 0 && {attachments}),
            };
            inFlight.current = true;
            setSending(true);
            setSendError(false);
            failedDraft.current = null;
            const selectionSnapshot = captureSubmission?.();
            updateValue('');
            updateAttachments([]);
            const clearedRevision = revision.current;
            const restore = () => {
                if (
                    !mounted.current ||
                    revision.current !== clearedRevision ||
                    selectionSnapshot?.hasChanged()
                )
                    return;
                updateValue(draftValue);
                updateAttachments(attachments);
                selectionSnapshot?.restore();
                const restoredRevision = revision.current;
                failedDraft.current = () => {
                    if (
                        !mounted.current ||
                        revision.current !== restoredRevision ||
                        selectionSnapshot?.hasChanged()
                    )
                        return false;
                    updateValue('');
                    updateAttachments([]);
                    selectionSnapshot?.clear();
                    return true;
                };
                return true;
            };
            try {
                const result = await onSend(submitData);
                if (result === false) restore();
            } catch {
                if (restore()) setSendError(true);
            } finally {
                inFlight.current = false;
                if (mounted.current) setSending(false);
            }
        },
        [
            disabled,
            isSubmitted,
            trimmedValue,
            value,
            attachments,
            onSend,
            updateValue,
            captureSubmission,
        ],
    );

    const clearFailedDraft = useCallback(() => {
        const clear = failedDraft.current;
        failedDraft.current = null;
        return clear?.() ?? false;
    }, []);

    const handleSubmit = useCallback(async () => {
        if (submitButtonState === 'cancelable' && onCancel) {
            await onCancel();
            return;
        }
        await submit();
    }, [submitButtonState, onCancel, submit]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.nativeEvent.isComposing || event.defaultPrevented) return;
            const isEnter = event.code === 'Enter' || event.code === 'NumpadEnter';

            // Insert new line on Ctrl/Cmd + Enter
            if (isEnter && (event.ctrlKey || event.metaKey)) {
                updateValue(`${value}\n`);
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
        [canSubmit, handleSubmit, updateValue, value],
    );

    return {
        value,
        sendError,
        canSubmit,
        submitButtonState,
        isInputDisabled,
        handleChange,
        handleKeyDown,
        handleSubmit,
        submit,
        clearFailedDraft,
        attachments,
        setAttachments,
    };
}
