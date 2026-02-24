import type {TToolStatus} from '../../../types';
import {OpenAIStreamEventLike, OpenAIStreamOutputItemLike} from '../types/openAiTypes';

import {getTextDeltaFromStreamEvent} from './getTextDeltaFromStreamEvent';

type EventRecord = Record<string, unknown>;

export type StreamEventTextDelta = {kind: 'text_delta'; delta: string};
export type StreamEventToolAdd = {
    kind: 'tool_add';
    id: string;
    toolName: string;
    serverLabel?: string;
    /** Initial status; use 'waitingConfirmation' for mcp_approval_request, 'waitingSubmission' if API defines such. Default 'loading'. */
    status?: TToolStatus;
    /** Optional payload to show in tool card (e.g. approval request arguments). */
    headerContent?: string;
};
export type StreamEventToolUpdate = {
    kind: 'tool_update';
    item_id: string;
    status: TToolStatus;
    toolName?: string;
    output?: string;
    error?: string;
};
export type StreamEventThinkingAdd = {kind: 'thinking_add'; item_id: string};
export type StreamEventThinkingDelta = {kind: 'thinking_delta'; item_id: string; delta: string};
export type StreamEventThinkingDone = {kind: 'thinking_done'; item_id: string; text: string};
export type StreamEventContentUpdate =
    | StreamEventTextDelta
    | StreamEventToolAdd
    | StreamEventToolUpdate
    | StreamEventThinkingAdd
    | StreamEventThinkingDelta
    | StreamEventThinkingDone;

const TOOL_PROGRESS_EVENTS: Array<[string, TToolStatus]> = [
    ['response.file_search_call.completed', 'success'],
    ['response.file_search_call.in_progress', 'loading'],
    ['response.file_search_call.searching', 'loading'],
    ['response.web_search_call.completed', 'success'],
    ['response.web_search_call.in_progress', 'loading'],
    ['response.web_search_call.searching', 'loading'],
    ['response.code_interpreter_call.completed', 'success'],
    ['response.code_interpreter_call.in_progress', 'loading'],
    ['response.code_interpreter_call.interpreting', 'loading'],
    ['response.image_generation_call.completed', 'success'],
    ['response.image_generation_call.in_progress', 'loading'],
    ['response.image_generation_call.generating', 'loading'],
    ['response.mcp_list_tools.completed', 'success'],
    ['response.mcp_list_tools.in_progress', 'loading'],
];

function getReasoningUpdate(
    e: EventRecord,
    data: EventRecord | undefined,
    type: unknown,
    itemId: string,
): StreamEventContentUpdate | null {
    if (
        type === 'response.reasoning_text.delta' ||
        type === 'response.reasoning_summary_text.delta'
    ) {
        const d = (e.delta ?? data?.delta) as string | undefined;
        return typeof d === 'string' ? {kind: 'thinking_delta', item_id: itemId, delta: d} : null;
    }
    if (
        type === 'response.reasoning_text.done' ||
        type === 'response.reasoning_summary_text.done'
    ) {
        const text = (e.text ?? data?.text) as string | undefined;
        return typeof text === 'string' ? {kind: 'thinking_done', item_id: itemId, text} : null;
    }
    return null;
}

function addUpdateForReasoning(
    id: string,
    itemId: string | undefined,
): StreamEventContentUpdate | null {
    const effectiveId = id || (itemId ?? '');
    return effectiveId ? {kind: 'thinking_add', item_id: effectiveId} : null;
}

function addUpdateForMcpCall(
    item: OpenAIStreamOutputItemLike,
    id: string,
): StreamEventContentUpdate | null {
    const name = typeof item.name === 'string' ? item.name : undefined;
    const serverLabel = typeof item.server_label === 'string' ? item.server_label : undefined;
    return {
        kind: 'tool_add',
        id,
        toolName: name ?? serverLabel ?? 'MCP',
        serverLabel,
    };
}

function addUpdateForFunctionCall(
    item: OpenAIStreamOutputItemLike,
): StreamEventContentUpdate | null {
    const callId = typeof item.call_id === 'string' ? item.call_id : ((item.id as string) ?? '');
    const name = typeof item.name === 'string' ? item.name : 'Tool';
    return {kind: 'tool_add', id: callId, toolName: name};
}

