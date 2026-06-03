import {useCallback, useEffect, useMemo, useRef} from 'react';
import type {Dispatch, SetStateAction} from 'react';

import type {TChatMessage, TMessageContent} from '../types/messages';
import type {MessageRendererRegistry} from '../utils/messageTypeRegistry';
import {
    type Toolset,
    type ToolsetResultEvent,
    applyToolResult,
    createToolsetRenderer,
} from '../utils/toolset';

export type UseToolsetOptions<TCustom extends TMessageContent = never> = {
    toolset: Toolset;
    setMessages: Dispatch<SetStateAction<TChatMessage<TCustom>[]>>;
    /**
     * Called after the tool result has been merged into history.
     * Typical use: forward the updated transcript to the model.
     */
    onAfterResult?: (messages: TChatMessage<TCustom>[]) => void;
    /** Existing registry to extend instead of starting from a fresh one. */
    registry?: MessageRendererRegistry;
};

export type UseToolsetReturn = {
    messageRendererRegistry: MessageRendererRegistry;
    handleToolResult: (event: ToolsetResultEvent) => void;
};

/**
 * Wire a toolset into the chat: returns a `MessageRendererRegistry` that
 * renders tool parts via the toolset and a `handleToolResult` callback that
 * merges results into history and notifies via `onAfterResult`.
 *
 * Pass the same `toolset` reference across renders (e.g. via `useMemo` or
 * `createToolset`) so the registry stays stable.
 */
export function useToolset<TCustom extends TMessageContent = never>(
    options: UseToolsetOptions<TCustom>,
): UseToolsetReturn {
    const {toolset, setMessages, onAfterResult, registry} = options;

    const onAfterResultRef = useRef(onAfterResult);
    // Mirror the latest onAfterResult into a ref every render so the
    // registry memo below doesn't need to depend on it (which would
    // rebuild the registry on every parent rerender).
    useEffect(() => {
        onAfterResultRef.current = onAfterResult;
    });

    const handleToolResult = useCallback(
        (event: ToolsetResultEvent) => {
            setMessages((prev) => {
                const updated = applyToolResult(prev, event);
                if (updated !== prev) {
                    // Defer to a microtask: never call onAfterResult while
                    // React is still inside the setState reducer. Re-entrant
                    // setState is illegal in concurrent mode.
                    queueMicrotask(() => onAfterResultRef.current?.(updated));
                }
                return updated;
            });
        },
        [setMessages],
    );

    const messageRendererRegistry = useMemo(
        () =>
            createToolsetRenderer(toolset, {
                onToolResult: handleToolResult,
                registry,
            }),
        [toolset, handleToolResult, registry],
    );

    return {messageRendererRegistry, handleToolResult};
}
