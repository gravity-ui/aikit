import {type Ref, useImperativeHandle, useRef} from 'react';

import {useForkRef} from '@gravity-ui/uikit';

import {ChatStatus, type PromptCommandsConfig, TSubmitData} from '../../../types';

import {PromptInputCommands} from './PromptInputCommands';
import {PromptInputFull} from './PromptInputFull';
import {PromptInputSimple} from './PromptInputSimple';
import {PromptInputWithPanels} from './PromptInputWithPanels';
import {PromptInputWithSuggestions} from './PromptInputWithSuggestions';
import {i18n} from './i18n';
import {
    PromptInputBodyConfig,
    PromptInputFooterConfig,
    PromptInputHeaderConfig,
    PromptInputPanelConfig,
    PromptInputSuggestionsConfig,
} from './types';
import {usePromptCommands} from './usePromptCommands';
import {usePromptInput} from './usePromptInput';

import './PromptInput.scss';

/**
 * Props for the PromptInput component
 */
export type PromptInputHandle = {
    submit: (data?: TSubmitData) => Promise<void>;
    clearFailedDraft: () => boolean;
};

export type PromptInputProps = {
    /** Programmatic submission uses the same draft lifecycle as the send button. */
    apiRef?: Ref<PromptInputHandle>;
    /** Application-defined commands and context sources. */
    commands?: PromptCommandsConfig;
    /** Resets uncontrolled command selections and search without changing focus. */
    commandsResetKey?: string | number;
    /** View variant: 'full' with all features, 'simple' with minimal UI */
    view?: 'full' | 'simple';
    /** Callback when message is sent */
    onSend: (data: TSubmitData) => Promise<void | false>;
    /** Callback when sending is cancelled */
    onCancel?: () => Promise<void>;
    /** Initial value */
    initialValue?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Chat status to determine input behavior */
    status?: ChatStatus;
    /** Maximum length of input */
    maxLength?: number;
    /** Called whenever PromptInput changes its internal value. */
    onValueChange?: (value: string) => void;
    /** Header-related props */
    headerProps?: PromptInputHeaderConfig;
    /** Body/textarea-related props */
    bodyProps?: PromptInputBodyConfig;
    /** Footer-related props */
    footerProps?: PromptInputFooterConfig;
    /** Suggestions-related props */
    suggestionsProps?: PromptInputSuggestionsConfig;
    /** Top panel configuration */
    topPanel?: PromptInputPanelConfig;
    /** Bottom panel configuration */
    bottomPanel?: PromptInputPanelConfig;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInput component - a flexible input component for chat interfaces
 * with support for simple and full views, attachments, suggestions, and expandable panels
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInput(props: PromptInputProps) {
    const {
        apiRef,
        commands: commandsConfig,
        commandsResetKey,
        view = 'simple',
        onSend,
        onCancel,
        initialValue,
        disabled = false,
        status = 'ready',
        maxLength,
        onValueChange,
        headerProps,
        bodyProps,
        footerProps,
        suggestionsProps,
        topPanel,
        bottomPanel,
        className,
        qa,
    } = props;

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const mergedInputRef = useForkRef(inputRef, bodyProps?.inputRef);
    const commandsRef = useRef<ReturnType<typeof usePromptCommands> | null>(null);
    const submittedSelections = useRef<ReturnType<typeof usePromptCommands>['selections']>([]);
    const hookState = usePromptInput({
        resetKey: commandsResetKey,
        captureSubmission: () => {
            const snapshot = commandsRef.current?.captureSubmission();
            submittedSelections.current = snapshot?.selections ?? [];
            return snapshot ?? {restore: () => {}, clear: () => {}, hasChanged: () => false};
        },
        onSend: (data) =>
            onSend({
                ...data,
                ...(submittedSelections.current.length && {
                    selections: [...submittedSelections.current],
                }),
            }),
        onCancel,
        initialValue,
        disabled,
        status,
        maxLength,
        onValueChange,
    });

    useImperativeHandle(apiRef, () => ({
        submit: hookState.submit,
        clearFailedDraft: hookState.clearFailedDraft,
    }));

    const commandsDisabled =
        disabled || hookState.isInputDisabled || Boolean(bodyProps?.disabledInput);
    const commands = usePromptCommands({
        config: commandsConfig,
        resetKey: commandsResetKey,
        value: hookState.value,
        onChange: hookState.handleChange,
        inputRef,
        disabled: commandsDisabled,
        maxLength,
    });
    commandsRef.current = commands;
    const inputBodyProps = {
        ...bodyProps,
        inputRef: mergedInputRef,
        controlProps: {
            ...bodyProps?.controlProps,
            ...(commandsConfig && {
                role: 'combobox',
                'aria-expanded': commands.open && commands.session?.origin === 'input',
                'aria-controls': commands.open ? commands.listId : undefined,
                'aria-autocomplete': 'list' as const,
                'aria-activedescendant':
                    commands.open && commands.items[commands.activeIndex]
                        ? `${commands.listId}-${commands.activeIndex}`
                        : undefined,
                onSelect: (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
                    bodyProps?.controlProps?.onSelect?.(event);
                    const input = event.currentTarget;
                    commands.detect(input.value, input.selectionStart, input.selectionEnd);
                },
            }),
        },
    };
    const commandHookState = {
        ...hookState,
        isInputDisabled: commandsDisabled,
        handleChange: (value: string) => {
            if (maxLength !== undefined && value.length > maxLength) return;
            hookState.handleChange(value);
            const input = inputRef.current;
            if (input) commands.detect(value, input.selectionStart, input.selectionEnd, true);
        },
        handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (!commands.handleKeyDown(event)) hookState.handleKeyDown(event);
        },
    };
    const commandsContent = (
        <>
            {commandsConfig && (
                <PromptInputCommands
                    commands={commands}
                    config={commandsConfig}
                    inputRef={inputRef}
                    disabled={commandsDisabled}
                />
            )}
            {hookState.sendError && <div role="alert">{i18n('send-error')}</div>}
        </>
    );

    // Handle suggestion click with custom handler or default to input change
    const handleSuggestionClick = (
        content: string,
        id?: string,
        data?: Record<string, unknown>,
    ) => {
        if (suggestionsProps?.onSuggestionClick) {
            suggestionsProps.onSuggestionClick(content, id, data);
        } else {
            hookState.handleChange(content);
        }
    };

    const isFullView = view === 'full';

    // Prepare suggestions props with wrapped handler
    const wrappedSuggestionsProps = suggestionsProps
        ? {
              ...suggestionsProps,
              onSuggestionClick: handleSuggestionClick,
          }
        : undefined;

    return (
        <PromptInputWithSuggestions suggestionsProps={wrappedSuggestionsProps}>
            <PromptInputWithPanels topPanel={topPanel} bottomPanel={bottomPanel}>
                {isFullView ? (
                    <PromptInputFull
                        hookState={commandHookState}
                        commandsContent={commandsContent}
                        headerProps={headerProps}
                        bodyProps={inputBodyProps}
                        footerProps={footerProps}
                        className={className}
                        qa={qa}
                    />
                ) : (
                    <PromptInputSimple
                        hookState={commandHookState}
                        commandsContent={commandsContent}
                        bodyProps={inputBodyProps}
                        footerProps={footerProps}
                        className={className}
                        qa={qa}
                    />
                )}
            </PromptInputWithPanels>
        </PromptInputWithSuggestions>
    );
}
