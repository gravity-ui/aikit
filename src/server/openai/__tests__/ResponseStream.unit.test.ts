import {Responses} from 'openai/resources/responses/responses.js';
import {Stream} from 'openai/streaming.js';

import {ResponseStream} from '../ResponseStream';

describe('ResponseStream', () => {
    it('onEventChunk() pass event chunks', () => {
        const stream = ['chunk1', 'chunk2', 'chunk3', 'chunk4'];

        const abortedFn = jest.fn();

        // @ts-ignore
        stream.controller = {
            signal: {aborted: false},
            abort: function () {
                this.signal.aborted = true;
                abortedFn();
            },
        };

        const service = new ResponseStream(
            stream as unknown as Stream<Responses.ResponseStreamEvent>,
        );

        const expectedChunks: any[] = [];

        service.start();
        service.onEventChunk((chunk) => {
            expectedChunks.push(chunk);
        });
        service.onFinish(() => {
            expect(expectedChunks).toEqual([...stream]);
        });
    });

    it('onBufferChunk() pass buffer chunk', () => {
        const stream = ['chunk1', 'chunk2', 'chunk3', 'chunk4'];

        const abortedFn = jest.fn();

        // @ts-ignore
        stream.controller = {
            signal: {aborted: false},
            abort: function () {
                this.signal.aborted = true;
                abortedFn();
            },
        };

        const toBeChuunk = stream.map((event) => {
            const str = 'data: ' + JSON.stringify(event) + '\n\n';

            const buffer = Buffer.from(str, 'utf-8');

            return buffer;
        });

        const service = new ResponseStream(
            stream as unknown as Stream<Responses.ResponseStreamEvent>,
        );

        const expectedChunks: any[] = [];

        service.start();
        service.onBufferChunk((chunk) => {
            expectedChunks.push(chunk);
        });
        service.onFinish(() => {
            expect(expectedChunks).toEqual(toBeChuunk);
        });
    });

    it('abort() abort chunks steaming', () => {
        const stream = ['chunk1', 'chunk2', 'chunk3', 'chunk4'];

        const abortedFn = jest.fn();

        // @ts-ignore
        stream.controller = {
            signal: {aborted: false},
            abort: function () {
                this.signal.aborted = true;
                abortedFn();
            },
        };

        const service = new ResponseStream(
            stream as unknown as Stream<Responses.ResponseStreamEvent>,
        );

        const recordedChunks: any[] = [];

        service.start();
        service.onEventChunk((chunk) => {
            recordedChunks.push(chunk);
            // @ts-ignore
            if (chunk === 'chunk2') {
                service.abort();
            }
        });
        service.onFinish(() => {
            expect(abortedFn).toHaveBeenCalled();
            expect(recordedChunks).toEqual(stream.slice(0, 2));
        });
    });
});
