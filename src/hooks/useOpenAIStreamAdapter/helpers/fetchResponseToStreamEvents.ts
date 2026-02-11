import {FetchResponseLike, OpenAIStreamEventLike} from '../types';

/**
 * Parses a single SSE line (data: {...}) into an event object.
 *
 * @param line - SSE data line (e.g. "data: {...}")
 * @returns {Record<string, unknown> | null} Parsed object or null
 */
function parseSSELine(line: string): Record<string, unknown> | null {
    try {
        return JSON.parse(line.slice(6)) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/**
 * Converts a fetch Response with SSE stream into an AsyncIterable of OpenAI Responses API events.
 * Handles buffering, parsing data: lines, [DONE], and errors. Use for responses with Content-Type: text/event-stream.
 * Empty lines and comment lines (starting with ":") are ignored per SSE spec.
 * If response has ok === false (e.g. 4xx/5xx), yields a single error event and does not read the body.
 *
 * @param response - Fetch Response with readable body stream
 * @returns {AsyncIterable<OpenAIStreamEventLike>} Async iterable of stream events
 */
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
                if (trimmed === 'data: [DONE]') {
                    yield {type: 'response.done'};
                    continue;
                }
                if (!trimmed.startsWith('data: ')) {
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
