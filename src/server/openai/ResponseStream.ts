import {Responses} from 'openai/resources/responses/responses.js';
import {Stream} from 'openai/streaming.js';

type EventChunkCb = (event: Responses.ResponseStreamEvent) => void;
type BufferChunkCb = (buffer: Buffer<ArrayBuffer>) => void;

export class ResponseStream {
    readonly stream: Stream<Responses.ResponseStreamEvent>;

    private eventChunkCb: EventChunkCb | null = null;
    private bufferChunkCb: BufferChunkCb | null = null;
    private onFinishCb: (() => void) | null = null;

    constructor(stream: Stream<Responses.ResponseStreamEvent>) {
        this.stream = stream;
    }

    onEventChunk(cb: EventChunkCb) {
        this.eventChunkCb = cb;
    }

    onBufferChunk(cb: BufferChunkCb) {
        this.bufferChunkCb = cb;
    }

    onFinish(cb: () => void) {
        this.onFinishCb = cb;
    }

    async start() {
        for await (const event of this.stream) {
            if (this.stream.controller.signal.aborted) {
                this.onFinishCb?.();
                break;
            }

            const str = 'data: ' + JSON.stringify(event) + '\n\n';

            const buffer = Buffer.from(str, 'utf-8');

            this.eventChunkCb?.(event);
            this.bufferChunkCb?.(buffer);
        }

        this.onFinishCb?.();
    }

    abort() {
        this.stream.controller.abort();
    }
}
