import type {TChatMessage} from '../../../types';

import type {OpenAIStreamEventLike} from './openAiTypes';

export type FetchResponseLike = {
    body?: ReadableStream<Uint8Array> | null;
    ok?: boolean;
    status?: number;
    statusText?: string;
};

export type {OpenAIStreamEventLike} from './openAiTypes';

export type OpenAIStreamAdapterOptions = {
    initialMessages?: TChatMessage[];
    assistantMessageId?: string;
    onStreamEnd?: (messages: TChatMessage[]) => void;
};

export type OpenAIStreamAdapterResult = {
    messages: TChatMessage[];
    status: 'idle' | 'streaming' | 'done' | 'error';
    error: Error | null;
};

export type OpenAIStreamSource = AsyncIterable<OpenAIStreamEventLike> | FetchResponseLike;
