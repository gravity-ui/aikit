import {OpenAIStreamEventLike} from '../types';

import {isOutputItemDoneEvent} from './isOutputItemDoneEvent';

/** output_item.done for item.type === 'message' only; other types (MCP, tool, reasoning) return false. */

export function isMessageOutputItemDoneEvent(
    event: OpenAIStreamEventLike | null | undefined,
): boolean {
    if (!isOutputItemDoneEvent(event)) {
        return false;
    }
    const e = event as Record<string, unknown>;
    const item =
        (e.item as {type?: string} | undefined) ??
        (e.data as {item?: {type?: string}} | undefined)?.item;
    if (item === undefined) {
        if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
            /* eslint-disable-next-line no-console */
            console.warn(
                '[useOpenAIStreamAdapter] output_item.done event has no item; treating as message done.',
                event,
            );
        }
        return true;
    }
    return item.type === 'message';
}
