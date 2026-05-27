import type {OpenAIStreamEventLike} from '../types';

import {getStreamErrorMessage} from './getStreamErrorMessage';

export function getStreamEndResult(
    event: OpenAIStreamEventLike,
): {status: 'done'} | {status: 'error'; error: Error} {
    const e = event as Record<string, unknown>;
    if (e.type === 'error' || e.event === 'error' || e.error) {
        return {status: 'error', error: new Error(getStreamErrorMessage(e))};
    }
    return {status: 'done'};
}
