import {useEffect, useState} from 'react';

import {KEYBOARD_MIN_INSET} from './useKeyboardViewportFit';

export const SHEET_VISIBLE_BOTTOM_VAR = '--g-aikit-sheet-visible-bottom';

export const SHEET_VISIBLE_HEIGHT_VAR = '--g-aikit-sheet-visible-height';

const SHEET_MARGIN_BOX_SELECTOR = '.g-sheet-content-area__margin-box';

const KEYBOARD_HEIGHT_STORAGE_PREFIX = 'g-aikit-sheet-keyboard-height';

const PREDICT_GUARD_MS = 500;

const SYNC_FALLBACK_MS = 400;

const HANDOVER_WAIT_MS = 1500;

const HANDOVER_STABLE_FRAMES = 4;

const SUPPRESS_CLICK_MS = 600;

const KEYBOARD_CLOSE_MS = 700;

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

function createAnchor(): HTMLInputElement {
    const anchor = document.createElement('input');

    anchor.setAttribute('aria-hidden', 'true');
    anchor.tabIndex = -1;
    anchor.setAttribute(
        'style',
        'position:fixed;top:0;left:0;z-index:-1;width:1px;height:1px;font-size:16px;opacity:0;pointer-events:none;border:0;padding:0',
    );

    return anchor;
}

function writeVar(name: string, value: number | undefined) {
    const {style} = document.documentElement;

    if (value === undefined) {
        style.removeProperty(name);
    } else {
        style.setProperty(name, `${value}px`);
    }
}

/**
 * Fits a bottom sheet above the on-screen keyboard raised from a field inside it.
 *
 * The sheet is refitted on the focus of the field, not on the keyboard resize: the height of the
 * keyboard is remembered per screen size, so the sheet rises together with the keyboard instead of
 * jumping once it has finished sliding in. The first time on a screen there is nothing to predict,
 * so the fit is applied when the visual viewport settles, and the height is remembered for later.
 *
 * Two things move the sheet: the cap on its content, which uikit answers by resizing and
 * translating the window from its `ResizeObserver`, and the height of the root, which sets the
 * bottom edge. Both are animated, so they have to start in the same frame - otherwise the window
 * hangs off the top of the screen for as long as the browser holds the observer back (Safari does
 * that for ~150ms while the keyboard slides in). The root height is therefore written from a
 * `ResizeObserver` on the same box uikit watches, which is delivered in the same frame.
 *
 * A field that sits below the line the keyboard will take (a short, filtered sheet at the bottom of
 * the screen) makes Safari pan the visual viewport to reveal it, and the pan drags every fixed box
 * up with it. To keep the field where Safari can see it, the tap is intercepted: an invisible
 * anchor at the top of the screen takes the focus and raises the keyboard, the sheet rises with it,
 * and once the keyboard has settled the focus is handed over to the field, which is above the
 * keyboard by then.
 *
 * @param enabled - disables tracking (e.g. while the sheet is closed or outside mobile mode)
 * @param sheetSelector - selector of the sheet root, used to find the content box uikit observes
 */
