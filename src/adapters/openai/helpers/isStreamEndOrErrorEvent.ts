import {OpenAIStreamEventLike} from '../types';

import {isEventOneOf} from './eventTypeUtils';

const STREAM_END_TYPES = ['response.done', 'response.completed', 'response.failed'];

export function isStreamEndOrErrorEvent(event: OpenAIStreamEventLike | null | undefined): boolean {
    if (!event) {
        return false;
    }
    const e = event as Record<string, unknown>;
    if (e.type === 'error') return true;
    return isEventOneOf(e, e.data as Record<string, unknown> | undefined, STREAM_END_TYPES);
}
