import {type RefObject, useCallback, useEffect, useRef} from 'react';

import type {ChatStatus} from '../types';
import {observeScrollContent} from '../utils/observeScrollContent';

import {useChatScrollActivity} from './useChatScrollActivity';

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
    const active = useChatScrollActivity(containerRef, userScrolledUpRef);
    const activeRef = useRef(active);
    activeRef.current = active;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
        if (activeRef.current && !userScrolledUpRef.current) {
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
    }, [active]);

    // Handle user scroll events
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !active) {
            return undefined;
        }

        const handleScroll = () => {
            if (!container || !activeRef.current) {
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
    }, [active]);

    // Keep pinned after delayed content renders as well as viewport changes,
    // even when the response has already finished streaming.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !active || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        return observeScrollContent(container, () => scrollToBottom('instant'));
    }, [scrollToBottom, active]);

    // Handle DOM mutations during streaming
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !active || !isStreaming) {
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
    }, [isStreaming, active]);

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
