import {OpenAIStreamEventLike} from '../types';

import {isEventOneOf} from './eventTypeUtils';

export function isOutputItemDoneEvent(event: OpenAIStreamEventLike | null | undefined): boolean {
    if (!event) {
        return false;
    }
    const e = event as Record<string, unknown>;
    return isEventOneOf(e, e.data as Record<string, unknown> | undefined, [
        'response.output_item.done',
    ]);
}
