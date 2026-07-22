import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {useListCallbackRef} from 'react-window';

import type {ChatStatus} from '../types';

const SCROLL_THRESHOLD = 10;
// Number of animation frames over which a scroll correction is re-applied. react-window measures
// rows after paint (ResizeObserver -> state update -> re-render) and keys heights by row index, so
// both pinning to the bottom and restoring an anchor must be re-applied until the heights settle.
const REANCHOR_FRAMES = 8;
// Minimum time the prepend shimmer overlay stays up. The scroll restore itself settles in a few
// frames, but react-window paints the wrong window for a frame in between; a shimmer covers that
// transition. Keeping it up a touch longer makes it read as an intentional loading animation
// rather than a blink.
const PREPEND_SHIMMER_MS = 320;

export interface UseVirtualStickToBottomParams {
    /** Total number of rows rendered by the list, including non-message header rows. */
    rowCount: number;
    /** Whether a response is currently streaming (keep pinned to the growing last row). */
    isStreaming?: boolean;
    status?: ChatStatus;
    /** Current number of messages (drives auto-scroll on new messages). */
    messagesCount: number;
    /** Stable id of the first message - used to distinguish prepends (load older) from appends. */
    firstMessageId?: string;
    /** Number of non-message rows rendered before the messages (e.g. the load-more trigger). */
    headerOffset?: number;
    /**
     * Value that changes whenever the streaming (last) row's content updates - typically the
     * last message reference. react-window only fires `onRowsRendered` when the set of visible
     * rows changes, not when an already-mounted row is re-measured taller, so an explicit signal
     * is needed to keep pinning to the bottom while a single row grows in place.
     */
    streamingSignal?: unknown;
}

/**
 * Stick-to-bottom / reverse-scroll behavior for the virtualized message list.
 *
 * Replaces the MutationObserver-based {@link useSmartScroll} (which cannot work under
 * virtualization, since off-screen rows are not in the DOM and the scroll container is owned
 * by react-window).
 *
 * Off-screen row heights are only estimates in react-window, so neither `scrollHeight` nor a single
 * `scrollToRow` call is reliable on its own. Both corrections here are therefore re-applied across a
 * few frames (until measured heights settle), and prepend preservation anchors to a real rendered
 * row (`data-message-id`) near the viewport rather than to the distant, still-estimated bottom:
 * - keeps the last row pinned to the bottom while streaming, unless the user scrolled up;
 * - preserves the on-screen position of the top visible message when older messages are prepended.
 */
