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
    /** What the same measurement gave the last time the field fitted the footer. */
    lastChromeHeight?: number;
}

/**
 * Height of everything the footer holds besides the field - the buttons, the attachments, the
 * disclaimer. It stays the same whatever the text is, so the field may take the space left after
 * it.
 *
 * A footer that no longer fits is squeezed by the layout around it - it is allowed to be, so that
 * the suggestions can give their space back - while the field keeps the height it grew to and
 * spills out of the squeezed box. The subtraction then gives less than the furniture, down to a
 * negative number, and the limit computed from it is exactly the height that is already there:
 * the field would stay as tall as it was. The furniture is the same either way, so a squeezed
 * footer is answered with the height measured while the field still fitted it.
 */
export function resolveFooterChromeHeight({
    footerHeight,
    textareaHeight,
    lastChromeHeight,
}: FooterChromeMetrics): number {
    if (textareaHeight > footerHeight && lastChromeHeight !== undefined) {
        return lastChromeHeight;
    }

    return footerHeight - textareaHeight;
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

        if (!enabled || !root || !footer) {
            setFit(FITTING);

            return undefined;
        }

        // Survives the measurements, not the element: a footer that changed is measured anew.
        let footerChromeHeight: number | undefined;

        const measurePromptInput = (): number | undefined => {
            const textarea = footer.querySelector(TEXTAREA_SELECTOR);

            if (!textarea) {
                return undefined;
            }

            footerChromeHeight = resolveFooterChromeHeight({
                footerHeight: footer.getBoundingClientRect().height,
                textareaHeight: textarea.getBoundingClientRect().height,
                lastChromeHeight: footerChromeHeight,
            });

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
