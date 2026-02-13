import type {TAssistantMessage, TChatMessage, TMessageMetadata} from '../../../types';
import {OpenAIResponseLike, OpenAIResponseOutputMessage} from '../types/openAiTypes';

import {mapOutputToContent} from './mapOutputToContent';

function toMessageMetadata(value: unknown): TMessageMetadata {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as TMessageMetadata;
    }
    return {};
}

/**
 * Converts a single OpenAI Responses API response into an array of TChatMessage.
 * One response yields one assistant message: all output items (message, reasoning, function_call)
 * are merged into a single content in order.
 * Accepts a response object from openai.responses.create() or a compatible shape.
 *
 * @param response - Full response object from OpenAI Responses API
 * @returns {TChatMessage[]} Array with one assistant message
 */
export function openAIResponseToMessages(response: OpenAIResponseLike | null): TChatMessage[] {
    if (!response?.output?.length) {
        return [];
    }

    const baseMeta = toMessageMetadata(response.metadata);

    const content = mapOutputToContent(response.output);
    const firstMessage = response.output.find(
        (item): item is OpenAIResponseOutputMessage =>
            item.type === 'message' && 'role' in item && item.role === 'assistant',
    );
    const id = firstMessage?.id ?? response.id;

    const assistantMessage: TAssistantMessage = {
        ...(id && {id}),
        role: 'assistant',
        content: content || '',
        metadata: baseMeta,
        ...(response.error && {error: response.error}),
    };

    return [assistantMessage];
}
