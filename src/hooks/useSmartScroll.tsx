import {type RefObject, useCallback, useEffect, useRef} from 'react';

import type {ChatStatus} from '../types';

export interface UseSmartScrollReturn<T extends HTMLElement> {
    containerRef: RefObject<T>;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const SCROLL_THRESHOLD = 10;

export function useSmartScroll<T extends HTMLElement>({
    isStreaming = false,
    messagesCount,
    status,
    autoScroll = true,
}: {
    isStreaming?: boolean;
    messagesCount: number;
    status?: ChatStatus;
    /**
     * Keep the container pinned to the bottom automatically. Set to `false` to leave the scroll
     * position entirely under the user's control. Never gates the returned `scrollToBottom`.
     *
     * @default true
     */
    autoScroll?: boolean;
}): UseSmartScrollReturn<T> {
    const containerRef = useRef<T>(null);
    const userScrolledUpRef = useRef(false);
    // Read at fire time rather than through effect dependencies, so that toggling the flag does
    // not re-run - and so re-fire - the effects below.
    const autoScrollRef = useRef(autoScroll);
    autoScrollRef.current = autoScroll;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
        if (!userScrolledUpRef.current) {
            const container = containerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior,
                });
            }
        }
    }, []);

    // Entry point for the automatic triggers. `scrollToBottom` itself stays ungated so consumers
    // can keep driving the scroll imperatively while automatic scrolling is off.
    const autoScrollToBottom = useCallback(
        (behavior: ScrollBehavior = 'instant') => {
            if (autoScrollRef.current) {
                scrollToBottom(behavior);
            }
        },
        [scrollToBottom],
    );

    // Initial scroll to bottom
    useEffect(() => {
        autoScrollToBottom();
    }, []);

    // Handle user scroll events. Never gated: this tracks user intent, and it has to stay accurate
    // while auto-scroll is off so that re-enabling it later does not resume from a stale state.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const handleScroll = () => {
            if (!container) {
                return;
            }

            const {scrollTop, scrollHeight, clientHeight} = container;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            const scrolledUp = distanceFromBottom > SCROLL_THRESHOLD;
            userScrolledUpRef.current = scrolledUp;
        };

        container.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Keep the last message visible when the scroll viewport itself shrinks - the on-screen
    // keyboard opening on mobile is the common case. The browser preserves `scrollTop`, so the
    // bottom of the list would otherwise slide out of view.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(() => autoScrollToBottom('instant'));
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [autoScrollToBottom]);

    // Handle DOM mutations during streaming
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isStreaming) {
            return undefined;
        }

        const observer = new MutationObserver(() => {
            autoScrollToBottom('instant');
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });

        return () => {
            observer.disconnect();
        };
    }, [isStreaming, autoScrollToBottom]);

    // Handle status changes
    useEffect(() => {
        autoScrollToBottom('smooth');
    }, [status, autoScrollToBottom]);

    useEffect(() => {
        if (messagesCount) {
            autoScrollToBottom('smooth');
        }
    }, [messagesCount, autoScrollToBottom]);

    return {
        containerRef,
        scrollToBottom,
    };
}
