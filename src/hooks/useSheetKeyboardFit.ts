import {useEffect, useState} from 'react';

import {KEYBOARD_MIN_INSET} from './useKeyboardViewportFit';

export const SHEET_VISIBLE_BOTTOM_VAR = '--g-aikit-sheet-visible-bottom';

export const SHEET_VISIBLE_HEIGHT_VAR = '--g-aikit-sheet-visible-height';

export interface SheetKeyboardMetrics {
    viewportHeight: number;
    viewportOffsetTop: number;
    scale: number;
    layoutHeight: number;
}

export interface SheetKeyboardFit {
    isKeyboardOpen: boolean;
    visibleBottom?: number;
    visibleHeight?: number;
}

const CLOSED: SheetKeyboardFit = {isKeyboardOpen: false};

export function resolveSheetKeyboardFit(
    metrics: SheetKeyboardMetrics,
    minInset: number = KEYBOARD_MIN_INSET,
): SheetKeyboardFit {
    const {viewportHeight, viewportOffsetTop, scale, layoutHeight} = metrics;

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
