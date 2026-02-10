import {ClientOptions, OpenAI} from 'openai/client.js';
import {ResponseCreateParamsStreaming} from 'openai/resources/responses/responses.js';

import {ResponseStream} from './ResponseStream.js';

type ExtraClientOptions = {
    model?: string;
    agent?: string;
};

export class OpenAIService extends OpenAI {
    private model?: string;
    private agent?: string;

    constructor(options: ClientOptions & ExtraClientOptions) {
        super(options);

        this.model = options.model;
        this.agent = options.agent;
    }

    async createResponseStream(payload: ResponseCreateParamsStreaming) {
        const abortController = new AbortController();

        const metadata = this.getMetadataForResponseStream(payload.metadata);

        const stream = await this.responses.create(
            {model: this.model, ...payload, stream: true, metadata},
            {signal: abortController.signal},
        );

        const responseStream = new ResponseStream(stream, abortController);

        return responseStream;
    }

    private getMetadataForResponseStream(
        payloadMetadata: ResponseCreateParamsStreaming['metadata'],
    ) {
        if (payloadMetadata) return payloadMetadata;

        if (this.agent) return {agent: this.agent};

        return undefined;
    }
}
