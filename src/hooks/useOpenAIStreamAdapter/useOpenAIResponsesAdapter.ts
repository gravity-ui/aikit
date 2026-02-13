import {useEffect, useMemo, useRef, useState} from 'react';

import type {TAssistantMessage, TChatMessage} from '../../types';

import {fetchResponseToStreamEvents} from './helpers/fetchResponseToStreamEvents';
import {getTextDeltaFromStreamEvent} from './helpers/getTextDeltaFromStreamEvent';
import {isFetchResponse} from './helpers/isFetchResponse';
import {isOutputItemDoneEvent} from './helpers/isOutputItemDoneEvent';
import {isStreamEndOrErrorEvent} from './helpers/isStreamEndOrErrorEvent';
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

/**
 * Converts a single, non-streaming OpenAI Responses API response into TChatMessage[].
 * Use for one-off responses (e.g. openai.responses.create() without stream: true).
 * For streaming, use useOpenAIStreamAdapter instead.
 *
 * @param response - Full response object from the API
 * @returns {TChatMessage[]} Messages array (one assistant message)
 */
export function useOpenAIResponsesAdapter(response: OpenAIResponseLike | null): TChatMessage[] {
    return useMemo(() => openAIResponseToMessages(response), [response]);
}

/**
 * Consumes an OpenAI Responses API stream and returns TChatMessage[] for ChatContainer/MessageList.
 * Use for streaming only; for a single response use useOpenAIResponsesAdapter.
 *
 * Supports:
 * - fetch Response with SSE (Content-Type: text/event-stream) — parses data:, [DONE], errors; 4xx/5xx yield error event;
 * - AsyncIterable of events (e.g. openai.responses.create({ stream: true })).
 *
 * @param stream - Fetch Response or AsyncIterable of stream events
 * @param options - initialMessages (chat history), assistantMessageId, onStreamEnd
 * @returns {OpenAIStreamAdapterResult} Messages for ChatContainer, stream status, and error if any
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

        // Use ref so we always have the options that were passed with this stream (same render)
        const baseMessages = initialMessagesRef.current;
        const getAssistantMessageId = (index: number) =>
            index === 0 ? assistantMessageId : `${assistantMessageId}-${index}`;

        const completedAssistantMessages: {id: string; content: string}[] = [];
        let messageIndex = 0;
        let currentAssistantMessageId = getAssistantMessageId(0);

        setMessages([
            ...baseMessages,
            {
                id: currentAssistantMessageId,
                role: 'assistant',
                content: '',
            } as TAssistantMessage,
        ]);

        let accumulatedContent = '';

        const buildFinalMessages = (): TChatMessage[] => [
            ...baseMessages,
            ...completedAssistantMessages.map(
                (m) =>
                    ({
                        id: m.id,
                        role: 'assistant' as const,
                        content: m.content,
                    }) as TAssistantMessage,
            ),
            {
                id: currentAssistantMessageId,
                role: 'assistant',
                content: accumulatedContent,
            } as TAssistantMessage,
        ];

        (async () => {
            try {
                for await (const event of streamToConsume) {
                    if (cancelled) {
                        return;
                    }

                    if (isStreamEndOrErrorEvent(event)) {
                        const e = event as Record<string, unknown>;
                        const finalMessages = buildFinalMessages();
                        if (e.type === 'error' || e.event === 'error' || e.error) {
                            if (cancelled) return;
                            const errMsg =
                                typeof e.error === 'string'
                                    ? e.error
                                    : ((e.data as {error?: string})?.error ??
                                      (e as {error?: {message?: string}}).error?.message ??
                                      'Stream error');
                            setError(new Error(errMsg));
                            setStatus('error');
                            onStreamEndRef.current?.(finalMessages);
                        } else {
                            if (cancelled) return;
                            setStatus('done');
                            onStreamEndRef.current?.(finalMessages);
                        }
                        return;
                    }

                    if (isOutputItemDoneEvent(event)) {
                        completedAssistantMessages.push({
                            id: currentAssistantMessageId,
                            content: accumulatedContent,
                        });
                        messageIndex += 1;
                        currentAssistantMessageId = getAssistantMessageId(messageIndex);
                        const newMessageId = currentAssistantMessageId;
                        accumulatedContent = '';
                        if (cancelled) return;
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: newMessageId,
                                role: 'assistant',
                                content: '',
                            } as TAssistantMessage,
                        ]);
                        continue;
                    }

                    const delta = getTextDeltaFromStreamEvent(event);
                    if (delta) {
                        accumulatedContent += delta;
                        const content = accumulatedContent;
                        const idToUpdate = currentAssistantMessageId;
                        if (cancelled) return;
                        setMessages((prev) =>
                            prev.map((msg): TChatMessage => {
                                if (msg.id === idToUpdate && msg.role === 'assistant') {
                                    return {...msg, content} as TAssistantMessage;
                                }
                                return msg;
                            }),
                        );
                    }
                }
                if (!cancelled) {
                    const finalMessages = buildFinalMessages();
                    setStatus('done');
                    onStreamEndRef.current?.(finalMessages);
                }
            } catch (err) {
                if (!cancelled) {
                    const finalMessages = buildFinalMessages();
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setStatus('error');
                    onStreamEndRef.current?.(finalMessages);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [stream, assistantMessageId]);

    return {messages, status, error};
}
