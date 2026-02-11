import {OpenAIStreamEventLike} from '../types';

import {isOutputTextOrContentPartDone} from './isOutputTextOrContentPartDone';

/**
 * Extracts the text delta from a stream event.
 * Supports SDK format (type + delta) and SSE format (event/data or {text}).
 * *.done events (with full text) are ignored for accumulation to avoid duplicating already streamed text.
 *
 * @param event - Stream event from OpenAI Responses API
 * @returns {string | null} Text delta or null
 */
export function getTextDeltaFromStreamEvent(
    event: OpenAIStreamEventLike | null | undefined,
): string | null {
    if (!event) {
        return null;
    }

    const e = event as Record<string, unknown>;
    const data = e.data as Record<string, unknown> | undefined;

    if (isOutputTextOrContentPartDone(e, data)) {
        return null;
    }

    if (e.type === 'response.output_text.delta' && typeof e.delta === 'string') {
        return e.delta;
    }
    if (e.event === 'response.output_text.delta' || data?.type === 'response.output_text.delta') {
        const delta = (data?.delta as string | undefined) ?? (e.delta as string | undefined);
        return typeof delta === 'string' ? delta : null;
    }

    if (e.type === 'response.content_part.delta' && typeof e.delta === 'string') {
        return e.delta;
    }
    if (e.event === 'response.content_part.delta' || data?.type === 'response.content_part.delta') {
        const delta = (data?.delta as string | undefined) ?? (e.delta as string | undefined);
        return typeof delta === 'string' ? delta : null;
    }

    if (typeof data?.text === 'string') {
        return data.text;
    }
    if (typeof e.text === 'string') {
        return e.text;
    }

    // Legacy: event.event === 'content' && event.data.content
    if (e.event === 'content' && (e.data as {content?: string} | undefined)?.content) {
        return (e.data as {content: string}).content;
    }

    return null;
}
