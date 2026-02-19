import type {TAssistantMessage, TMessageContentUnion} from '../../../types';
import {
    OpenAIResponseFunctionToolCall,
    OpenAIResponseMcpCallLike,
    OpenAIResponseOutputItem,
    OpenAIResponseOutputMessage,
    OpenAIResponseReasoningItem,
} from '../types/openAiTypes';

function pushBlocksForMessage(
    msg: OpenAIResponseOutputMessage,
    blocks: TMessageContentUnion[],
): void {
    for (const part of msg.content ?? []) {
        if (part.type === 'output_text') {
            blocks.push({type: 'text', data: {text: part.text}});
        }
        if (part.type === 'refusal') {
            blocks.push({type: 'text', data: {text: part.refusal}});
        }
    }
}

function pushBlocksForReasoning(
    reasoning: OpenAIResponseReasoningItem,
    blocks: TMessageContentUnion[],
): void {
    const content =
        reasoning.content?.map((c) => c.text) ?? reasoning.summary?.map((s) => s.text) ?? [];
    blocks.push({
        ...(Boolean(reasoning.id) && {id: reasoning.id}),
        type: 'thinking',
        data: {
            content: content.length <= 1 ? (content[0] ?? '') : content,
            status: 'thought',
            defaultExpanded: false,
        },
    });
}

function pushBlocksForFunctionCall(
    fn: OpenAIResponseFunctionToolCall,
    blocks: TMessageContentUnion[],
): void {
    blocks.push({
        type: 'tool',
        id: fn.call_id,
        data: {toolName: fn.name, status: 'loading'},
    });
}

function pushBlocksForMcpCall(
    mcp: OpenAIResponseMcpCallLike,
    blocks: TMessageContentUnion[],
): void {
    const statusByMcpStatus: Record<string, 'success' | 'error' | 'loading'> = {
        completed: 'success',
        failed: 'error',
    };
    const status = statusByMcpStatus[mcp.status ?? ''] ?? 'loading';
    blocks.push({
        type: 'tool',
        id: mcp.id,
        data: {
            toolName: mcp.name ?? mcp.server_label ?? 'MCP',
            status,
            headerContent: mcp.output ?? undefined,
        },
    });
}

function pushBlocksForItem(item: OpenAIResponseOutputItem, blocks: TMessageContentUnion[]): void {
    if (item.type === 'message' && 'role' in item && item.role === 'assistant') {
        pushBlocksForMessage(item as OpenAIResponseOutputMessage, blocks);
        return;
    }
    if (item.type === 'reasoning') {
        pushBlocksForReasoning(item as OpenAIResponseReasoningItem, blocks);
        return;
    }
    if (item.type === 'function_call') {
        pushBlocksForFunctionCall(item as OpenAIResponseFunctionToolCall, blocks);
        return;
    }
    if (item.type === 'mcp_call') {
        pushBlocksForMcpCall(item as OpenAIResponseMcpCallLike, blocks);
    }
}

/** OpenAI response output (flat array of message/reasoning/function_call) → TAssistantMessage content. */

export function mapOutputToContent(
    output: OpenAIResponseOutputItem[] | null | undefined,
): TAssistantMessage['content'] {
    const blocks: TMessageContentUnion[] = [];
    for (const item of output ?? []) {
        pushBlocksForItem(item, blocks);
    }
    if (blocks.length === 0) return '';
    if (blocks.length === 1 && blocks[0].type === 'text') return blocks[0].data.text;
    return blocks;
}
