import {
    type MutableRefObject,
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
} from 'react';

import type {ChatStatus} from '../types';
import {observeScrollContent} from '../utils/observeScrollContent';

import {useChatScrollActivity} from './useChatScrollActivity';

export interface UseSmartScrollReturn<T extends HTMLElement> {
    containerRef: RefObject<T>;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/** Reading position retained by the host across message-list mounts. */
export interface MessageListScrollPosition {
    scrollTop: number;
    /** Follow new content on restore when the reader was at the bottom. */
    isAtBottom: boolean;
}

export type MessageListScrollPositionRef = MutableRefObject<MessageListScrollPosition | undefined>;

const SCROLL_THRESHOLD = 10;

export function useSmartScroll<T extends HTMLElement>({
    isStreaming = false,
    messagesCount,
    status,
    scrollPositionRef,
}: {
    isStreaming?: boolean;
    messagesCount: number;
    status?: ChatStatus;
    scrollPositionRef?: MessageListScrollPositionRef;
}): UseSmartScrollReturn<T> {
    const positionRef = scrollPositionRef;
    const containerRef = useRef<T>(null);
    const userScrolledUpRef = useRef(false);
    const active = useChatScrollActivity(containerRef, userScrolledUpRef);
    const activeRef = useRef(active);
    activeRef.current = active;

    const pendingRestoreTopRef = useRef<number>();

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
        if (!activeRef.current) {
            return;
        }
        const pendingTop = pendingRestoreTopRef.current;
        const currentContainer = containerRef.current;
        if (pendingTop !== undefined && currentContainer) {
            currentContainer.scrollTop = pendingTop;
            if (currentContainer.scrollTop >= pendingTop) {
                pendingRestoreTopRef.current = undefined;
            }
            return;
        }
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

    // Restore before paint, including whether streaming should keep following the bottom.
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !positionRef) {
            return undefined;
        }
        const position = positionRef?.current;
        userScrolledUpRef.current = position ? !position.isAtBottom : false;
        pendingRestoreTopRef.current =
            position && !position.isAtBottom ? position.scrollTop : undefined;
        container.scrollTop =
            position && !position.isAtBottom ? position.scrollTop : container.scrollHeight;
        return () => {
            if (positionRef && activeRef.current) {
                positionRef.current = {
                    scrollTop: pendingRestoreTopRef.current ?? container.scrollTop,
                    isAtBottom: !userScrolledUpRef.current,
                };
            }
        };
    }, [positionRef]);
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
            const pendingTop = pendingRestoreTopRef.current;
            if (pendingTop !== undefined) {
                const availableTop = Math.max(0, scrollHeight - clientHeight);
                if (scrollTop === Math.min(pendingTop, availableTop)) {
                    return;
                }
                // A user scroll cancels a pending restore while delayed content is rendering.
                pendingRestoreTopRef.current = undefined;
            }
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            const scrolledUp = distanceFromBottom > SCROLL_THRESHOLD;
            userScrolledUpRef.current = scrolledUp;
            if (positionRef) {
                positionRef.current = {scrollTop, isAtBottom: !scrolledUp};
            }
        };

        container.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [positionRef, active]);

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
