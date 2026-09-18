import {type RefObject, useLayoutEffect, useState} from 'react';

import {block} from '../../../utils/cn';

const promptInputBody = block('prompt-input-body');
const emptyContainer = block('empty-container');

const TEXTAREA_SELECTOR = `.${promptInputBody('textarea-control')}`;
const WELCOME_CONTENT_SELECTOR = `.${emptyContainer('content')}`;
const HERO_SELECTOR = `.${emptyContainer('hero-container')}`;

export interface PromptInputFitMetrics {
    /** Height the whole chat is allowed to take. */
    rootHeight: number;
    /** Height of the header the prompt input must not grow into. */
    headerHeight: number;
    /** Height of everything the footer holds besides the field itself. */
    footerChromeHeight: number;
}

/**
 * Height the textarea may take before the footer starts pushing the chat out of the visible area.
 */
export function resolvePromptInputMaxHeight({
    rootHeight,
    headerHeight,
    footerChromeHeight,
}: PromptInputFitMetrics): number {
    return Math.max(0, Math.floor(rootHeight - headerHeight - footerChromeHeight));
}

export interface FooterChromeMetrics {
    /** Height the footer takes right now. */
    footerHeight: number;
    /** Height of the autosized textarea inside it. */
    textareaHeight: number;
    /** Furniture height from the last measurement, `undefined` before the first one. */
    lastChromeHeight?: number;
}

/**
 * Whether the furniture has to be measured again rather than taken from the last measurement.
 *
 * Subtracting the field from the footer gives the furniture only while nothing is squeezed. A
 * footer that no longer fits is squeezed by the layout around it - it is allowed to be, so that the
 * suggestions can give their space back - and so is the prompt input inside it, while the field
 * keeps the height it grew to; what is squeezed spills over what comes after it instead of pushing
 * it down, so the disclaimer ends up under the row of buttons and every box still measures as if it
 * fitted. The subtraction then comes back short, never long: a shorter answer is the squeeze, a
 * longer one is furniture that really has grown - a wrapped disclaimer, an attachment - and only
 * that is worth a fresh measurement.
 */
export function getIsFooterChromeStale({
    footerHeight,
    textareaHeight,
    lastChromeHeight,
}: FooterChromeMetrics): boolean {
    if (lastChromeHeight === undefined) {
        return true;
    }

    // A pixel of slack: heights are fractional, and the rounding alone must not order a new
    // measurement on every resize.
    return footerHeight - textareaHeight > lastChromeHeight + 1;
}

export interface FooterChromeState {
    /** Furniture the footer shows right now, footer minus the field. */
    measured: number;
    /** Furniture the limit is currently built on, `undefined` before the first measurement. */
    lastChromeHeight?: number;
    /** Measurement waiting for a second, matching one before it is adopted. */
    pendingChromeHeight?: number;
}

export interface FooterChromeDecision {
    chromeHeight: number;
    pendingChromeHeight?: number;
}

/**
 * Furniture height to build the limit on, and the measurement still waiting for confirmation.
 *
 * Growth is adopted only once a second measurement agrees with it, because a footer caught
 * mid-squeeze reports furniture that is not there. Shrinking is adopted at once: a smaller
 * subtraction can only mean the footer really did lose furniture, and a value that could only ever
 * grow would latch on the first spike and drive the limit to zero, collapsing the field.
 */
export function resolveFooterChromeHeight({
    measured,
    lastChromeHeight,
    pendingChromeHeight,
}: FooterChromeState): FooterChromeDecision {
    if (lastChromeHeight === undefined || measured < lastChromeHeight) {
        return {chromeHeight: measured};
    }

    if (!getIsFooterChromeStale({footerHeight: measured, textareaHeight: 0, lastChromeHeight})) {
        return {chromeHeight: lastChromeHeight};
    }

    const isConfirmed =
        pendingChromeHeight !== undefined && Math.abs(pendingChromeHeight - measured) <= 1;

    return {
        chromeHeight: isConfirmed ? measured : lastChromeHeight,
        pendingChromeHeight: measured,
    };
}

export interface HeroFitMetrics {
    /** Height left for the welcome content, padding excluded. */
    availableHeight: number;
    /** Height of the hero block, the same whatever the space around it. */
    heroHeight: number;
}

