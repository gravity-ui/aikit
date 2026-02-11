export type OpenAIResponseLike = {
    id?: string;
    error?: {code?: string; message?: string} | null;
    metadata?: Record<string, string> | null;
    output?: OpenAIResponseOutputItem[] | null;
};

export type OpenAIResponseOutputMessage = {
    type: 'message';
    id?: string;
    role: 'assistant';
    content: Array<OpenAIResponseOutputText | OpenAIResponseOutputRefusal>;
    status?: 'in_progress' | 'completed' | 'incomplete';
};

export type OpenAIResponseOutputText = {
    type: 'output_text';
    text: string;
    annotations?: unknown[];
};

export type OpenAIResponseOutputRefusal = {
    type: 'refusal';
    refusal: string;
};

/** Matches ResponseReasoningItem — a separate output item, not inside message. */
export type OpenAIResponseReasoningItem = {
    type: 'reasoning';
    id?: string;
    content?: Array<{type: 'reasoning_text'; text: string}>;
    summary?: Array<{type: string; text: string}>;
};

export type OpenAIResponseFunctionToolCall = {
    type: 'function_call';
    call_id: string;
    name: string;
    arguments?: string;
    id?: string;
};

export type OpenAIResponseOutputItem =
    | OpenAIResponseOutputMessage
    | OpenAIResponseReasoningItem
    | OpenAIResponseFunctionToolCall
    | {type: string};

export type OpenAIStreamEventLike =
    | {type: 'response.output_text.delta'; delta: string}
    | {type: 'response.output_text.done'; text?: string}
    | {type: 'response.content_part.delta'; delta?: string}
    | {type: 'response.done'}
    | {type: 'response.failed'}
    | {type: 'error'; error?: string}
    | {event?: string; data?: {type?: string; delta?: string; text?: string}; error?: string}
    | {text?: string};
