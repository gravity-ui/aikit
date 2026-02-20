import {OpenAIStreamEventLike} from '../types';

import {getDeltaForEventTypes} from './eventTypeUtils';
import {isOutputTextOrContentPartDone} from './isOutputTextOrContentPartDone';

/** Text delta from event; *.done ignored to avoid duplicate accumulation. */

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

    const outputTextDelta = getDeltaForEventTypes(e, data, ['response.output_text.delta']);
    if (outputTextDelta !== null) return outputTextDelta;

    const contentPartDelta = getDeltaForEventTypes(e, data, ['response.content_part.delta']);
    if (contentPartDelta !== null) return contentPartDelta;

    const refusalDelta = getDeltaForEventTypes(e, data, ['response.refusal.delta']);
    if (refusalDelta !== null) return refusalDelta;

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
