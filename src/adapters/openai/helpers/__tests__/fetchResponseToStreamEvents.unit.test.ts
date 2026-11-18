/** @jest-environment node */
import {fetchResponseToStreamEvents} from '../fetchResponseToStreamEvents';

function responseFromChunks(chunks: string[]) {
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
        },
    });
    return {body};
}

async function collect(response: Parameters<typeof fetchResponseToStreamEvents>[0]) {
    const events = [];
    for await (const event of fetchResponseToStreamEvents(response)) {
        events.push(event);
    }
    return events;
}

describe('fetchResponseToStreamEvents', () => {
    it.each(['', 'data: [DONE]\n\n'])(
        'rejects an interrupted response ending with %j and releases the reader',
        async (ending) => {
            const response = responseFromChunks([
                'data: {"type":"response.output_text.delta","delta":"Partial"}\n\n',
                ending,
            ]);
            await expect(collect(response)).rejects.toThrow('Response stream interrupted');
            expect(response.body.locked).toBe(false);
        },
    );

    it.each(['response.completed', 'response.failed', 'response.incomplete', 'error'])(
        'preserves the terminal event %s across chunk boundaries',
        async (type) => {
            const event = {type};
            const response = responseFromChunks([
                'data: {"ty',
                `pe":"${type}"}\r\n\r\ndata: [DONE]\n\n`,
            ]);
            await expect(collect(response)).resolves.toEqual([event]);
            expect(response.body.locked).toBe(false);
        },
    );

    it('parses the final line without a trailing newline', async () => {
        await expect(
            collect(responseFromChunks(['data: {"type":"response.completed"}'])),
        ).resolves.toEqual([{type: 'response.completed'}]);
    });

    it('rejects empty and missing response bodies', async () => {
        await expect(collect(responseFromChunks([]))).rejects.toThrow('interrupted');
        await expect(collect({body: null})).rejects.toThrow('interrupted');
    });

    it('preserves HTTP errors', async () => {
        await expect(collect({ok: false, status: 503})).resolves.toEqual([
            {type: 'error', error: 'HTTP 503'},
        ]);
    });

    it('preserves reader errors including aborts and releases the reader', async () => {
        const error = new DOMException('Cancelled', 'AbortError');
        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                controller.error(error);
            },
        });
        await expect(collect({body})).rejects.toBe(error);
        expect(body.locked).toBe(false);
    });
});
