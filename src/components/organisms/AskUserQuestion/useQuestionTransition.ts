import {type RefObject, useRef} from 'react';

import {useLayoutEffect} from '@gravity-ui/uikit';

/** Animate natural content height without storing a fixed question height. */
export function useQuestionTransition(
    root: RefObject<HTMLDivElement>,
    content: RefObject<HTMLDivElement>,
) {
    const heightAnimation = useRef<Animation>();
    const previousHeight = useRef<number>();

    useLayoutEffect(() => {
        const element = root.current;
        const body = content.current;
        if (!element || !body) {
            return undefined;
        }
        const previousOverflow = element.style.overflow;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const measure = () => {
            const from = heightAnimation.current
                ? element.getBoundingClientRect().height
                : previousHeight.current;
            heightAnimation.current?.cancel();
            heightAnimation.current = undefined;
            element.style.overflow = previousOverflow;
            const to = element.getBoundingClientRect().height;
            previousHeight.current = to;
            if (from === undefined || Math.abs(from - to) < 1 || reducedMotion.matches) {
                return;
            }
            element.style.overflow = 'clip';
            const animation = element.animate([{height: `${from}px`}, {height: `${to}px`}], {
                duration: 220,
                easing: 'cubic-bezier(0.2, 0, 0, 1)',
            });
            heightAnimation.current = animation;
            animation.onfinish = () => {
                if (heightAnimation.current === animation) {
                    heightAnimation.current = undefined;
                    element.style.overflow = previousOverflow;
                }
            };
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(body);
        reducedMotion.addEventListener('change', measure);
        return () => {
            observer.disconnect();
            reducedMotion.removeEventListener('change', measure);
            heightAnimation.current?.cancel();
            element.style.overflow = previousOverflow;
        };
    }, [root, content]);
}