export function useVirtualStickToBottom({
    rowCount,
    isStreaming = false,
    status,
    messagesCount,
    firstMessageId,
    headerOffset = 0,
    streamingSignal,
}: UseVirtualStickToBottomParams) {
    const [listApi, listRef] = useListCallbackRef();
    // Drives a shimmer overlay while older messages are being prepended and the scroll is restored.
    const [isPrepending, setIsPrepending] = useState(false);
    const userScrolledUpRef = useRef(false);
    const prependingRef = useRef(false);
    const shimmerTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const prevFirstIdRef = useRef(firstMessageId);
    const prevMessagesCountRef = useRef(messagesCount);
    // Top offset (relative to the scroll container) of the first message row, captured on scroll.
    // A prepend restores this offset for the same message so the viewport doesn't jump. Null until
    // the first message has been seen in the DOM.
    const firstMsgOffsetRef = useRef<number | null>(null);
    // Last observed scrollTop - lets the scroll listener tell a user scroll-up (scrollTop decreases)
    // from our own pin-to-bottom (scrollTop only ever increases toward the bottom). This direction
    // check replaces a "programmatic scroll" flag, which during streaming was set almost every frame
    // by the multi-frame pin and so swallowed the user's scroll-up, breaking auto-stick interruption.
    const lastScrollTopRef = useRef(0);
    // Handle of the in-flight multi-frame correction so a new one cancels the previous.
    const rafRef = useRef(0);
    // Handle of the debounced first-message-offset capture. Measured only after scrolling settles,
    // so we read the first message at its resting position (and skip the transient mid-jump frames
    // of a programmatic pin, where react-window has not yet unmounted the old rows).
    const captureTimerRef = useRef<ReturnType<typeof setTimeout>>();
    // Latest values read through refs so the scroll callbacks stay referentially stable. Otherwise a
    // prepend changes rowCount -> a new pinToBottom -> the initial effect re-runs and its cleanup
    // cancels the in-flight prepend restore (which then leaves the viewport jumped).
    const listApiRef = useRef(listApi);
    listApiRef.current = listApi;
    const rowCountRef = useRef(rowCount);
    rowCountRef.current = rowCount;
    const firstMessageIdRef = useRef(firstMessageId);
    firstMessageIdRef.current = firstMessageId;

    const cancelPendingScroll = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
    }, []);

    // Pin to the true bottom, re-applying across frames: react-window's `scrollToRow` targets a
    // position computed from (partly estimated) row heights, so a single call lands short; once the
    // bottom rows render and are measured, the next frame re-targets the now-lower bottom.
    const pinToBottom = useCallback(() => {
        if (userScrolledUpRef.current || prependingRef.current || rowCountRef.current <= 0) {
            return;
        }
        cancelPendingScroll();
        let frame = 0;
        const step = () => {
            const api = listApiRef.current;
            if (userScrolledUpRef.current || prependingRef.current || !api) {
                return;
            }
            api.scrollToRow({index: rowCountRef.current - 1, align: 'end', behavior: 'instant'});
            frame += 1;
            if (frame < REANCHOR_FRAMES) {
                rafRef.current = requestAnimationFrame(step);
            }
        };
        step();
    }, [cancelPendingScroll]);

    // Record the first message row's top offset (relative to the scroll container) so a prepend can
    // restore it. Only meaningful while the first message is rendered, i.e. when scrolled near the
    // top - which is exactly when a load-previous can be triggered.
    const captureFirstOffset = useCallback((element: HTMLElement) => {
        const id = firstMessageIdRef.current;
        if (id === undefined) {
            return;
        }
        const row = element.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
        if (row) {
            firstMsgOffsetRef.current =
                row.getBoundingClientRect().top - element.getBoundingClientRect().top;
        }
    }, []);

    // Track scroll direction to decide whether auto-stick should pause. A user scroll-up moves the
    // content down (scrollTop decreases); our pin-to-bottom only ever moves toward the bottom
    // (scrollTop increases), so it never trips the "scrolled up" branch even when it momentarily
    // undershoots the still-estimated bottom.
    useEffect(() => {
        const element = listApi?.element;
        if (!element) {
            return undefined;
        }

        lastScrollTopRef.current = element.scrollTop;

        const handleScroll = () => {
            const {scrollTop, scrollHeight, clientHeight} = element;
            const prevTop = lastScrollTopRef.current;
            lastScrollTopRef.current = scrollTop;

            // Ignore scrolls produced by an in-flight prepend restore - it is not user intent.
            if (prependingRef.current) {
                return;
            }

            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            if (scrollTop < prevTop - 1) {
                // User scrolled up: pause auto-stick unless they are still effectively at the bottom.
                userScrolledUpRef.current = distanceFromBottom > SCROLL_THRESHOLD;
            } else if (distanceFromBottom <= SCROLL_THRESHOLD) {
                // At (or back to) the bottom: resume auto-stick.
                userScrolledUpRef.current = false;
            }
            // Measure the first message's offset only after scrolling settles: react-window renders
            // the rows for the new position asynchronously, and a programmatic pin jumps through
            // intermediate positions, so a synchronous (or single-frame) read can capture a stale
            // offset for a row about to be unmounted.
            clearTimeout(captureTimerRef.current);
            captureTimerRef.current = setTimeout(() => {
                if (!prependingRef.current) {
                    captureFirstOffset(element);
                }
            }, 120);
        };

        element.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            element.removeEventListener('scroll', handleScroll);
            clearTimeout(captureTimerRef.current);
        };
    }, [listApi, captureFirstOffset]);

    // Initial scroll to bottom once the list element is mounted.
    useEffect(() => {
        if (listApi) {
            pinToBottom();
        }
        return cancelPendingScroll;
    }, [listApi, pinToBottom, cancelPendingScroll]);

    // Preserve the viewport when older messages are prepended (load previous) so the list doesn't
    // jump. A prepend is detected by a change of the first message id together with a growing count
    // while the user is scrolled up (a bottom append - e.g. a new streamed message - leaves the
    // first id unchanged, so it is ignored here and handled by the stick-to-bottom effect).
    //
    // Two stages, re-applied across frames (react-window measures rows after paint), stopping early
    // once the anchor is stable to avoid extra re-renders:
    //  1. coarse - `scrollToRow` to the previous top message's new index, which forces react-window
    //     to render that region (it is off-screen right after a prepend, so a pure DOM lookup would
    //     find nothing - the cause of the "jumps to the newly loaded top" bug);
    //  2. fine - once that row is in the DOM, nudge `scrollTop` so it sits at the exact offset it
    //     had before the prepend (preserves the load-trigger gap / intra-message offset, instead of
    //     snapping it to the very top).
    useLayoutEffect(() => {
        const prevFirstId = prevFirstIdRef.current;
        const prevCount = prevMessagesCountRef.current;
        prevFirstIdRef.current = firstMessageId;
        prevMessagesCountRef.current = messagesCount;

        const element = listApi?.element;
        if (!element) {
            return undefined;
        }

        const isPrepend =
            userScrolledUpRef.current &&
            messagesCount > prevCount &&
            prevCount > 0 &&
            firstMessageId !== undefined &&
            prevFirstId !== undefined &&
            firstMessageId !== prevFirstId;

        if (!isPrepend || prevFirstId === undefined) {
            return undefined;
        }

        // Suppress the post-paint auto-scroll-to-bottom while restoring this commit's position.
        prependingRef.current = true;
        cancelPendingScroll();

        // Cover the list with a shimmer while we re-anchor. react-window applies scroll via a native
        // scroll and only re-renders the new window on the (async) scroll event, so right after a
        // prepend it paints the offset-0 window (the freshly loaded top) for a frame before our
        // correction takes hold. The overlay hides that transition behind an intentional loading
        // animation instead of a flash of the wrong messages.
        clearTimeout(shimmerTimerRef.current);
        setIsPrepending(true);
        element.style.visibility = 'hidden';
        shimmerTimerRef.current = setTimeout(() => {
            element.style.visibility = '';
            setIsPrepending(false);
        }, PREPEND_SHIMMER_MS);

        // Releases only the scroll-gating flag; the overlay/visibility are cleared by the timer above
        // so the shimmer stays up for its minimum duration even though the scroll settles sooner.
        const finish = () => {
            prependingRef.current = false;
        };

        const anchorId = prevFirstId;
        const savedOffset = firstMsgOffsetRef.current ?? 0;
        // The previous first message shifted down by the number of prepended messages.
        const anchorIndex = messagesCount - prevCount + headerOffset;

        let frame = 0;
        let stableFrames = 0;
        const step = () => {
            const api = listApiRef.current;
            if (!api) {
                finish();
                return;
            }

            const row = element.querySelector<HTMLElement>(
                `[data-message-id="${CSS.escape(anchorId)}"]`,
            );
            let positioned = false;
            if (row) {
                // Fine: move the anchor row to the offset it had before the prepend.
                const currentTop =
                    row.getBoundingClientRect().top - element.getBoundingClientRect().top;
                const delta = currentTop - savedOffset;
                if (Math.abs(delta) >= 1) {
                    element.scrollTop += delta;
                } else {
                    positioned = true;
                }
            } else {
                // Coarse: the anchor is not rendered yet - scroll to its index to render it.
                api.scrollToRow({index: anchorIndex, align: 'start', behavior: 'instant'});
            }

            frame += 1;
            stableFrames = positioned ? stableFrames + 1 : 0;
            // Stop once the anchor has held its position for two frames (heights settled) or the cap
            // is hit, so we don't keep forcing react-window to re-render every frame.
            if (frame < REANCHOR_FRAMES && stableFrames < 2) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                finish();
            }
        };
        step();

        return () => {
            cancelPendingScroll();
            clearTimeout(shimmerTimerRef.current);
            prependingRef.current = false;
            element.style.visibility = '';
            setIsPrepending(false);
        };
    }, [messagesCount, firstMessageId, headerOffset, listApi, cancelPendingScroll]);

    // Scroll to bottom on status changes (mirrors useSmartScroll).
    useEffect(() => {
        pinToBottom();
    }, [status, pinToBottom]);

    // Scroll to bottom on new messages.
    useEffect(() => {
        if (messagesCount) {
            pinToBottom();
        }
    }, [messagesCount, pinToBottom]);

    // During streaming the last row grows in place without changing the rendered row set, so
    // `onRowsRendered` does not fire. Pin to the bottom whenever the streaming content signal
    // changes instead.
    useEffect(() => {
        if (!isStreaming) {
            return undefined;
        }
        pinToBottom();
        return undefined;
    }, [streamingSignal, isStreaming, pinToBottom]);

    return {listRef, isPrepending};
}
