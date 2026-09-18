import {type RefObject, useEffect, useState} from 'react';

/**
 * Minimum difference between the layout and the visual viewport that is treated as an opened
 * on-screen keyboard. Small differences come from browser UI (URL bar, toolbars) and must not
 * shrink the container.
 */
export const KEYBOARD_MIN_INSET = 80;

/**
 * Largest shortfall of `visualViewport.height` against a measured reference that is still
 * attributed to the browser's own bottom chrome. Anything larger is the keyboard itself and
 * must not be corrected away.
 */
export const VIEWPORT_HEIGHT_TOLERANCE = 100;

export interface KeyboardViewportMetrics {
    /** `visualViewport.height` - height of the area not covered by the keyboard. */
    viewportHeight: number;
    /** `visualViewport.offsetTop` - offset of the visual viewport inside the layout viewport. */
    viewportOffsetTop: number;
    /** `visualViewport.scale` - pinch-zoom factor, `1` when the page is not zoomed. */
    scale: number;
    /** `window.innerHeight` - layout viewport height, unaffected by the keyboard on iOS Safari. */
    layoutHeight: number;
    /** Top of the container in layout viewport coordinates (`getBoundingClientRect().top`). */
    containerTop: number;
    /**
     * Top of an element pinned to the top of the layout viewport (`position: fixed; top: 0`), read
     * with `getBoundingClientRect()`. Client rectangles are relative to the layout viewport in most
     * browsers and to the visual viewport in Safari, and this reading tells the two apart: it stays
     * at zero in the first case and drops to minus the viewport offset in the second. `0` by
     * default, which keeps the layout viewport reading.
     */
    viewportOriginTop?: number;
    /**
     * Height of a reference element sized to the dynamic viewport (`height: 100dvh`), read from
     * the DOM. iOS Safari reports a visible area short by the height of its bottom toolbar.
     */
    measuredViewportHeight?: number;
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
 * `visualViewport.height` can come back short by the height of the browser bottom chrome, which
 * makes the container shrink while no keyboard is open. A reference element sized to the dynamic
 * viewport measures the same area without that shortfall, so the larger of the two wins - but only
 * while the difference stays inside the tolerance, otherwise the keyboard itself would be
 * corrected away. The correction is one-way: it can only raise the visible height.
 */
function resolveVisibleHeight(
    reportedHeight: number,
    measuredHeight: number | undefined,
    scale: number,
    tolerance: number,
): number {
    // A DOM rect is in CSS pixels while `visualViewport.height` shrinks with pinch zoom, so the
    // two are only comparable on an unzoomed page.
    if (measuredHeight === undefined || scale !== 1) {
        return reportedHeight;
    }

    const difference = measuredHeight - reportedHeight;

    return difference > 0 && difference < tolerance ? measuredHeight : reportedHeight;
}

/**
 * Height limit for a container whose bottom would otherwise end up under the on-screen keyboard.
 *
 * Browsers keep the layout viewport at full height while the keyboard is open (iOS Safari always,
 * Chrome and Firefox since the `interactive-widget=resizes-visual` default), so `100vh` / `100dvh` /
 * `height: 100%` keep the original height and the bottom of the chat (prompt input, disclaimer)
 * stays hidden. The visible area is reported by `visualViewport` instead, and the limit is its
 * bottom edge measured from the top of the container.
 */
export function resolveKeyboardViewportFit(
    metrics: KeyboardViewportMetrics,
    minInset: number = KEYBOARD_MIN_INSET,
): KeyboardViewportFit {
    const {
        viewportHeight,
        viewportOffsetTop,
        scale,
        layoutHeight,
        containerTop,
        viewportOriginTop = 0,
        measuredViewportHeight,
    } = metrics;

    const visibleHeight = resolveVisibleHeight(
        viewportHeight,
        measuredViewportHeight,
        scale,
        VIEWPORT_HEIGHT_TOLERANCE,
    );

    // Pinch zoom shrinks `visualViewport.height` just like the keyboard does, so the height is
    // scaled back to layout pixels first: what remains is the part of the layout viewport that the
    // user cannot reach by panning, which is the keyboard. A page that opted into
    // `interactive-widget=resizes-content` shrinks the layout viewport itself and lands here with a
    // zero inset - the browser has already done the work and the container is left alone.
    if (layoutHeight - visibleHeight * scale < minInset) {
        return CLOSED;
    }

    // Where the visible area ends, in the same coordinates the container was measured in. Reading
    // the origin from the DOM keeps this right in a browser that reports rectangles against the
    // visual viewport, where adding the offset back would count it twice.
    const visibleBottom = viewportOffsetTop + viewportOriginTop + visibleHeight;

    return {
        isKeyboardOpen: true,
        maxHeight: Math.max(0, Math.floor(visibleBottom - containerTop)),
    };
}

export interface ViewportOriginMetrics {
    /** Top of the probe as `getBoundingClientRect` reports it. */
    probeTop: number;
    /** `visualViewport.offsetTop` at the same moment. */
    viewportOffsetTop: number;
}

/**
 * Top of the viewport the container is measured against, read from the probe.
 *
 * A probe pinned to the top of the layout viewport can only report two things: zero, where client
 * rectangles are measured against the layout viewport, and minus the viewport offset, where they
 * are measured against the visual viewport as in Safari. Anything else means the probe is not
 * where it was asked to be: a `transform`, a `filter`, a `will-change` or a `contain: paint` on
 * any ancestor - and panels that slide in are animated with exactly those - makes `position: fixed`
 * count from that ancestor instead of the viewport. Such a reading is dropped, and the limit falls
 * back to the formula without a probe rather than following the ancestor's own offset.
 */
export function resolveViewportOriginTop({
    probeTop,
    viewportOffsetTop,
}: ViewportOriginMetrics): number {
    const isPinnedToViewport = Math.abs(probeTop) < 1 || Math.abs(probeTop + viewportOffsetTop) < 1;

    return isPinnedToViewport ? probeTop : 0;
}

export interface KeyboardViewportFitOptions {
    /**
     * Element pinned to the top of the layout viewport and sized to the dynamic viewport
     * (`position: fixed; top: 0; height: 100dvh`). Its rectangle answers two questions the
     * `visualViewport` numbers alone cannot: which viewport client rectangles are measured
     * against, and how tall the browser itself considers the visible area to be. See
     * {@link VIEWPORT_HEIGHT_TOLERANCE}.
     */
    viewportProbeRef?: RefObject<HTMLElement | null>;
}

/**
 * Tracks the on-screen keyboard through `visualViewport` and returns the height limit that keeps
 * the referenced container inside the visible area. The container has to be anchored to the top of
 * the viewport: a bottom-anchored one moves its own top as soon as the limit shrinks it.
 *
 * @param containerRef - element to fit into the visual viewport
 * @param enabled - disables tracking (e.g. outside mobile mode)
 * @param options - optional dynamic viewport probe, see {@link KeyboardViewportFitOptions}
 */
export function useKeyboardViewportFit(
    containerRef: RefObject<HTMLElement>,
    enabled = true,
    options: KeyboardViewportFitOptions = {},
): KeyboardViewportFit {
    const {viewportProbeRef} = options;
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

            if (!container.contains(document.activeElement)) {
                setFit((prev) => (prev.isKeyboardOpen ? CLOSED : prev));
                return;
            }

            const probeBox = viewportProbeRef?.current?.getBoundingClientRect();

            const next = resolveKeyboardViewportFit({
                viewportHeight: viewport.height,
                viewportOffsetTop: viewport.offsetTop,
                scale: viewport.scale,
                layoutHeight: window.innerHeight,
                // The limit only depends on the top of the container, which the limit itself does
                // not move - so applying it cannot feed back into the next measurement.
                containerTop: container.getBoundingClientRect().top,
                viewportOriginTop:
                    probeBox &&
                    resolveViewportOriginTop({
                        probeTop: probeBox.top,
                        viewportOffsetTop: viewport.offsetTop,
                    }),
                measuredViewportHeight: probeBox?.height,
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
        document.addEventListener('focusin', schedule);
        document.addEventListener('focusout', schedule);

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
            viewport.removeEventListener('resize', schedule);
            viewport.removeEventListener('scroll', schedule);
            document.removeEventListener('focusin', schedule);
            document.removeEventListener('focusout', schedule);
        };
    }, [containerRef, enabled, viewportProbeRef]);

    return fit;
}
