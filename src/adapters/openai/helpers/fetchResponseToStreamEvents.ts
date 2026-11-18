import {FetchResponseLike, OpenAIStreamEventLike} from '../types';

import {isStreamEndOrErrorEvent} from './isStreamEndOrErrorEvent';

const SSE_DATA_PREFIX = 'data: ';

function parseSSELine(line: string): Record<string, unknown> | null {
    try {
        return JSON.parse(line.slice(SSE_DATA_PREFIX.length)) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/** Parses SSE events. EOF or [DONE] without a terminal response event is an error. */

export async function* fetchResponseToStreamEvents(
    response: FetchResponseLike,
): AsyncIterable<OpenAIStreamEventLike> {
    if (response.ok === false) {
        const message =
            response.statusText || (response.status ? `HTTP ${response.status}` : 'HTTP error');
        yield {type: 'error', error: message};
        return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response stream interrupted');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const {done, value} = await reader.read();
            buffer += done ? decoder.decode() : decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = done ? '' : (lines.pop() ?? '');

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === `${SSE_DATA_PREFIX}[DONE]`) {
                    throw new Error('Response stream interrupted');
                }
                if (!trimmed.startsWith(SSE_DATA_PREFIX)) {
                    continue;
                }

                const parsed = parseSSELine(trimmed);
                if (!parsed) {
                    continue;
                }

                if ((parsed as {error?: string}).error) {
                    yield {
                        type: 'error',
                        error: (parsed as {error?: string}).error,
                    };
                    return;
                }

                const event = parsed as OpenAIStreamEventLike;
                yield event;
                if (isStreamEndOrErrorEvent(event)) {
                    return;
                }
            }
            if (done) {
                throw new Error('Response stream interrupted');
            }
        }
    } finally {
        reader.releaseLock();
    }
}
