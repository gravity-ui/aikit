import {OpenAIStreamEventLike} from '../types';

/**
 * Checks whether the event is a stream end or error event.
 *
 * @param event - Stream event to check
 * @returns {boolean} True if event is response.done, response.failed, or error
 */
export function isStreamEndOrErrorEvent(event: OpenAIStreamEventLike | null | undefined): boolean {
    if (!event) {
        return false;
    }
    const e = event as Record<string, unknown>;
    return (
        e.type === 'response.done' ||
        e.type === 'response.failed' ||
        e.type === 'error' ||
        e.event === 'response.done' ||
        e.event === 'response.failed' ||
        (e.data as {type?: string})?.type === 'response.done' ||
        (e.data as {type?: string})?.type === 'response.failed'
    );
}
