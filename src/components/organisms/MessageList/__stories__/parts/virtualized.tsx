import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';

import {defaultDecorators} from './shared';

/**
 * Demonstrates `assistantExtraInfo` — a React component that receives the message
 * and renders contextual info alongside the action buttons.
 * Token count comes from `message.metadata.outputTokens`, which
 * `useOpenAIStreamAdapter` populates when `trackTokenUsage: true`.
 */
/**
 * Demonstrates windowed rendering for very large histories via the `virtualized` prop.
 *
 * With `virtualized` enabled, react-window renders only the rows currently in (and near) the
 * viewport, so a chat with thousands of messages keeps a roughly constant number of DOM nodes.
 * Row heights are measured dynamically, and the list stays pinned to the bottom while streaming
 * unless the user scrolls up. The prop is off by default to preserve the standard rendering path.
 */
export const Virtualized: StoryObj<MessageListProps> = {
    render: (args) => {
        const manyMessages: Array<TUserMessage | TAssistantMessage> = Array.from(
            {length: 2000},
            (_, i) => {
                const isUser = i % 2 === 0;
                return isUser
                    ? {
                          id: `user-${i}`,
                          role: 'user' as const,
                          timestamp: '2024-01-01T00:00:00Z',
                          content: `User message #${i + 1}: can you help me with task ${i + 1}?`,
                      }
                    : {
                          id: `assistant-${i}`,
                          role: 'assistant' as const,
                          timestamp: '2024-01-01T00:00:01Z',
                          content: `Assistant response #${i + 1}: sure, here is a detailed answer for task ${i + 1}. ${'More context. '.repeat((i % 5) + 1)}`,
                      };
            },
        );

        return (
            <ShowcaseItem title="Virtualized (2000 messages)">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList {...args} messages={manyMessages} virtualized />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

// Test hooks exposed by the deterministic virtualization harness stories below. They let the
// Playwright behavioral tests drive prepend/streaming without timers or Math.random(), so the
// scroll assertions are reproducible. See MessageList.visual.spec.tsx.
declare global {
    interface Window {
        /** Appends text to the streaming (last) message of {@link VirtualizedStreaming}. */
        __appendStreamChunk?: (text: string) => void;
        /** Prepends a fixed batch of older messages in {@link VirtualizedWithPreviousMessages}. */
        __loadPreviousMessages?: () => void;
    }
}

/**
 * Virtualized list that loads older messages when the user scrolls to the top.
 *
 * Starts with messages 11-40; scrolling to the top triggers the load-more intersection, which
 * prepends messages 1-10 after a short delay (then there are no more). The viewport stays anchored
 * to the previously-visible message instead of jumping. `window.__loadPreviousMessages()` is also
 * exposed so the Playwright tests can trigger the same load deterministically.
 */
export const VirtualizedWithPreviousMessages: StoryObj<MessageListProps> = {
    render: (args) => {
        const makeMessage = (num: number): TUserMessage => ({
            id: `msg-${num}`,
            role: 'user',
            timestamp: '2024-01-01T00:00:00Z',
            content: `Message ${num}`,
        });

        const [messages, setMessages] = useState<TUserMessage[]>(() =>
            Array.from({length: 30}, (_, i) => makeMessage(11 + i)),
        );
        const [hasMore, setHasMore] = useState(true);
        const loadingRef = useRef(false);

        const loadPrevious = useCallback(() => {
            if (loadingRef.current || !hasMore) {
                return;
            }
            loadingRef.current = true;

            setTimeout(() => {
                setMessages((prev) => [
                    ...Array.from({length: 10}, (_, i) => makeMessage(1 + i)),
                    ...prev,
                ]);
                setHasMore(false);
                loadingRef.current = false;
            }, 500);
        }, [hasMore]);

        useEffect(() => {
            window.__loadPreviousMessages = loadPrevious;
            return () => {
                delete window.__loadPreviousMessages;
            };
        }, [loadPrevious]);

        return (
            <ShowcaseItem title="Virtualized — load previous messages">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        {...args}
                        messages={messages}
                        virtualized
                        hasPreviousMessages={hasMore}
                        onLoadPreviousMessages={loadPrevious}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

const STREAM_TEXT =
    'This is a simulated streaming response inside a virtualized list. As the text streams in word ' +
    'by word, the windowed list keeps a constant number of DOM nodes while staying pinned to the ' +
    'bottom, unless you scroll up.';
const STREAM_WORDS = STREAM_TEXT.split(' ');

/**
 * Virtualized list whose last message streams in word by word (looping) so the stick-to-bottom
 * behavior is visible in Storybook. `window.__appendStreamChunk(text)` is also exposed for the
 * Playwright tests; calling it stops the auto-stream so the tests drive the growth deterministically.
 * The leading messages are memoized so only the last row's reference changes on each chunk,
 * exercising the in-place row-growth path.
 */
export const VirtualizedStreaming: StoryObj<MessageListProps> = {
    render: (args) => {
        const baseMessages = useMemo<Array<TUserMessage | TAssistantMessage>>(
            () =>
                Array.from({length: 20}, (_, i) =>
                    i % 2 === 0
                        ? {
                              id: `u-${i}`,
                              role: 'user' as const,
                              timestamp: '2024-01-01T00:00:00Z',
                              content: `User message ${i + 1}`,
                          }
                        : {
                              id: `a-${i}`,
                              role: 'assistant' as const,
                              timestamp: '2024-01-01T00:00:01Z',
                              content: `Assistant response ${i + 1}`,
                          },
                ),
            [],
        );

        const [streamed, setStreamed] = useState(STREAM_WORDS[0]);
        const autoStreamRef = useRef<ReturnType<typeof setInterval>>();

        const appendChunk = useCallback((text: string) => {
            // Manual control (the Playwright tests) takes over from the auto-stream.
            clearInterval(autoStreamRef.current);
            setStreamed((prev) => prev + text);
        }, []);

        useEffect(() => {
            window.__appendStreamChunk = appendChunk;
            return () => {
                delete window.__appendStreamChunk;
            };
        }, [appendChunk]);

        // Auto-stream the response word by word, looping, so the story keeps streaming on screen.
        useEffect(() => {
            let index = 0;
            autoStreamRef.current = setInterval(() => {
                if (index >= STREAM_WORDS.length) {
                    index = 0;
                }
                const wordIndex = index;
                setStreamed((prev) =>
                    wordIndex === 0 ? STREAM_WORDS[0] : `${prev} ${STREAM_WORDS[wordIndex]}`,
                );
                index += 1;
            }, 150);
            return () => clearInterval(autoStreamRef.current);
        }, []);

        const messages: Array<TUserMessage | TAssistantMessage> = [
            ...baseMessages,
            {
                id: 'streaming',
                role: 'assistant',
                timestamp: '2024-01-01T00:00:02Z',
                content: streamed,
            },
        ];

        return (
            <ShowcaseItem title="Virtualized — streaming">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList {...args} messages={messages} virtualized status="streaming" />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};