/**
 * Whether the welcome hero still fits. A growing prompt input eats the welcome screen from the
 * bottom up, and a hero cut in half reads as broken, so it is hidden as soon as it stops fitting.
 */
export function getIsHeroFitting({availableHeight, heroHeight}: HeroFitMetrics): boolean {
    return availableHeight >= heroHeight;
}

export interface KeyboardLayoutFit {
    /** Cap for the autosized textarea, `undefined` while it does not need one. */
    promptInputMaxHeight?: number;
    /** `false` when the welcome hero has to give way to the prompt input. */
    isHeroFitting: boolean;
}

const FITTING: KeyboardLayoutFit = {isHeroFitting: true};

/**
 * Keeps the chat usable while the on-screen keyboard is open: measures how tall the prompt input
 * may grow before it pushes the chat past the bottom of the visible area, and whether the welcome
 * hero still has room above it.
 *
 * An autosized textarea sets its own inline height from the text it holds, so without a limit a
 * long draft covers the whole screen; with one, the text scrolls inside the field instead.
 *
 * @param rootRef - chat root, already clamped to the visible area
 * @param headerRef - chat header the input must stay below
 * @param footerRef - chat footer holding the prompt input
 * @param enabled - disables measuring (e.g. while the keyboard is closed)
 */
export function useKeyboardLayoutFit(
    rootRef: RefObject<HTMLElement | null>,
    headerRef: RefObject<HTMLElement | null>,
    footerRef: RefObject<HTMLElement | null>,
    enabled: boolean,
): KeyboardLayoutFit {
    const [fit, setFit] = useState<KeyboardLayoutFit>(FITTING);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const footer = footerRef.current;

        if (!enabled || !root || !footer || typeof ResizeObserver === 'undefined') {
            setFit(FITTING);

            return undefined;
        }

        // Survives the measurements, not the element: a footer that changed is measured anew.
        let footerChromeHeight: number | undefined;
        let pendingChromeHeight: number | undefined;

        const measurePromptInput = (): number | undefined => {
            const textarea = footer.querySelector(TEXTAREA_SELECTOR);

            if (!(textarea instanceof HTMLElement)) {
                return undefined;
            }

            const footerHeight = footer.getBoundingClientRect().height;
            const textareaHeight = textarea.getBoundingClientRect().height;
            const decision = resolveFooterChromeHeight({
                measured: Math.max(0, footerHeight - textareaHeight),
                lastChromeHeight: footerChromeHeight,
                pendingChromeHeight,
            });

            footerChromeHeight = decision.chromeHeight;
            pendingChromeHeight = decision.pendingChromeHeight;

            return resolvePromptInputMaxHeight({
                rootHeight: root.getBoundingClientRect().height,
                headerHeight: headerRef.current?.getBoundingClientRect().height ?? 0,
                footerChromeHeight,
            });
        };

        const measureHero = (): boolean => {
            const content = root.querySelector(WELCOME_CONTENT_SELECTOR);
            const hero = root.querySelector(HERO_SELECTOR);

            if (!(content instanceof HTMLElement) || !(hero instanceof HTMLElement)) {
                return true;
            }

            const paddingTop = parseFloat(window.getComputedStyle(content).paddingTop) || 0;

            // The hero keeps its box while hidden, so the measurement does not start flipping
            // between fitting and not fitting.
            return getIsHeroFitting({
                availableHeight: content.clientHeight - paddingTop,
                heroHeight: hero.offsetHeight,
            });
        };

        const measure = () => {
            const next: KeyboardLayoutFit = {
                promptInputMaxHeight: measurePromptInput(),
                isHeroFitting: measureHero(),
            };

            setFit((prev) =>
                prev.promptInputMaxHeight === next.promptInputMaxHeight &&
                prev.isHeroFitting === next.isHeroFitting
                    ? prev
                    : next,
            );
        };

        measure();

        // The footer is what grows with the text, and the root is what the keyboard resizes.
        const observer = new ResizeObserver(measure);

        observer.observe(root);
        observer.observe(footer);

        return () => observer.disconnect();
    }, [rootRef, headerRef, footerRef, enabled]);

    return fit;
}
