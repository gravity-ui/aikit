import type {TAssistantMessage, TMessageContentUnion} from '../../../types';
import {
    OpenAIResponseFunctionToolCall,
    OpenAIResponseOutputItem,
    OpenAIResponseOutputMessage,
    OpenAIResponseReasoningItem,
} from '../types/openAiTypes';

/**
 * Maps OpenAI Responses API output to content blocks for TAssistantMessage.
 * In the API, output is a flat array: message (content = output_text | refusal), reasoning, and function_call are separate items.
 *
 * @param output - Output items array from OpenAI response
 * @returns Content for assistant message (text or content blocks)
 */
export function mapOutputToContent(
    output: OpenAIResponseOutputItem[] | null | undefined,
): TAssistantMessage['content'] {
    const blocks: TMessageContentUnion[] = [];

    for (const item of output ?? []) {
        if (item.type === 'message' && 'role' in item && item.role === 'assistant') {
            const msg = item as OpenAIResponseOutputMessage;
            for (const part of msg.content ?? []) {
                if (part.type === 'output_text') {
                    blocks.push({type: 'text', data: {text: part.text}});
                }
                if (part.type === 'refusal') {
                    blocks.push({type: 'text', data: {text: part.refusal}});
                }
            }
        }

        if (item.type === 'reasoning') {
            const reasoning = item as OpenAIResponseReasoningItem;
            const content =
                reasoning.content?.map((c) => c.text) ??
                reasoning.summary?.map((s) => s.text) ??
                [];
            blocks.push({
                type: 'thinking',
                data: {
                    content: content.length <= 1 ? (content[0] ?? '') : content,
                    status: 'thought',
                    defaultExpanded: false,
                },
            });
        }

        if (item.type === 'function_call') {
            const fn = item as OpenAIResponseFunctionToolCall;
            blocks.push({
                type: 'tool',
                id: fn.call_id,
                data: {
                    toolName: fn.name,
                    status: 'loading',
                },
            });
        }
    }

    if (blocks.length === 0) {
        return '';
    }
    if (blocks.length === 1 && blocks[0].type === 'text') {
        return blocks[0].data.text;
    }
    return blocks;
}
