import {FetchResponseLike, OpenAIStreamEventLike} from '../types';

const SSE_DATA_PREFIX = 'data: ';

function parseSSELine(line: string): Record<string, unknown> | null {
    try {
        return JSON.parse(line.slice(SSE_DATA_PREFIX.length)) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/** Fetch Response (text/event-stream) → AsyncIterable of stream events. Handles [DONE], errors; 4xx/5xx yield error. */

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
        return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === `${SSE_DATA_PREFIX}[DONE]`) {
                    yield {type: 'response.done'};
                    continue;
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

                yield parsed as OpenAIStreamEventLike;
            }
        }

        yield {type: 'response.done'};
    } finally {
        reader.releaseLock();
    }
}
