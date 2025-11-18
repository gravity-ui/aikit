import {type RefObject, useCallback, useEffect, useRef, useState} from 'react';

export interface UseSmartScrollReturn<T extends HTMLElement> {
    containerRef: RefObject<T>;
    endRef: RefObject<T>;
    scrollToBottom: () => void;
}

const SCROLL_THRESHOLD = 10;

export function useSmartScroll<T extends HTMLElement>(
    isStreaming = false,
    messagesCount = 0,
): UseSmartScrollReturn<T> {
    const containerRef = useRef<T>(null);
    const endRef = useRef<T>(null);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const prevMessagesCount = useRef(messagesCount);

    const checkIfUserScrolledUp = useCallback(() => {
        const container = containerRef.current;
        if (!container) return false;

        const {scrollTop, scrollHeight, clientHeight} = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        return distanceFromBottom > SCROLL_THRESHOLD;
    }, []);

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = 'instant') => {
            if (!userScrolledUp) {
                const end = endRef.current;
                if (end) {
                    end.scrollIntoView({behavior, block: 'end'});
                }
            }
        },
        [userScrolledUp],
    );

    // Handle user scroll events
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const handleScroll = () => {
            const scrolledUp = checkIfUserScrolledUp();
            setUserScrolledUp(scrolledUp);
        };

        container.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [checkIfUserScrolledUp]);

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
    }, [isStreaming, scrollToBottom]);

    // Handle new messages
    useEffect(() => {
        if (messagesCount > prevMessagesCount.current) {
            scrollToBottom('smooth');
        }
        prevMessagesCount.current = messagesCount;
    }, [messagesCount, scrollToBottom]);

    return {
        containerRef,
        endRef,
        scrollToBottom,
    };
}
