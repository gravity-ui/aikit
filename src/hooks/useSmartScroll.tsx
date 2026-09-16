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
    //
    // The children are observed alongside the container, because a re-layout can change the
    // content height while the container's own box stays the same: the messages re-wrap, the
    // browser keeps `scrollTop`, and the list ends up in the middle of the history with nothing
    // to bring it back - `scroll` never fires, since `scrollTop` itself did not move. iOS Safari
    // does exactly that while the system snapshots the page for a screenshot. The children span
    // the whole scrollable content, so their heights are what `scrollHeight` is made of.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(() => scrollToBottom('instant'));
        observer.observe(container);

        // Only the difference is (un)observed: `observe()` re-delivers the current size for an
        // already observed target, which would re-pin the list on every DOM mutation.
        const observedChildren = new Set<Element>();

        const syncObservedChildren = () => {
            const children = new Set<Element>(Array.from(container.children));

            for (const child of children) {
                if (!observedChildren.has(child)) {
                    observer.observe(child);
                    observedChildren.add(child);
                }
            }

            for (const child of observedChildren) {
                if (!children.has(child)) {
                    observer.unobserve(child);
                    observedChildren.delete(child);
                }
            }
        };

        syncObservedChildren();

        const childrenObserver =
            typeof MutationObserver === 'undefined'
                ? undefined
                : new MutationObserver(syncObservedChildren);

        childrenObserver?.observe(container, {childList: true});

        return () => {
            observer.disconnect();
            childrenObserver?.disconnect();
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
