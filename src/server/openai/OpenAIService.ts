import {OpenAI} from 'openai/client.js';
import {ResponseCreateParamsStreaming} from 'openai/resources/responses/responses.js';

import {ResponseStream} from './ResponseStream.js';

export class OpenAIService extends OpenAI {
    async createResponseStream(body: ResponseCreateParamsStreaming) {
        const abortController = new AbortController();

        const stream = await this.responses.create(
            {...body, stream: true},
            {signal: abortController.signal},
        );

        const responseStream = new ResponseStream(stream, abortController);

        return responseStream;
    }
}
