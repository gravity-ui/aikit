import {useEffect, useMemo, useRef, useState} from 'react';

import type {TAssistantMessage, TChatMessage, TMessageContentUnion} from '../../types';

import {type ConsumeStreamCallbacks, consumeOpenAIStream} from './helpers/consumeOpenAIStream';
import {contentPartsToMessageContent} from './helpers/contentPartsToMessageContent';
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
    OpenAIStreamAdapterStatus,
    OpenAIStreamSource,
} from './types';

/** Single non-streaming response → TChatMessage[]. For streaming use useOpenAIStreamAdapter. */

function isToolPart(p: TMessageContentUnion): p is Extract<TMessageContentUnion, {type: 'tool'}> {
    return p.type === 'tool';
}

/**
 * When the stream splits the reply into two consecutive assistant messages, the same tool call can
 * appear in both. Moves matching tool parts into the earlier segment and drops the duplicate from
 * the later one so the UI does not show orphaned repeats.
 */
export function collapseOrphanToolBetweenAssistantSegments(
    messages: TChatMessage[],
): TChatMessage[] {
    const result = messages.map((m) =>
        m.role === 'assistant' ? ({...m} as TAssistantMessage) : m,
    );

    for (let i = result.length - 1; i >= 1; i--) {
        const next = result[i] as TAssistantMessage;
        const prev = result[i - 1] as TAssistantMessage;
        if (prev.role !== 'assistant' || next.role !== 'assistant') {
            continue;
        }

        const nextContent = next.content;
        if (!Array.isArray(nextContent)) {
            continue;
        }

        const prevContent = prev.content;
        if (!Array.isArray(prevContent)) {
            continue;
        }

        const updatedNextParts = [...nextContent] as TMessageContentUnion[];
        let updatedPrevParts = [...prevContent] as TMessageContentUnion[];
        let changed = false;

        for (let t = updatedNextParts.length - 1; t >= 0; t--) {
            const part = updatedNextParts[t];
            if (!isToolPart(part) || !part.id) {
                continue;
            }
            const pIdx = updatedPrevParts.findIndex((p) => isToolPart(p) && p.id === part.id);
            if (pIdx < 0) {
                continue;
            }
            updatedPrevParts = updatedPrevParts.map((p, j) => (j === pIdx ? part : p));
            updatedNextParts.splice(t, 1);
            changed = true;
        }

        if (!changed) {
            continue;
        }

        result[i - 1] = {
            ...prev,
            content: contentPartsToMessageContent(updatedPrevParts),
        };
        result[i] = {
            ...next,
            content: contentPartsToMessageContent(updatedNextParts),
        };
    }

    return result;
}

/**
 * Index of the assistant message that should receive streamed content for `messageId`.
 * Uses an exact id match when present; otherwise the last assistant (current streaming segment),
 * which covers events that reference an id before our list has caught up. Returns -1 if there is no assistant.
 */
function resolveStreamContentTargetIndex(messages: TChatMessage[], messageId: string): number {
    const byId = messages.findIndex((m) => m.id === messageId && m.role === 'assistant');
    if (byId >= 0) {
        return byId;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            return i;
        }
    }
    return -1;
}

function getResponseIdFromEvent(event: OpenAIStreamEventLike): string | null {
    const response = (event as {response?: unknown}).response;
    if (!response || typeof response !== 'object') {
        return null;
    }

    const id = (response as {id?: unknown}).id;
    return typeof id === 'string' ? id : null;
}

export function useOpenAIResponsesAdapter(response: OpenAIResponseLike | null): TChatMessage[] {
    return useMemo(() => openAIResponseToMessages(response), [response]);
}

