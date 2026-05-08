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
    /**
     * When true, extracts token usage from `response.completed` events and stores
     * `outputTokens` in each assistant message's metadata.
     * Disabled by default — opt-in to avoid unexpected metadata on messages.
     */
    trackTokenUsage?: boolean;
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