function addUpdateForMcpRequest(
    item: OpenAIStreamOutputItemLike,
    id: string,
    status: 'waitingConfirmation' | 'waitingSubmission',
): StreamEventContentUpdate | null {
    const name = typeof item.name === 'string' ? item.name : undefined;
    const serverLabel = typeof item.server_label === 'string' ? item.server_label : undefined;
    const args = typeof item.arguments === 'string' ? item.arguments : undefined;
    return {
        kind: 'tool_add',
        id,
        toolName: name ?? serverLabel ?? 'MCP',
        serverLabel,
        status,
        headerContent: args,
    };
}

function addUpdateForSimpleTool(id: string, toolName: string): StreamEventContentUpdate | null {
    return id ? {kind: 'tool_add', id, toolName} : null;
}

const OUTPUT_ITEM_TYPE_TO_TOOL_NAME: Record<string, string> = {
    file_search_call: 'File Search',
    web_search_call: 'Web Search',
    code_interpreter_call: 'Code Interpreter',
    image_generation_call: 'Image Generation',
    mcp_list_tools: 'MCP List Tools',
};

function getUpdateFromOutputItemAdded(
    e: EventRecord,
    data: EventRecord | undefined,
    itemId: string | undefined,
): StreamEventContentUpdate | null {
    const item = (e.item ?? (data?.item as OpenAIStreamOutputItemLike)) as
        | OpenAIStreamOutputItemLike
        | undefined;
    if (!item) return null;
    const id = typeof item.id === 'string' ? item.id : '';

    if (item.type === 'reasoning') return addUpdateForReasoning(id, itemId);
    if (item.type === 'mcp_call') return addUpdateForMcpCall(item, id);
    if (item.type === 'function_call') return addUpdateForFunctionCall(item);
    if (item.type === 'mcp_approval_request')
        return addUpdateForMcpRequest(item, id, 'waitingConfirmation');
    if (item.type === 'mcp_submission_request')
        return addUpdateForMcpRequest(item, id, 'waitingSubmission');

    const toolName = item.type ? OUTPUT_ITEM_TYPE_TO_TOOL_NAME[item.type] : undefined;
    if (toolName) return addUpdateForSimpleTool(id, toolName);

    return null;
}

function getReasoningDoneUpdate(item: OpenAIStreamOutputItemLike): StreamEventContentUpdate | null {
    if (item.type !== 'reasoning' || typeof item.id !== 'string') return null;
    const reasoning = item as {
        id: string;
        content?: Array<{type: string; text?: string}>;
        summary?: Array<{type: string; text?: string}>;
    };
    const texts =
        reasoning.content?.map((c) => c.text).filter((t): t is string => typeof t === 'string') ??
        reasoning.summary?.map((s) => s.text).filter((t): t is string => typeof t === 'string') ??
        [];
    const text = texts.length <= 1 ? (texts[0] ?? '') : texts.join('\n\n');
    return {kind: 'thinking_done', item_id: reasoning.id, text};
}

function getMcpCallDoneUpdate(item: OpenAIStreamOutputItemLike): StreamEventContentUpdate | null {
    if (item.type !== 'mcp_call' || typeof item.id !== 'string') return null;
    const mcp = item as {
        id: string;
        name?: string;
        server_label?: string;
        status?: string;
        output?: string;
        error?: string;
    };
    let status: TToolStatus = 'loading';
    if (mcp.status === 'completed') status = 'success';
    else if (mcp.status === 'failed') status = 'error';
    let toolName: string | undefined;
    if (typeof mcp.name === 'string') toolName = mcp.name;
    else if (typeof mcp.server_label === 'string') toolName = mcp.server_label;
    else toolName = undefined;
    return {
        kind: 'tool_update',
        item_id: mcp.id,
        status,
        toolName,
        output: typeof mcp.output === 'string' ? mcp.output : undefined,
        error: typeof mcp.error === 'string' ? mcp.error : undefined,
    };
}

function getFunctionCallDoneUpdate(
    item: OpenAIStreamOutputItemLike,
): StreamEventContentUpdate | null {
    if (item.type !== 'function_call') return null;
    const fn = item as {
        call_id: string;
        name?: string;
        output?: string;
        result?: string;
        status?: string;
        error?: string;
    };
    const fnCallId = fn.call_id ? fn.call_id : '';

    if (!fnCallId) return null;

    let fnStatus: TToolStatus = 'loading';
    if (fn.status === 'completed') {
        fnStatus = 'success';
    } else if (fn.status === 'failed') {
        fnStatus = 'error';
    }

    let output: string | undefined;
    if (typeof fn.output === 'string') {
        output = fn.output;
    } else if (typeof fn.result === 'string') {
        output = fn.result;
    } else {
        output = undefined;
    }

    return {
        kind: 'tool_update',
        item_id: fnCallId,
        status: fnStatus,
        toolName: typeof fn.name === 'string' ? fn.name : undefined,
        output,
        error: typeof fn.error === 'string' ? fn.error : undefined,
    };
}

