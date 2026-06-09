import {useEffect, useRef} from 'react';

import type {TChatMessage, TMessageContent} from '../types/messages';
import type {TToolStatus} from '../types/tool';
import {
    type ToolExecutionStatus,
    type ToolPartContent,
    type ToolPartContentData,
} from '../utils/toolset';

export type ToolSettledEvent<TCustom extends TMessageContent = never> = {
    toolCallId: string;
    toolName: string;
    status: ToolExecutionStatus;
    messages: TChatMessage<TCustom>[];
};

export type UseToolResultContinuationOptions<TCustom extends TMessageContent = never> = {
    messages: TChatMessage<TCustom>[];
    /**
     * Called once per tool that transitioned from a pending status
     * (`waitingConfirmation`, `waitingSubmission`, `loading`) to a terminal
     * one (`success`, `error`, `cancelled`). Typical use: forward the
     * updated transcript to the model.
     */
    onSettled: (event: ToolSettledEvent<TCustom>) => void;
};

const PENDING_STATUSES: ReadonlySet<TToolStatus> = new Set<TToolStatus>([
    'waitingConfirmation',
    'waitingSubmission',
    'loading',
]);

const TERMINAL_STATUSES: ReadonlySet<TToolStatus> = new Set<TToolStatus>([
    'success',
    'error',
    'cancelled',
]);

function isPending(status: TToolStatus | undefined): boolean {
    return status !== undefined && PENDING_STATUSES.has(status);
}

function isTerminal(status: TToolStatus | undefined): status is ToolExecutionStatus {
    return status !== undefined && TERMINAL_STATUSES.has(status);
}

function isToolPartContent(part: TMessageContent): part is ToolPartContent {
    return (
        part.type === 'tool' &&
        typeof part.data === 'object' &&
        part.data !== null &&
        'toolCallId' in part.data
    );
}

function toContentParts<TCustom extends TMessageContent>(
    content: TChatMessage<TCustom>['content'],
): TMessageContent[] {
    if (typeof content === 'string') return [];
    return Array.isArray(content) ? content : [content];
}

function collectToolPartsByCallId<TCustom extends TMessageContent>(
    messages: TChatMessage<TCustom>[],
): Map<string, ToolPartContentData> {
    const map = new Map<string, ToolPartContentData>();
    for (const msg of messages) {
        if (msg.role !== 'assistant') continue;
        for (const part of toContentParts(msg.content)) {
            if (!part || typeof part !== 'object') continue;
            if (!isToolPartContent(part)) continue;
            map.set(part.data.toolCallId, part.data);
        }
    }
    return map;
}

/**
 * Pure: returns events for every tool whose status was pending in `prev`
 * and is terminal in `next`. Tools that are already terminal in `prev`
 * (replay/restore) do not produce events.
 */
export function findNewlySettledTools<TCustom extends TMessageContent = never>(
    prev: TChatMessage<TCustom>[],
    next: TChatMessage<TCustom>[],
): ToolSettledEvent<TCustom>[] {
    const prevParts = collectToolPartsByCallId(prev);
    const events: ToolSettledEvent<TCustom>[] = [];
    for (const [toolCallId, data] of collectToolPartsByCallId(next)) {
        const prevStatus = prevParts.get(toolCallId)?.status;
        if (isPending(prevStatus) && isTerminal(data.status)) {
            events.push({
                toolCallId,
                toolName: data.toolName,
                status: data.status,
                messages: next,
            });
        }
    }
    return events;
}

/**
 * Observe `messages` and fire `onSettled` once whenever a tool part
 * transitions from pending to terminal. Tools already terminal on the
 * first observed snapshot do not fire — replay/restore is intentionally
 * silent. Pair with `useToolset` to forward results to the model.
 */
export function useToolResultContinuation<TCustom extends TMessageContent = never>(
    options: UseToolResultContinuationOptions<TCustom>,
): void {
    const {messages, onSettled} = options;

    const onSettledRef = useRef(onSettled);
    useEffect(() => {
        onSettledRef.current = onSettled;
    });

    const prevMessagesRef = useRef(messages);

    useEffect(() => {
        const events = findNewlySettledTools(prevMessagesRef.current, messages);
        prevMessagesRef.current = messages;
        for (const event of events) {
            onSettledRef.current(event);
        }
    }, [messages]);
}
