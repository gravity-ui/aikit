import {useEffect, useState} from 'react';

import {KEYBOARD_MIN_INSET} from './useKeyboardViewportFit';

export const SHEET_VISIBLE_BOTTOM_VAR = '--g-aikit-sheet-visible-bottom';

export const SHEET_VISIBLE_HEIGHT_VAR = '--g-aikit-sheet-visible-height';

const KEYBOARD_HEIGHT_STORAGE_PREFIX = 'g-aikit-sheet-keyboard-height';

const PREDICT_GUARD_MS = 500;

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

const NON_TEXT_INPUT_TYPES = new Set([
    'button',
    'checkbox',
    'color',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit',
]);

function getIsTextEntryTarget(target: EventTarget | null): boolean {
    if (target instanceof HTMLTextAreaElement) {
        return true;
    }

    if (target instanceof HTMLInputElement) {
        return !NON_TEXT_INPUT_TYPES.has(target.type);
    }

    return target instanceof HTMLElement && target.isContentEditable;
}

function getKeyboardHeightKey(): string {
    return `${KEYBOARD_HEIGHT_STORAGE_PREFIX}:${window.innerWidth}x${window.innerHeight}`;
}

function readKnownKeyboardHeight(): number {
    try {
        const value = Number(window.localStorage.getItem(getKeyboardHeightKey()));

        return Number.isFinite(value) && value > KEYBOARD_MIN_INSET ? value : 0;
    } catch {
        return 0;
    }
}

function writeKnownKeyboardHeight(height: number) {
    try {
        window.localStorage.setItem(getKeyboardHeightKey(), String(Math.round(height)));
    } catch {
        return;
    }
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

/**
 * Fits a bottom sheet above the on-screen keyboard raised from a field inside it.
 *
 * The sheet is refitted on the focus of the field, not on the keyboard resize: the height of the
 * keyboard is remembered per screen size, so the sheet rises together with the keyboard instead of
 * jumping once it has finished sliding in. The first time on a screen there is nothing to predict,
 * so the fit is applied when the visual viewport settles, and the height is remembered for later.
 */
export function useSheetKeyboardFit(enabled = true): SheetKeyboardFit {
    const [fit, setFit] = useState<SheetKeyboardFit>(CLOSED);

    useEffect(() => {
        const viewport = typeof window === 'undefined' ? undefined : window.visualViewport;
        if (!enabled || !viewport) {
            setFit(CLOSED);
            return undefined;
        }

        let tracking = false;
        let guard = 0;

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
            const next = resolveSheetKeyboardFit({
                viewportHeight: viewport.height,
                viewportOffsetTop: viewport.offsetTop,
                scale: viewport.scale,
                layoutHeight: window.innerHeight,
            });

            if (next.isKeyboardOpen) {
                // The tallest shrink is the keyboard; smaller readings come from its opening and
                // closing animation and must not overwrite the remembered height with a stray value.
                const measured = window.innerHeight - viewport.height;
                if (measured > readKnownKeyboardHeight()) {
                    writeKnownKeyboardHeight(measured);
                }
            }

            apply(next);
        };

        const onFocusIn = (event: FocusEvent) => {
            if (tracking || !getIsTextEntryTarget(event.target)) {
                return;
            }

            tracking = true;
            viewport.addEventListener('resize', measure);
            viewport.addEventListener('scroll', measure);

            const known = readKnownKeyboardHeight();
            if (!known) {
                return;
            }

            // The keyboard has not slid in yet; place the sheet where it will end up so it rises
            // with the keyboard, and undo the guess if the keyboard never shows (hardware keyboard).
            const height = Math.max(0, window.innerHeight - known);
            apply({isKeyboardOpen: true, visibleBottom: height, visibleHeight: height});

            window.clearTimeout(guard);
            guard = window.setTimeout(() => {
                if (window.innerHeight - viewport.height < KEYBOARD_MIN_INSET) {
                    apply(CLOSED);
                }
            }, PREDICT_GUARD_MS);
        };

        const onFocusOut = () => {
            if (!tracking) {
                return;
            }

            tracking = false;
            window.clearTimeout(guard);
            viewport.removeEventListener('resize', measure);
            viewport.removeEventListener('scroll', measure);
            apply(CLOSED);
        };

        document.addEventListener('focusin', onFocusIn, true);
        document.addEventListener('focusout', onFocusOut, true);

        return () => {
            window.clearTimeout(guard);
            document.removeEventListener('focusin', onFocusIn, true);
            document.removeEventListener('focusout', onFocusOut, true);
            viewport.removeEventListener('resize', measure);
            viewport.removeEventListener('scroll', measure);
            writeCustomProperties(CLOSED);
        };
    }, [enabled]);

    return fit;
}
