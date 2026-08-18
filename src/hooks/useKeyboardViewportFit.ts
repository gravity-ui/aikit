import {type RefObject, useEffect, useState} from 'react';

/**
 * Minimum difference between the layout and the visual viewport that is treated as an opened
 * on-screen keyboard. Small differences come from browser UI (URL bar, toolbars) and must not
 * shrink the container.
 */
export const KEYBOARD_MIN_INSET = 80;

export interface KeyboardViewportMetrics {
    /** `visualViewport.height` - height of the area not covered by the keyboard. */
    viewportHeight: number;
    /** `visualViewport.offsetTop` - offset of the visual viewport inside the layout viewport. */
    viewportOffsetTop: number;
    /** `window.innerHeight` - layout viewport height, unaffected by the keyboard on iOS Safari. */
    layoutHeight: number;
    /** Top of the container in layout viewport coordinates (`getBoundingClientRect().top`). */
    containerTop: number;
}

export interface KeyboardViewportFit {
    /** Whether the on-screen keyboard currently covers part of the layout viewport. */
    isKeyboardOpen: boolean;
    /**
     * Height limit that keeps the bottom of the container right above the keyboard.
     * `undefined` while the keyboard is closed - the container keeps its natural height.
     */
    maxHeight?: number;
}

const CLOSED: KeyboardViewportFit = {isKeyboardOpen: false};

/**
 * Height limit for a container whose bottom would otherwise end up under the on-screen keyboard.
 *
 * iOS Safari does not shrink the layout viewport when the keyboard opens, so `100vh` / `100dvh` /
 * `height: 100%` keep the original height and the bottom of the chat (prompt input, disclaimer)
 * stays hidden. The visible area is reported by `visualViewport` instead, and the limit is its
 * bottom edge measured from the top of the container.
 */
export function resolveKeyboardViewportFit(
    metrics: KeyboardViewportMetrics,
    minInset: number = KEYBOARD_MIN_INSET,
): KeyboardViewportFit {
    const {viewportHeight, viewportOffsetTop, layoutHeight, containerTop} = metrics;

    // Android Chrome resizes the layout viewport together with the visual one, so the inset stays
    // at zero there and the container is left alone - the browser has already done the work.
    if (layoutHeight - viewportHeight < minInset) {
        return CLOSED;
    }

    return {
        isKeyboardOpen: true,
        maxHeight: Math.max(0, Math.floor(viewportOffsetTop + viewportHeight - containerTop)),
    };
}

/**
 * Tracks the on-screen keyboard through `visualViewport` and returns the height limit that keeps
 * the referenced container inside the visible area.
 *
 * @param containerRef - element to fit into the visual viewport
 * @param enabled - disables tracking (e.g. outside mobile mode)
 */
export function useKeyboardViewportFit(
    containerRef: RefObject<HTMLElement>,
    enabled = true,
): KeyboardViewportFit {
    const [fit, setFit] = useState<KeyboardViewportFit>(CLOSED);

    useEffect(() => {
        const viewport = typeof window === 'undefined' ? undefined : window.visualViewport;
        if (!enabled || !viewport) {
            setFit(CLOSED);
            return undefined;
        }

        let frame = 0;

        const update = () => {
            frame = 0;
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const next = resolveKeyboardViewportFit({
                viewportHeight: viewport.height,
                viewportOffsetTop: viewport.offsetTop,
                layoutHeight: window.innerHeight,
                // The limit only depends on the top of the container, which the limit itself does
                // not move - so applying it cannot feed back into the next measurement.
                containerTop: container.getBoundingClientRect().top,
            });

            setFit((prev) =>
                prev.isKeyboardOpen === next.isKeyboardOpen && prev.maxHeight === next.maxHeight
                    ? prev
                    : next,
            );
        };

        // iOS reports intermediate viewport sizes during the keyboard animation, so updates are
        // collapsed into a single frame.
        const schedule = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };

        update();
        viewport.addEventListener('resize', schedule);
        viewport.addEventListener('scroll', schedule);

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
            viewport.removeEventListener('resize', schedule);
            viewport.removeEventListener('scroll', schedule);
        };
    }, [containerRef, enabled]);

    return fit;
}
