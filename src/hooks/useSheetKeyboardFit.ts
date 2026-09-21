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

export function useSheetKeyboardFit(enabled = true): SheetKeyboardFit {
    const [fit, setFit] = useState<SheetKeyboardFit>(CLOSED);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') {
            setFit(CLOSED);
            return undefined;
        }

        const apply = (next: SheetKeyboardFit) => {
            writeCustomProperties(next);
            setFit((prev) =>
                prev.isKeyboardOpen === next.isKeyboardOpen &&
                prev.visibleBottom === next.visibleBottom &&
                prev.visibleHeight === next.visibleHeight
                    ? prev
                    : next,
            );
        };

        const measure = () => {
            const viewport = window.visualViewport;
            if (!viewport) {
                return;
            }

            apply(
                resolveSheetKeyboardFit({
                    viewportHeight: viewport.height,
                    viewportOffsetTop: viewport.offsetTop,
                    scale: viewport.scale,
                    layoutHeight: window.innerHeight,
                }),
            );
        };

        const reset = () => apply(CLOSED);

        document.addEventListener('input', measure, true);
        document.addEventListener('focusout', reset, true);

        return () => {
            document.removeEventListener('input', measure, true);
            document.removeEventListener('focusout', reset, true);
            writeCustomProperties(CLOSED);
        };
    }, [enabled]);

    return fit;
}
