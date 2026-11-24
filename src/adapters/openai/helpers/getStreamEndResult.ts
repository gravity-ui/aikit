import type {OpenAIStreamEventLike} from '../types';

import {isEventOneOf} from './eventTypeUtils';
import {getStreamErrorMessage} from './getStreamErrorMessage';

export function getStreamEndResult(
    event: OpenAIStreamEventLike,
): {status: 'done'} | {status: 'error'; error: Error} {
    const e = event as Record<string, unknown>;
    const data = e.data as Record<string, unknown> | undefined;
    if (isEventOneOf(e, data, ['response.failed', 'response.incomplete'])) {
        const response = (e.response ?? data?.response) as
            | {error?: {message?: string} | null; incomplete_details?: {reason?: string} | null}
            | undefined;
        const fallback = isEventOneOf(e, data, ['response.incomplete'])
            ? 'Response incomplete'
            : 'Response failed';
        const reason = response?.incomplete_details?.reason;
        const message = response?.error?.message || (reason ? `${fallback}: ${reason}` : fallback);
        return {status: 'error', error: new Error(message)};
    }
    if (isEventOneOf(e, data, ['error']) || e.error) {
        return {status: 'error', error: new Error(getStreamErrorMessage(e))};
    }
    return {status: 'done'};
}
