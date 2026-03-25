import type {OpenAIStreamEventLike} from '../types';

/** `response.output_item.added` for assistant message → OpenAI message id (e.g. msg-cc-…). */

export function getOpenAIMessageItemIdFromOutputItemAdded(
    event: OpenAIStreamEventLike | null | undefined,
): string | null {
    if (!event) return null;

    const e = event as Record<string, unknown>;
    if (e.type !== 'response.output_item.added') return null;

    const item = e.item as {type?: string; id?: string} | undefined;
    if (item?.type !== 'message' || typeof item.id !== 'string' || item.id.length === 0) {
        return null;
    }

    return item.id;
}
