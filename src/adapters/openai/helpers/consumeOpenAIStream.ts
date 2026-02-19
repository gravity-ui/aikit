import type {TAssistantMessage, TChatMessage, TMessageContentUnion} from '../../../types';
import type {OpenAIStreamEventLike} from '../types';

import {applyContentUpdate} from './applyContentUpdate';
import {buildFinalMessages} from './buildFinalMessages';
import {contentPartsToMessageContent} from './contentPartsToMessageContent';
import {getStreamErrorMessage} from './getStreamErrorMessage';
import {getStreamEventContentUpdate} from './getStreamEventContentUpdate';
import {isMessageOutputItemDoneEvent} from './isMessageOutputItemDoneEvent';
import {isStreamEndOrErrorEvent} from './isStreamEndOrErrorEvent';

export type ConsumeStreamCallbacks = {
    baseMessages: TChatMessage[];
    getAssistantMessageId: (index: number) => string;
    onContentUpdate: (messageId: string, content: TAssistantMessage['content']) => void;
    onNewMessage: (messageId: string) => void;
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
        onContentUpdate,
        onNewMessage,
        onEnd,
        getIsCancelled,
    } = callbacks;

    const completedAssistantMessages: {id: string; content: TAssistantMessage['content']}[] = [];
    let messageIndex = 0;
    let currentAssistantMessageId = getAssistantMessageId(0);
    let contentParts: TMessageContentUnion[] = [];

    const applyContentToCurrentMessage = (parts: TMessageContentUnion[]) => {
        if (getIsCancelled()) return;
        onContentUpdate(currentAssistantMessageId, contentPartsToMessageContent(parts));
    };

    try {
        for await (const event of stream) {
            if (getIsCancelled()) return;

            if (isStreamEndOrErrorEvent(event)) {
                const e = event as Record<string, unknown>;
                const finalMessages = buildFinalMessages({
                    baseMessages,
                    completedAssistantMessages,
                    currentAssistantMessageId,
                    contentParts,
                });
                if (e.type === 'error' || e.event === 'error' || e.error) {
                    if (getIsCancelled()) return;
                    onEnd(finalMessages, 'error', new Error(getStreamErrorMessage(e)));
                } else {
                    if (getIsCancelled()) return;
                    onEnd(finalMessages, 'done');
                }
                return;
            }

            if (isMessageOutputItemDoneEvent(event)) {
                completedAssistantMessages.push({
                    id: currentAssistantMessageId,
                    content: contentPartsToMessageContent(contentParts),
                });
                messageIndex += 1;
                currentAssistantMessageId = getAssistantMessageId(messageIndex);
                contentParts = [];
                if (getIsCancelled()) return;
                onNewMessage(currentAssistantMessageId);
                continue;
            }

            const update = getStreamEventContentUpdate(event);
            if (!update) continue;

            const nextParts = applyContentUpdate(contentParts, update);
            if (nextParts !== null) {
                contentParts = nextParts;
                applyContentToCurrentMessage(contentParts);
            }
        }

        if (!getIsCancelled()) {
            const finalMessages = buildFinalMessages({
                baseMessages,
                completedAssistantMessages,
                currentAssistantMessageId,
                contentParts,
            });
            onEnd(finalMessages, 'done');
        }
    } catch (err) {
        if (!getIsCancelled()) {
            const finalMessages = buildFinalMessages({
                baseMessages,
                completedAssistantMessages,
                currentAssistantMessageId,
                contentParts,
            });
            onEnd(finalMessages, 'error', err instanceof Error ? err : new Error(String(err)));
        }
    }
}
