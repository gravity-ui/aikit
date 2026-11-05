import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';

/** Demo-only adapter for MessageList, which does not expose a public scroll ref. */
export function useScrollToLatest(rootRef: RefObject<HTMLDivElement>, enabled: boolean) {
    const listRef = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [bottom, setBottom] = useState(16);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !enabled) return undefined;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const list = root.querySelector<HTMLElement>('.g-aikit-message-list');
            root.dataset.chatScrolled = list && list.scrollTop > 1 ? 'true' : 'false';
            const composer = root.querySelector<HTMLElement>('.chat-playground__agent-footer');
            const overlay = root.dataset.aikitSkin === 'agent' ? composer : null;
            root.style.setProperty('--demo-composer-height', `${overlay?.offsetHeight || 0}px`);
            if (list !== listRef.current) {
                resize.disconnect();
                resize.observe(root);
                if (list) {
                    resize.observe(list);
                    if (list.firstElementChild) resize.observe(list.firstElementChild);
                }
                listRef.current = list;
            }
            if (composer) resize.observe(composer);
            if (!list || list.clientHeight === 0) {
                setVisible(false);
                return;
            }
            setVisible(list.scrollHeight - list.clientHeight - list.scrollTop > 48);
            setBottom(
                Math.max(
                    16,
                    root.getBoundingClientRect().bottom -
                        (overlay
                            ? overlay.getBoundingClientRect().top
                            : list.getBoundingClientRect().bottom) +
                        12,
                ),
            );
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        const resize = new ResizeObserver(schedule);
        const mutations = new MutationObserver(schedule);
        resize.observe(root);
        mutations.observe(root, {childList: true, subtree: true, characterData: true});
        root.addEventListener('scroll', schedule, true);
        measure();
        return () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            mutations.disconnect();
            root.removeEventListener('scroll', schedule, true);
            listRef.current = null;
        };
    }, [rootRef, enabled]);

    const scrollToLatest = useCallback(() => {
        const list = listRef.current;
        if (!list) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        list.scrollTo({top: list.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth'});
    }, []);

    return {visible, bottom, scrollToLatest};
}
