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
}: {
    isStreaming?: boolean;
    messagesCount: number;
    status?: ChatStatus;
}): UseSmartScrollReturn<T> {
    const containerRef = useRef<T>(null);
    const userScrolledUpRef = useRef(false);

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

    // Initial scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, []);

    // Handle user scroll events
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

        const observer = new ResizeObserver(() => scrollToBottom('instant'));
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [scrollToBottom]);

    // Handle DOM mutations during streaming
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isStreaming) {
            return undefined;
        }

        const observer = new MutationObserver(() => {
            scrollToBottom('instant');
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
    }, [isStreaming]);

    // Handle status changes
    useEffect(() => {
        scrollToBottom('smooth');
    }, [status]);

    useEffect(() => {
        if (messagesCount) {
            scrollToBottom('smooth');
        }
    }, [messagesCount]);

    return {
        containerRef,
        scrollToBottom,
    };
}