export function useSheetKeyboardFit(enabled = true, sheetSelector?: string): SheetKeyboardFit {
    const [fit, setFit] = useState<SheetKeyboardFit>(CLOSED);

    useEffect(() => {
        const viewport = typeof window === 'undefined' ? undefined : window.visualViewport;
        if (!enabled || !viewport) {
            setFit(CLOSED);
            return undefined;
        }

        let tracking = false;
        let guard = 0;
        let syncFallback = 0;
        let desired: SheetKeyboardFit = CLOSED;
        let releaseTimer = 0;
        let anchor: HTMLInputElement | null = null;
        let handoverTimer = 0;
        let handoverFrame = 0;
        let suppressClicksUntil = 0;

        const getIsKeyboardShown = () => window.innerHeight - viewport.height >= KEYBOARD_MIN_INSET;

        const removeAnchor = () => {
            window.clearTimeout(handoverTimer);
            window.cancelAnimationFrame(handoverFrame);
            handoverTimer = 0;
            handoverFrame = 0;
            anchor?.remove();
            anchor = null;
        };

        const writeBottom = () => {
            window.clearTimeout(syncFallback);
            syncFallback = 0;
            writeVar(SHEET_VISIBLE_BOTTOM_VAR, desired.visibleBottom);
        };

        const box =
            typeof ResizeObserver === 'undefined' || !sheetSelector
                ? null
                : document.querySelector(`${sheetSelector} ${SHEET_MARGIN_BOX_SELECTOR}`);
        let observer: ResizeObserver | null = null;
        if (box) {
            observer = new ResizeObserver(writeBottom);
            observer.observe(box);
        }

        const apply = (next: SheetKeyboardFit) => {
            const isCapChanging =
                next.isKeyboardOpen !== desired.isKeyboardOpen ||
                next.visibleHeight !== desired.visibleHeight;

            desired = next;
            writeVar(SHEET_VISIBLE_HEIGHT_VAR, next.visibleHeight);
            setFit((prev) =>
                prev.isKeyboardOpen === next.isKeyboardOpen &&
                prev.visibleBottom === next.visibleBottom &&
                prev.visibleHeight === next.visibleHeight
                    ? prev
                    : next,
            );

            if (!observer || !isCapChanging) {
                writeBottom();
                return;
            }

            window.clearTimeout(syncFallback);
            syncFallback = window.setTimeout(writeBottom, SYNC_FALLBACK_MS);
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

            if (!tracking && !next.isKeyboardOpen) {
                window.clearTimeout(releaseTimer);
                releaseTimer = 0;
                viewport.removeEventListener('resize', measure);
                viewport.removeEventListener('scroll', measure);
            }
        };

        const release = () => {
            releaseTimer = 0;
            viewport.removeEventListener('resize', measure);
            viewport.removeEventListener('scroll', measure);
            apply(CLOSED);
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

        const onFocusOut = (event: FocusEvent) => {
            if (!tracking || getIsTextEntryTarget(event.relatedTarget)) {
                return;
            }

            tracking = false;
            window.clearTimeout(guard);

            // The keyboard is still on screen and the visual viewport is still short; undoing the
            // fit now rebuilds the sheet against a viewport that is about to change again. The
            // listeners stay on until `measure` sees the viewport back at full height, with a
            // timer for the cases that never send a resize (a hardware keyboard).
            window.clearTimeout(releaseTimer);
            releaseTimer = window.setTimeout(release, KEYBOARD_CLOSE_MS);
        };

        const handOver = (field: HTMLElement) => {
            removeAnchor();
            field.focus({preventScroll: true});

            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
                const {length} = field.value;
                field.setSelectionRange(length, length);
            }

            suppressClicksUntil = performance.now() + SUPPRESS_CLICK_MS;
        };

        const onPointerDown = (event: Event) => {
            const target = event.target;
            if (!(target instanceof Element) || !sheetSelector || !target.closest(sheetSelector)) {
                return;
            }

            const field = target.closest('input, textarea, [contenteditable]');
            if (!(field instanceof HTMLElement) || !getIsTextEntryTarget(field)) {
                return;
            }

            const known = readKnownKeyboardHeight();
            if (!known || getIsKeyboardShown() || anchor) {
                return;
            }

            if (field.getBoundingClientRect().bottom <= window.innerHeight - known) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            // Until the focus is handed over: the click of this very tap must not reach the field
            // before the sheet has risen, and the keyboard decides when that is.
            suppressClicksUntil = Number.POSITIVE_INFINITY;

            anchor = createAnchor();
            document.body.appendChild(anchor);
            anchor.focus({preventScroll: true});

            let stableFrames = 0;
            let lastHeight = 0;

            const settle = () => {
                if (!anchor) {
                    return;
                }

                const isSteady = viewport.height === lastHeight;
                lastHeight = viewport.height;
                const isVisible = field.getBoundingClientRect().bottom <= viewport.height + 1;
                stableFrames = isSteady && isVisible ? stableFrames + 1 : 0;

                if (stableFrames >= HANDOVER_STABLE_FRAMES) {
                    handOver(field);
                    return;
                }

                handoverFrame = window.requestAnimationFrame(settle);
            };

            const onKeyboardShown = () => {
                if (!getIsKeyboardShown()) {
                    return;
                }

                viewport.removeEventListener('resize', onKeyboardShown);
                settle();
            };

            viewport.addEventListener('resize', onKeyboardShown);
            handoverTimer = window.setTimeout(() => {
                viewport.removeEventListener('resize', onKeyboardShown);
                handOver(field);
            }, HANDOVER_WAIT_MS);
        };

        // Only the click the intercepted tap is about to produce, and only inside the sheet: the
        // listener sits on the document, so a wider guard would swallow clicks of the whole page.
        const onSyntheticClick = (event: Event) => {
            const target = event.target;
            if (
                performance.now() > suppressClicksUntil ||
                !(target instanceof Element) ||
                !sheetSelector ||
                !target.closest(sheetSelector)
            ) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
        };

        document.addEventListener('focusin', onFocusIn, true);
        document.addEventListener('focusout', onFocusOut, true);
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('mousedown', onSyntheticClick, true);
        document.addEventListener('click', onSyntheticClick, true);

        return () => {
            removeAnchor();
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('mousedown', onSyntheticClick, true);
            document.removeEventListener('click', onSyntheticClick, true);
            window.clearTimeout(guard);
            window.clearTimeout(syncFallback);
            window.clearTimeout(releaseTimer);
            observer?.disconnect();
            document.removeEventListener('focusin', onFocusIn, true);
            document.removeEventListener('focusout', onFocusOut, true);
            viewport.removeEventListener('resize', measure);
            viewport.removeEventListener('scroll', measure);
            writeVar(SHEET_VISIBLE_BOTTOM_VAR, undefined);
            writeVar(SHEET_VISIBLE_HEIGHT_VAR, undefined);
        };
    }, [enabled, sheetSelector]);

    return fit;
}
