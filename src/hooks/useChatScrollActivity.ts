import {type MutableRefObject, type RefObject, useLayoutEffect, useRef} from 'react';

import {observeScrollContent} from '../utils/observeScrollContent';

import {useChatViewActivity} from './ChatViewActivity';

/** Keep a reader's anchor while a screen is hidden, without changing follow-end intent. */
export function useChatScrollActivity(
    containerRef: RefObject<HTMLElement | null>,
    userScrolledUpRef: MutableRefObject<boolean>,
    instance?: unknown,
    revealAnchor?: (id: string) => void,
) {
    const {active, conversationKey, trackScroll} = useChatViewActivity();
    const revealAnchorRef = useRef(revealAnchor);
    revealAnchorRef.current = revealAnchor;
    const previous = useRef({active, conversationKey});
    const snapshot = useRef<{top: number; id?: string; offset: number}>();
    const restoreTarget = useRef<
        NonNullable<typeof snapshot.current> & {
            revealing?: boolean;
            revealTop?: number;
            stableFrames?: number;
        }
    >();
    useLayoutEffect(() => {
        const container = containerRef.current;
        const changedConversation = previous.current.conversationKey !== conversationKey;
        const becameVisible = active && !previous.current.active;
        previous.current = {active, conversationKey};
        if (changedConversation) {
            snapshot.current = undefined;
            restoreTarget.current = undefined;
            // Scroll intent belongs to the conversation, not to this mounted DOM node.
            // eslint-disable-next-line no-param-reassign
            userScrolledUpRef.current = false;
        }
        if (!active) {
            restoreTarget.current = undefined;
        }
        if (!container || !active || !trackScroll) {
            return undefined;
        }
        let restoring = false;
        let frameId = 0;
        let captureFrameId = 0;
        const capture = () => {
            if (restoring) {
                return;
            }
            const top = container.getBoundingClientRect().top;
            const rows = container.querySelectorAll<HTMLElement>('[data-message-id]');
            let left = 0;
            let right = rows.length;
            while (left < right) {
                const middle = Math.floor((left + right) / 2);
                if (rows[middle].getBoundingClientRect().bottom <= top) {
                    left = middle + 1;
                } else {
                    right = middle;
                }
            }
            const anchor = rows[left];
            snapshot.current = {
                top: container.scrollTop,
                id: anchor?.dataset.messageId,
                offset: anchor ? anchor.getBoundingClientRect().top - top : 0,
            };
        };
        const saved: typeof restoreTarget.current =
            restoreTarget.current ??
            (becameVisible && userScrolledUpRef.current ? snapshot.current : undefined);
        if (saved) {
            restoring = true;
            if (!restoreTarget.current) {
                container.scrollTop = saved.top;
            }
            // react-window replaces its imperative API as rows are remeasured. Keep the
            // target across those effect restarts rather than capturing an intermediate row.
            restoreTarget.current = saved;
            let frame = 0;
            // Virtualized rows are measured after paint. Reapply the logical anchor while
            // those measurements settle instead of preserving an obsolete pixel offset.
            const restore = () => {
                const anchor = Array.from(
                    container.querySelectorAll<HTMLElement>('[data-message-id]'),
                ).find((element) => element.dataset.messageId === saved.id);
                if (anchor) {
                    const top =
                        anchor.getBoundingClientRect().top - container.getBoundingClientRect().top;
                    if (saved.revealing) {
                        // Newer react-window releases keep aligning a revealed dynamic row.
                        // Let that alignment settle before restoring the intra-row offset.
                        saved.stableFrames =
                            saved.revealTop !== undefined && Math.abs(top - saved.revealTop) < 1
                                ? (saved.stableFrames ?? 0) + 1
                                : 0;
                        saved.revealTop = top;
                        if (saved.stableFrames >= 3) {
                            saved.revealing = false;
                        }
                    }
                    if (!saved.revealing) {
                        container.scrollTop += top - saved.offset;
                    }
                } else if (saved.id !== undefined) {
                    // A hidden prepend can move the anchor outside the virtual window.
                    // Reveal its current row before applying the saved intra-message offset.
                    if (!saved.revealing) {
                        saved.revealing = true;
                        saved.revealTop = undefined;
                        saved.stableFrames = 0;
                        revealAnchorRef.current?.(saved.id);
                    }
                }
                frame += 1;
                if (frame < 30) {
                    frameId = requestAnimationFrame(restore);
                } else {
                    restoring = false;
                    restoreTarget.current = undefined;
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
            restoreTarget.current = undefined;
        };
        // react-window commits its rendered window after the native scroll event.
        // Refresh the anchor after that commit and after subsequent row measurements.
        const handleScroll = () => {
            capture();
            cancelAnimationFrame(captureFrameId);
            captureFrameId = requestAnimationFrame(() => {
                captureFrameId = requestAnimationFrame(capture);
            });
        };
        const stopObserving = observeScrollContent(container, capture);
        container.addEventListener('scroll', handleScroll, {passive: true});
        container.addEventListener('wheel', stopRestoring, {passive: true});
        container.addEventListener('pointerdown', stopRestoring, {passive: true});
        return () => {
            cancelAnimationFrame(frameId);
            cancelAnimationFrame(captureFrameId);
            stopObserving();
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('wheel', stopRestoring);
            container.removeEventListener('pointerdown', stopRestoring);
        };
    }, [active, conversationKey, containerRef, userScrolledUpRef, instance, trackScroll]);
    return active;
}
