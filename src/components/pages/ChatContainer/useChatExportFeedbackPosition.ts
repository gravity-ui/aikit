import {type CSSProperties, type RefObject, useLayoutEffect, useState} from 'react';

/** Keep portalled feedback anchored to the chat, including inside the selection dialog. */
export function useChatExportFeedbackPosition(ref: RefObject<HTMLElement>, visible: boolean) {
    const [position, setPosition] = useState<CSSProperties>();
    useLayoutEffect(() => {
        const element = ref.current;
        if (!visible || !element) return undefined;
        const update = () => {
            const {top, left, width, height} = element.getBoundingClientRect();
            setPosition({top, left, width, height});
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        window.visualViewport?.addEventListener('resize', update);
        window.visualViewport?.addEventListener('scroll', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
            window.visualViewport?.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('scroll', update);
        };
    }, [ref, visible]);
    return position;
}
