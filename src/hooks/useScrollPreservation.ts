import {type RefObject, useEffect, useLayoutEffect, useRef} from 'react';

/**
 * Hook to preserve scroll position when older messages are loaded at the top
 * This prevents the chat from jumping when new content is prepended
 * @param {RefObject<T>} containerRef - Reference to the scrollable container element
 * @param {number} messagesCount - Current count of messages in the list
 * @returns {void}
 */
export function useScrollPreservation<T extends HTMLElement>(
    containerRef: RefObject<T>,
    messagesCount: number,
) {
    const prevMessagesCount = useRef(messagesCount);
    // Distance from the top of the viewport to the bottom of the content (`scrollHeight - scrollTop`).
    // It is invariant when content is prepended above the viewport, so restoring it after a prepend
    // keeps the visible content anchored. We capture it continuously (on scroll) rather than from a
    // height snapshot taken on the previous message-count change: a stale snapshot - e.g. taken
    // before fonts/markdown reflow settle - makes the delta over-correct and the list jump.
    const bottomGapRef = useRef<number | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const captureGap = () => {
            bottomGapRef.current = container.scrollHeight - container.scrollTop;
        };

        captureGap();
        container.addEventListener('scroll', captureGap, {passive: true});
        return () => {
            container.removeEventListener('scroll', captureGap);
        };
    }, [containerRef]);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        // Only adjust scroll if messages were added at the top (older messages loaded). Restore the
        // captured distance from the bottom so the previously-visible content stays in place. Native
        // scroll anchoring (`overflow-anchor`) is disabled on the container so it doesn't also shift.
        if (
            bottomGapRef.current !== null &&
            messagesCount > prevMessagesCount.current &&
            prevMessagesCount.current > 0
        ) {
            container.scrollTop = container.scrollHeight - bottomGapRef.current;
        }

        prevMessagesCount.current = messagesCount;
        bottomGapRef.current = container.scrollHeight - container.scrollTop;
    }, [containerRef, messagesCount]);
}
