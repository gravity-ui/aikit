import {type MutableRefObject, type RefObject, useLayoutEffect, useRef} from 'react';

import {useChatViewActivity} from './ChatViewActivity';

/** Keep a reader's anchor while a screen is hidden, without changing follow-end intent. */
export function useChatScrollActivity(
    containerRef: RefObject<HTMLElement | null>,
    userScrolledUpRef: MutableRefObject<boolean>,
    instance?: unknown,
) {
    const {active, conversationKey} = useChatViewActivity();
    const previous = useRef({active, conversationKey});
    const snapshot = useRef<{top: number; id?: string; offset: number}>();
    useLayoutEffect(() => {
        const container = containerRef.current;
        const changedConversation = previous.current.conversationKey !== conversationKey;
        const becameVisible = active && !previous.current.active;
        previous.current = {active, conversationKey};
        if (changedConversation) {
            snapshot.current = undefined;
            // Scroll intent belongs to the conversation, not to this mounted DOM node.
            // eslint-disable-next-line no-param-reassign
            userScrolledUpRef.current = false;
        }
        if (!container || !active) {
            return undefined;
        }
        let restoring = false;
        let frameId = 0;
        const capture = () => {
            if (restoring) {
                return;
            }
            const top = container.getBoundingClientRect().top;
            const anchor = Array.from(
                container.querySelectorAll<HTMLElement>('[data-message-id]'),
            ).find((element) => element.getBoundingClientRect().bottom > top);
            snapshot.current = {
                top: container.scrollTop,
                id: anchor?.dataset.messageId,
                offset: anchor ? anchor.getBoundingClientRect().top - top : 0,
            };
        };
        if (becameVisible && snapshot.current && userScrolledUpRef.current) {
            const saved = snapshot.current;
            restoring = true;
            container.scrollTop = saved.top;
            let frame = 0;
            // Virtualized rows are measured after paint. Reapply the logical anchor while
            // those measurements settle instead of preserving an obsolete pixel offset.
            const restore = () => {
                const anchor = Array.from(
                    container.querySelectorAll<HTMLElement>('[data-message-id]'),
                ).find((element) => element.dataset.messageId === saved.id);
                if (anchor) {
                    container.scrollTop +=
                        anchor.getBoundingClientRect().top -
                        container.getBoundingClientRect().top -
                        saved.offset;
                }
                frame += 1;
                if (frame < 8) {
                    frameId = requestAnimationFrame(restore);
                } else {
                    restoring = false;
                    capture();
                }
            };
            restore();
        } else {
            capture();
        }
        const stopRestoring = () => {
            cancelAnimationFrame(frameId);
            restoring = false;
        };
        container.addEventListener('scroll', capture, {passive: true});
        container.addEventListener('wheel', stopRestoring, {passive: true});
        container.addEventListener('pointerdown', stopRestoring, {passive: true});
        return () => {
            cancelAnimationFrame(frameId);
            container.removeEventListener('scroll', capture);
            container.removeEventListener('wheel', stopRestoring);
            container.removeEventListener('pointerdown', stopRestoring);
        };
    }, [active, conversationKey, containerRef, userScrolledUpRef, instance]);
    return active;
}
