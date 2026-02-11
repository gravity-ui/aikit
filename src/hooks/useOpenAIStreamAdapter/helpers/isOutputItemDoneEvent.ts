import {OpenAIStreamEventLike} from '../types';

/**
 * Checks whether the event marks the end of one output item (e.g. one message in a multi-message stream).
 * When true, the adapter should finalize the current assistant message and start a new one.
 *
 * @param event - Stream event to check
 * @returns {boolean} True if event is response.output_item.done
 */
export function isOutputItemDoneEvent(event: OpenAIStreamEventLike | null | undefined): boolean {
    if (!event) {
        return false;
    }
    const e = event as Record<string, unknown>;
    return (
        e.type === 'response.output_item.done' ||
        e.event === 'response.output_item.done' ||
        (e.data as {type?: string})?.type === 'response.output_item.done'
    );
}
