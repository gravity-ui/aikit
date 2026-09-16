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
    /** Whether the footer no longer holds everything it is given. */
    isFooterSqueezed: boolean;
    /** What the measurement gave the last time the footer held its content. */
    lastChromeHeight?: number;
}

/**
 * Height of everything the footer holds besides the field - the buttons, the attachments, the
 * disclaimer. It stays the same whatever the text is, so the field may take the space left after
 * it.
 *
 * A footer that no longer fits is squeezed by the layout around it - it is allowed to be, so that
 * the suggestions can give their space back - and its own height then stops describing what it
 * holds. Subtracting the field from it gives less than the furniture, and the limit computed from
 * that is the height the field already has, so the field stays as tall as it was and the bottom of
 * the footer - the disclaimer, the row of buttons - is left under the keyboard. The furniture does
 * not change with the squeeze, so a squeezed footer is answered with the height measured while it
 * still held its content.
 *
 * `undefined` means there is nothing to answer with yet - a chat mounted straight into an area the
 * keyboard has already shrunk - and the caller has to measure the furniture on its own.
 */
export function resolveFooterChromeHeight({
    footerHeight,
    textareaHeight,
    isFooterSqueezed,
    lastChromeHeight,
}: FooterChromeMetrics): number | undefined {
    if (isFooterSqueezed) {
        return lastChromeHeight;
    }

    return Math.max(0, footerHeight - textareaHeight);
}

/**
 * Height of the footer furniture taken with the field collapsed, so the footer holds nothing but
 * the furniture whatever state the layout is in. Costs a synchronous layout, so it is the answer
 * of last resort - for a chat mounted straight into an area the keyboard has already shrunk, where
 * there is no unsqueezed measurement to go by yet.
 */
function measureFooterChromeHeight(footer: HTMLElement, textarea: HTMLElement): number {
    const restoreMaxHeight = textarea.style.maxHeight;

    textarea.style.maxHeight = '0px';

    const chromeHeight = footer.getBoundingClientRect().height;

    textarea.style.maxHeight = restoreMaxHeight;

    return chromeHeight;
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

        const measurePromptInput = (): number | undefined => {
            const textarea = footer.querySelector(TEXTAREA_SELECTOR);

            if (!(textarea instanceof HTMLElement)) {
                return undefined;
            }

            footerChromeHeight =
                resolveFooterChromeHeight({
                    footerHeight: footer.getBoundingClientRect().height,
                    textareaHeight: textarea.getBoundingClientRect().height,
                    // The footer does not scroll, so a scroll height past the client height is
                    // content it was squeezed out of - read in the same frame as the rectangles
                    // above, which costs no layout of its own.
                    isFooterSqueezed: footer.scrollHeight > footer.clientHeight + 1,
                    lastChromeHeight: footerChromeHeight,
                }) ?? measureFooterChromeHeight(footer, textarea);

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