function getToolCallDoneUpdate(
    item: OpenAIStreamOutputItemLike,
    toolName: string,
): StreamEventContentUpdate | null {
    if (typeof item.id !== 'string') return null;
    const t = item as {
        id: string;
        status?: string;
        error?: string;
        output?: string;
        results?: unknown;
    };
    let status: TToolStatus = 'loading';
    if (t.status === 'completed') status = 'success';
    else if (t.status === 'failed' || t.status === 'incomplete') status = 'error';

    let output: string | undefined;
    if (typeof t.output === 'string') {
        output = t.output;
    } else if (typeof t.results === 'string') {
        output = t.results;
    } else if (Array.isArray(t.results)) {
        output = JSON.stringify(t.results);
    } else {
        output = undefined;
    }
    return {
        kind: 'tool_update',
        item_id: t.id,
        status,
        toolName,
        output,
        error: typeof t.error === 'string' ? t.error : undefined,
    };
}

function getUpdateFromOutputItemDone(
    e: EventRecord,
    data: EventRecord | undefined,
): StreamEventContentUpdate | null {
    const item = (e.item ?? (data?.item as OpenAIStreamOutputItemLike)) as
        | OpenAIStreamOutputItemLike
        | undefined;
    if (!item) return null;
    return (
        getReasoningDoneUpdate(item) ??
        getMcpCallDoneUpdate(item) ??
        getFunctionCallDoneUpdate(item) ??
        (item.type === 'file_search_call' ? getToolCallDoneUpdate(item, 'File Search') : null) ??
        (item.type === 'web_search_call' ? getToolCallDoneUpdate(item, 'Web Search') : null) ??
        (item.type === 'code_interpreter_call'
            ? getToolCallDoneUpdate(item, 'Code Interpreter')
            : null) ??
        (item.type === 'image_generation_call'
            ? getToolCallDoneUpdate(item, 'Image Generation')
            : null) ??
        (item.type === 'mcp_list_tools' ? getToolCallDoneUpdate(item, 'MCP List Tools') : null)
    );
}

/** Stream event → content update (text delta, tool add/update, thinking add/delta/done) or null. */

export function getStreamEventContentUpdate(
    event: OpenAIStreamEventLike | null | undefined,
): StreamEventContentUpdate | null {
    if (!event) return null;
    const e = event as EventRecord;
    const type = e.type ?? (e.data as {type?: string})?.type ?? e.event;
    const data = e.data as EventRecord | undefined;
    const itemId =
        typeof e.item_id === 'string' ? e.item_id : (data?.item_id as string | undefined);

    const delta = getTextDeltaFromStreamEvent(event);
    if (delta) return {kind: 'text_delta', delta};

    if (itemId) {
        const reasoningUpdate = getReasoningUpdate(e, data, type, itemId);
        if (reasoningUpdate) return reasoningUpdate;
    }

    if (type === 'response.output_item.added') {
        return getUpdateFromOutputItemAdded(e, data, itemId);
    }
    if (type === 'response.mcp_call.completed' && itemId) {
        return {kind: 'tool_update', item_id: itemId, status: 'success'};
    }
    if (type === 'response.mcp_call.failed' && itemId) {
        const err = typeof e.error === 'string' ? e.error : undefined;
        return {kind: 'tool_update', item_id: itemId, status: 'error', error: err};
    }

    const progressMatch = TOOL_PROGRESS_EVENTS.find(([t]) => t === type);
    if (progressMatch && itemId) {
        return {kind: 'tool_update', item_id: itemId, status: progressMatch[1]};
    }
    if (type === 'response.mcp_list_tools.failed' && itemId) {
        const err = typeof e.error === 'string' ? e.error : undefined;
        return {kind: 'tool_update', item_id: itemId, status: 'error', error: err};
    }

    if (type === 'response.output_item.done') {
        return getUpdateFromOutputItemDone(e, data);
    }
    return null;
}
