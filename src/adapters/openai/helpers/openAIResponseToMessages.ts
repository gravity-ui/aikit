import type {TAssistantMessage, TChatMessage, TMessageMetadata} from '../../../types';
import {OpenAIResponseLike, OpenAIResponseOutputMessage} from '../types/openAiTypes';

import {mapOutputToContent} from './mapOutputToContent';

function toMessageMetadata(value: unknown): TMessageMetadata {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as TMessageMetadata;
    }
    return {};
}

/** Single response → TChatMessage[] (one assistant message; output items merged into content). */

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
