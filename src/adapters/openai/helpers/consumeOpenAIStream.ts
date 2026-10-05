import type {TAssistantMessage, TChatMessage, TMessageContentUnion} from '../../../types';
import type {OpenAIStreamEventLike} from '../types';

import {applyContentUpdate} from './applyContentUpdate';
import {buildFinalMessages} from './buildFinalMessages';
import {contentPartsToMessageContent} from './contentPartsToMessageContent';
import {getOpenAIMessageItemIdFromOutputItemAdded} from './getOpenAIMessageItemIdFromOutputItemAdded';
import {getStreamEndResult} from './getStreamEndResult';
import {getStreamEventContentUpdate} from './getStreamEventContentUpdate';
import {isStreamEndOrErrorEvent} from './isStreamEndOrErrorEvent';

function waitForNextTask(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function shouldYieldAfterUpdate(update: ReturnType<typeof getStreamEventContentUpdate>): boolean {
    return update?.kind === 'tool_add' && (update.status ?? 'loading') === 'loading';
}

export type ConsumeStreamCallbacks = {
    baseMessages: TChatMessage[];
    getAssistantMessageId: () => string;
    /** When the API sends `response.output_item.added` for a message, exposes OpenAI item id (e.g. msg-cc-…) for reactions. */
    onAssistantMessageIdResolved?: (previousId: string, openaiItemId: string) => void;
    onContentUpdate: (messageId: string, content: TAssistantMessage['content']) => void;
    onEnd: (finalMessages: TChatMessage[], status: 'done' | 'error', error?: Error) => void;
    getIsCancelled: () => boolean;
};

/** Consumes stream, invokes callbacks. State/setters live in caller. */

export async function consumeOpenAIStream(
    stream: AsyncIterable<OpenAIStreamEventLike>,
    callbacks: ConsumeStreamCallbacks,
): Promise<void> {
    const {
        baseMessages,
        getAssistantMessageId,
        onAssistantMessageIdResolved,
        onContentUpdate,
        onEnd,
        getIsCancelled,
    } = callbacks;

    let currentAssistantMessageId = getAssistantMessageId();
    let assistantMessageItemIdResolved = false;
    let contentParts: TMessageContentUnion[] = [];

    const applyContentToCurrentMessage = (parts: TMessageContentUnion[]) => {
        if (getIsCancelled()) return;
        onContentUpdate(currentAssistantMessageId, contentPartsToMessageContent(parts));
    };

    const resolveAssistantMessageId = (openaiMessageItemId: string) => {
        if (assistantMessageItemIdResolved) return;
        assistantMessageItemIdResolved = true;
        if (openaiMessageItemId === currentAssistantMessageId) return;

        const previousId = currentAssistantMessageId;
        currentAssistantMessageId = openaiMessageItemId;
        if (!getIsCancelled()) {
            onAssistantMessageIdResolved?.(previousId, openaiMessageItemId);
        }
    };

    try {
        for await (const event of stream) {
            if (getIsCancelled()) return;

            const openaiMessageItemId = getOpenAIMessageItemIdFromOutputItemAdded(event);
            if (openaiMessageItemId) {
                resolveAssistantMessageId(openaiMessageItemId);
                continue;
            }

            if (isStreamEndOrErrorEvent(event)) {
                const finalMessages = buildFinalMessages({
                    baseMessages,
                    currentAssistantMessageId,
                    contentParts,
                });
                const endResult = getStreamEndResult(event);
                if (getIsCancelled()) return;
                onEnd(
                    finalMessages,
                    endResult.status,
                    endResult.status === 'error' ? endResult.error : undefined,
                );
                return;
            }

            const update = getStreamEventContentUpdate(event);
            if (!update) continue;

            const nextParts = applyContentUpdate(contentParts, update);
            if (nextParts !== null) {
                contentParts = nextParts;
                applyContentToCurrentMessage(contentParts);
                if (shouldYieldAfterUpdate(update)) {
                    await waitForNextTask();
                    if (getIsCancelled()) return;
                }
            }
        }

        if (!getIsCancelled()) {
            const finalMessages = buildFinalMessages({
                baseMessages,
                currentAssistantMessageId,
                contentParts,
            });
            onEnd(finalMessages, 'done');
        }
    } catch (err) {
        if (!getIsCancelled()) {
            const finalMessages = buildFinalMessages({
                baseMessages,
                currentAssistantMessageId,
                contentParts,
            });
            onEnd(finalMessages, 'error', err instanceof Error ? err : new Error(String(err)));
        }
    }
}
