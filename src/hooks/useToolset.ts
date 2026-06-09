import {useCallback, useMemo} from 'react';
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
    /** Existing registry to extend instead of starting from a fresh one. */
    registry?: MessageRendererRegistry;
};

export type UseToolsetReturn = {
    messageRendererRegistry: MessageRendererRegistry;
    handleToolResult: (event: ToolsetResultEvent) => void;
};

/**
 * Wire a toolset into the chat: returns a `MessageRendererRegistry` that
 * renders tool parts via the toolset and a `handleToolResult` callback
 * that merges results into history. To react to tool completion (e.g.
 * forward to the model), pair with `useToolResultContinuation`.
 *
 * Pass the same `toolset` reference across renders (e.g. via `useMemo` or
 * `createToolset`) so the registry stays stable.
 */
export function useToolset<TCustom extends TMessageContent = never>(
    options: UseToolsetOptions<TCustom>,
): UseToolsetReturn {
    const {toolset, setMessages, registry} = options;

    const handleToolResult = useCallback(
        (event: ToolsetResultEvent) => {
            setMessages((prev) => applyToolResult(prev, event));
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
