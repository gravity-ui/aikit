import {useEffect, useMemo, useRef, useState} from 'react';

import type {TAssistantMessage, TChatMessage} from '../../types';

import {type ConsumeStreamCallbacks, consumeOpenAIStream} from './helpers/consumeOpenAIStream';
import {fetchResponseToStreamEvents} from './helpers/fetchResponseToStreamEvents';
import {isFetchResponse} from './helpers/isFetchResponse';
import {openAIResponseToMessages} from './helpers/openAIResponseToMessages';
import type {
    OpenAIStreamAdapterOptions,
    OpenAIStreamAdapterResult,
    OpenAIStreamSource,
} from './types';
import {OpenAIResponseLike, OpenAIStreamEventLike} from './types/openAiTypes';

export type {
    OpenAIStreamAdapterOptions,
    OpenAIStreamAdapterResult,
    OpenAIStreamSource,
} from './types';

/** Single non-streaming response → TChatMessage[]. For streaming use useOpenAIStreamAdapter. */

export function useOpenAIResponsesAdapter(response: OpenAIResponseLike | null): TChatMessage[] {
    return useMemo(() => openAIResponseToMessages(response), [response]);
}

/**
 * Consumes OpenAI stream (fetch SSE or AsyncIterable), returns { messages, status, error }.
 * Only message output_item.done starts a new assistant message; MCP/tool/reasoning .done are ignored.
 * See README for result shape and options.
 */

export function useOpenAIStreamAdapter(
    stream: OpenAIStreamSource | null,
    options: OpenAIStreamAdapterOptions = {},
): OpenAIStreamAdapterResult {
    const {initialMessages = [], assistantMessageId: optionId, onStreamEnd} = options;
    const onStreamEndRef = useRef(onStreamEnd);
    onStreamEndRef.current = onStreamEnd;
    const initialMessagesRef = useRef(initialMessages);
    initialMessagesRef.current = initialMessages;

    const [messages, setMessages] = useState<TChatMessage[]>(initialMessages);
    const [status, setStatus] = useState<OpenAIStreamAdapterResult['status']>('idle');
    const [error, setError] = useState<Error | null>(null);

    const assistantMessageId = useMemo(() => optionId ?? `assistant-${Date.now()}`, [optionId]);

    useEffect(() => {
        if (!stream) {
            setStatus('idle');
            setError(null);
            return undefined;
        }

        const streamToConsume: AsyncIterable<OpenAIStreamEventLike> = isFetchResponse(stream)
            ? fetchResponseToStreamEvents(stream)
            : stream;

        let cancelled = false;
        setStatus('streaming');
        setError(null);

        const baseMessages = initialMessagesRef.current;
        const getAssistantMessageId = (index: number) =>
            index === 0 ? assistantMessageId : `${assistantMessageId}-${index}`;

        setMessages([
            ...baseMessages,
            {
                id: getAssistantMessageId(0),
                role: 'assistant',
                content: '',
            } as TAssistantMessage,
        ]);

        const callbacks: ConsumeStreamCallbacks = {
            baseMessages,
            getAssistantMessageId,
            onContentUpdate: (messageId, content) => {
                if (cancelled) return;
                setMessages((prev) =>
                    prev.map(
                        (msg): TChatMessage =>
                            msg.id === messageId && msg.role === 'assistant'
                                ? ({...msg, content} as TAssistantMessage)
                                : msg,
                    ),
                );
            },
            onNewMessage: (messageId) => {
                if (cancelled) return;
                setMessages((prev) => [
                    ...prev,
                    {
                        id: messageId,
                        role: 'assistant',
                        content: '',
                    } as TAssistantMessage,
                ]);
            },
            onEnd: (finalMessages, s, err) => {
                setStatus(s);
                setError(err ?? null);
                onStreamEndRef.current?.(finalMessages);
            },
            getIsCancelled: () => cancelled,
        };

        consumeOpenAIStream(streamToConsume, callbacks);

        return () => {
            cancelled = true;
        };
    }, [stream, assistantMessageId]);

    return {messages, status, error};
}
