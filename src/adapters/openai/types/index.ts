import type {ChatStatus, TChatMessage} from '../../../types';

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

/** Status from useOpenAIStreamAdapter. Subset of ChatStatus (no 'submitted'); safe to pass to ChatContainer. */
export type OpenAIStreamAdapterStatus = Exclude<ChatStatus, 'submitted'>;

export type OpenAIStreamAdapterResult = {
    messages: TChatMessage[];
    status: OpenAIStreamAdapterStatus;
    error: Error | null;
    responseId: string | null;
};

export type OpenAIStreamSource = AsyncIterable<OpenAIStreamEventLike> | FetchResponseLike;
