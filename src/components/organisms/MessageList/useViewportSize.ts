import {useLayoutEffect, useRef, useState} from 'react';

/** Keep the last visible size while a chat screen is hidden. */
export function useViewportSize() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({height: 0, width: 0});

    useLayoutEffect(() => {
        const element = viewportRef.current;
        if (!element) {
            return undefined;
        }
        const measureViewport = () => {
            const {clientHeight: height, clientWidth: width} = element;
            if (height > 0 && width > 0) {
                setSize((previous) =>
                    previous.height === height && previous.width === width
                        ? previous
                        : {height, width},
                );
            }
        };
        measureViewport();
        const observer = new ResizeObserver(measureViewport);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return {viewportRef, viewportSize: size};
}