export function useOpenAIStreamAdapter(
    stream: OpenAIStreamSource | null,
    options: OpenAIStreamAdapterOptions = {},
): OpenAIStreamAdapterResult {
    const {
        initialMessages = [],
        assistantMessageId: optionId,
        onStreamEnd,
        trackTokenUsage = false,
    } = options;
    const onStreamEndRef = useRef(onStreamEnd);
    onStreamEndRef.current = onStreamEnd;
    const initialMessagesRef = useRef(initialMessages);
    initialMessagesRef.current = initialMessages;

    // messageId → output_tokens from response.completed event
    const usageMapRef = useRef<Map<string, number>>(new Map());

    const [messages, setMessages] = useState<TChatMessage[]>(initialMessages);
    const [status, setStatus] = useState<OpenAIStreamAdapterResult['status']>('ready');
    const [error, setError] = useState<Error | null>(null);
    const [responseId, setResponseId] = useState<string | null>(null);

    const assistantMessageId = useMemo(() => optionId ?? `assistant-${Date.now()}`, [optionId]);

    useEffect(() => {
        if (!stream) {
            setStatus('ready');
            setError(null);
            setResponseId(null);
            return undefined;
        }

        const sourceStream: AsyncIterable<OpenAIStreamEventLike> = isFetchResponse(stream)
            ? fetchResponseToStreamEvents(stream)
            : stream;

        let cancelled = false;
        setStatus('streaming');
        setError(null);
        setResponseId(null);
        usageMapRef.current = new Map();

        const streamToConsume: AsyncIterable<OpenAIStreamEventLike> = {
            async *[Symbol.asyncIterator]() {
                for await (const event of sourceStream) {
                    const nextResponseId = getResponseIdFromEvent(event);
                    if (!cancelled && nextResponseId) {
                        setResponseId((prev) => (prev === nextResponseId ? prev : nextResponseId));
                    }

                    // Extract token usage from response.completed (only when opt-in)
                    if (trackTokenUsage) {
                        const e = event as Record<string, unknown>;
                        const eventType =
                            (e.type as string | undefined) ?? (e.event as string | undefined);
                        if (eventType === 'response.completed' && e.response) {
                            const response = e.response as {
                                usage?: {output_tokens?: number};
                                output?: Array<{id?: string; type?: string}>;
                            };
                            const tokens = response.usage?.output_tokens ?? 0;
                            if (tokens > 0) {
                                (response.output ?? []).forEach(({id, type}) => {
                                    if (id && type === 'message') {
                                        usageMapRef.current.set(id, tokens);
                                    }
                                });
                            }
                        }
                    }

                    yield event;
                }
            },
        };

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

        const injectUsageMetadata = (msgs: TChatMessage[]): TChatMessage[] => {
            if (usageMapRef.current.size === 0) return msgs;
            return msgs.map((msg) => {
                if (msg.role === 'assistant' && msg.id && usageMapRef.current.has(msg.id)) {
                    return {
                        ...msg,
                        metadata: {
                            ...msg.metadata,
                            outputTokens: usageMapRef.current.get(msg.id),
                        },
                    } as TAssistantMessage;
                }
                return msg;
            });
        };

        const callbacks: ConsumeStreamCallbacks = {
            baseMessages,
            getAssistantMessageId,
            // Provisional id from getAssistantMessageId → OpenAI item id once the stream provides it.
            onAssistantMessageIdResolved: (previousId, openaiItemId) => {
                if (cancelled) return;
                setMessages((prev) =>
                    collapseOrphanToolBetweenAssistantSegments(
                        prev.map((msg): TChatMessage => {
                            if (msg.id === previousId && msg.role === 'assistant') {
                                return {...msg, id: openaiItemId} as TAssistantMessage;
                            }
                            return msg;
                        }),
                    ),
                );
            },
            onContentUpdate: (messageId, content) => {
                if (cancelled) return;
                setMessages((prev) => {
                    const targetIndex = resolveStreamContentTargetIndex(prev, messageId);
                    if (targetIndex < 0) {
                        return collapseOrphanToolBetweenAssistantSegments(prev);
                    }
                    const mapped = prev.map((msg, i) => {
                        if (i !== targetIndex) {
                            return msg;
                        }
                        return {...msg, content} as TAssistantMessage;
                    });
                    return collapseOrphanToolBetweenAssistantSegments(mapped);
                });
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
                setStatus(s === 'done' ? 'ready' : s);
                setError(err ?? null);
                const normalized = injectUsageMetadata(
                    collapseOrphanToolBetweenAssistantSegments(finalMessages),
                );
                if (!cancelled) {
                    setMessages(normalized);
                }
                onStreamEndRef.current?.(normalized);
            },
            getIsCancelled: () => cancelled,
        };

        consumeOpenAIStream(streamToConsume, callbacks);

        return () => {
            cancelled = true;
        };
    }, [stream, assistantMessageId]);

    return {messages, status, error, responseId};
}
