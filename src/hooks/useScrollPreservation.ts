import {type RefObject, useLayoutEffect, useRef} from 'react';

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
    const prevScrollHeight = useRef(0);
    const prevMessagesCount = useRef(messagesCount);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const currentScrollHeight = container.scrollHeight;

        // Only adjust scroll if messages were added at the top (older messages loaded)
        if (
            prevScrollHeight.current > 0 &&
            messagesCount > prevMessagesCount.current &&
            currentScrollHeight > prevScrollHeight.current
        ) {
            // Calculate the height difference and adjust scroll position
            const heightDiff = currentScrollHeight - prevScrollHeight.current;
            container.scrollTop += heightDiff;
        }

        prevScrollHeight.current = currentScrollHeight;
        prevMessagesCount.current = messagesCount;
    }, [containerRef, messagesCount]);
}
