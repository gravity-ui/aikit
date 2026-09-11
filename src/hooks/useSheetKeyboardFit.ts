import {useEffect, useState} from 'react';

import {KEYBOARD_MIN_INSET} from './useKeyboardViewportFit';

/**
 * Distance from the top of the layout viewport to the bottom of the area left by the keyboard,
 * published on the document element so that a sheet rendered through a portal can read it.
 */
export const SHEET_VISIBLE_BOTTOM_VAR = '--g-aikit-sheet-visible-bottom';

/** Height of the area left by the keyboard, published next to {@link SHEET_VISIBLE_BOTTOM_VAR}. */
export const SHEET_VISIBLE_HEIGHT_VAR = '--g-aikit-sheet-visible-height';

export interface SheetKeyboardMetrics {
    /** `visualViewport.height` - height of the area not covered by the keyboard. */
    viewportHeight: number;
    /** `visualViewport.offsetTop` - offset of the visual viewport inside the layout viewport. */
    viewportOffsetTop: number;
    /** `visualViewport.scale` - pinch-zoom factor, `1` when the page is not zoomed. */
    scale: number;
    /** `window.innerHeight` - layout viewport height, unaffected by the keyboard on iOS Safari. */
    layoutHeight: number;
}

export interface SheetKeyboardFit {
    /** Whether the on-screen keyboard currently covers part of the layout viewport. */
    isKeyboardOpen: boolean;
    /** Bottom of the visible area in layout viewport coordinates, `undefined` when closed. */
    visibleBottom?: number;
    /** Height of the visible area, `undefined` when closed. */
    visibleHeight?: number;
}

const CLOSED: SheetKeyboardFit = {isKeyboardOpen: false};

/**
 * Geometry of the visible area for a bottom sheet while the on-screen keyboard is open.
 *
 * A uikit `Sheet` fills the layout viewport and pins its window to the bottom of that box. The
 * keyboard leaves the layout viewport untouched (iOS Safari always, Chrome and Firefox under the
 * `interactive-widget=resizes-visual` default) and only shrinks the visual viewport, so the bottom
 * of the sheet - and with it everything but the topmost rows - ends up under the keyboard. The
 * visible area is the band `[offsetTop, offsetTop + height]` of the visual viewport, so a sheet
 * that is `visibleBottom` tall and holds at most `visibleHeight` of content stays inside it.
 */
export function resolveSheetKeyboardFit(
    metrics: SheetKeyboardMetrics,
    minInset: number = KEYBOARD_MIN_INSET,
): SheetKeyboardFit {
    const {viewportHeight, viewportOffsetTop, scale, layoutHeight} = metrics;

    // Pinch zoom shrinks `visualViewport.height` just like the keyboard does, so the height is
    // scaled back to layout pixels first; see `resolveKeyboardViewportFit` for the same guard.
    if (layoutHeight - viewportHeight * scale < minInset) {
        return CLOSED;
    }

    return {
        isKeyboardOpen: true,
        visibleBottom: Math.max(0, Math.floor(viewportOffsetTop + viewportHeight)),
        visibleHeight: Math.max(0, Math.floor(viewportHeight)),
    };
}

type Subscriber = (fit: SheetKeyboardFit) => void;

const subscribers = new Set<Subscriber>();
let frame = 0;
let published: SheetKeyboardFit = CLOSED;

function publish() {
    frame = 0;

    const viewport = window.visualViewport;
    if (!viewport) {
        return;
    }

    const next = resolveSheetKeyboardFit({
        viewportHeight: viewport.height,
        viewportOffsetTop: viewport.offsetTop,
        scale: viewport.scale,
        layoutHeight: window.innerHeight,
    });

    if (
        next.isKeyboardOpen === published.isKeyboardOpen &&
        next.visibleBottom === published.visibleBottom &&
        next.visibleHeight === published.visibleHeight
    ) {
        return;
    }

    published = next;
    writeCustomProperties(next);
    subscribers.forEach((subscriber) => subscriber(next));
}

function writeCustomProperties(fit: SheetKeyboardFit) {
    const {style} = document.documentElement;

    if (fit.isKeyboardOpen) {
        style.setProperty(SHEET_VISIBLE_BOTTOM_VAR, `${fit.visibleBottom}px`);
        style.setProperty(SHEET_VISIBLE_HEIGHT_VAR, `${fit.visibleHeight}px`);
    } else {
        style.removeProperty(SHEET_VISIBLE_BOTTOM_VAR);
        style.removeProperty(SHEET_VISIBLE_HEIGHT_VAR);
    }
}

// iOS reports intermediate viewport sizes during the keyboard animation, so updates are collapsed
// into a single frame.
function schedule() {
    if (!frame) {
        frame = requestAnimationFrame(publish);
    }
}

function subscribe(subscriber: Subscriber) {
    const viewport = window.visualViewport;
    if (!viewport) {
        return undefined;
    }

    // One listener serves every open sheet: the geometry is a property of the viewport, not of a
    // particular sheet, and the custom properties they read live on the document element.
    if (!subscribers.size) {
        viewport.addEventListener('resize', schedule);
        viewport.addEventListener('scroll', schedule);
    }

    subscribers.add(subscriber);
    publish();
    subscriber(published);

    return () => {
        subscribers.delete(subscriber);

        if (!subscribers.size) {
            viewport.removeEventListener('resize', schedule);
            viewport.removeEventListener('scroll', schedule);

            if (frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }

            published = CLOSED;
            writeCustomProperties(CLOSED);
        }
    };
}

/**
 * Tracks the on-screen keyboard for a bottom sheet and publishes the visible area as the
 * {@link SHEET_VISIBLE_BOTTOM_VAR} and {@link SHEET_VISIBLE_HEIGHT_VAR} custom properties on the
 * document element - a sheet is rendered through a portal, so it inherits them wherever it lands.
 *
 * Pair it with the `sheet-keyboard-fit-root` and `sheet-keyboard-fit-content` style mixins, which
 * turn those properties into the height of the sheet and the height limit of its content.
 *
 * @param enabled - disables tracking (e.g. while the sheet is closed or outside mobile mode)
 */
export function useSheetKeyboardFit(enabled = true): SheetKeyboardFit {
    const [fit, setFit] = useState<SheetKeyboardFit>(CLOSED);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') {
            setFit(CLOSED);
            return undefined;
        }

        return subscribe(setFit);
    }, [enabled]);

    return fit;
}
