import {Responses} from 'openai/resources/responses/responses.js';
import {Stream} from 'openai/streaming.js';

type EventChunkCb = (event: Responses.ResponseStreamEvent) => void;
type BufferChunkCb = (buffer: Buffer<ArrayBuffer>) => void;

export class ResponseStream {
    readonly stream: Stream<Responses.ResponseStreamEvent>;

    private abortController: AbortController;

    private eventChunkCb: EventChunkCb | null = null;
    private bufferChunkCb: BufferChunkCb | null = null;

    constructor(stream: Stream<Responses.ResponseStreamEvent>, abortController: AbortController) {
        this.stream = stream;
        this.abortController = abortController;
    }

    onEventChunk(cb: EventChunkCb) {
        this.eventChunkCb = cb;
    }

    onBufferChunk(cb: BufferChunkCb) {
        this.bufferChunkCb = cb;
    }

    async start() {
        const abortSignal = this.abortController.signal;

        for await (const event of this.stream) {
            if (abortSignal.aborted) {
                this.stream.controller.abort();
                break;
            }

            const str = 'data: ' + JSON.stringify(event) + '\n\n';

            const buffer = Buffer.from(str, 'utf-8');

            this.eventChunkCb?.(event);
            this.bufferChunkCb?.(buffer);
        }
    }
}
