import {useEffect, useState} from 'react';

/**
 * Hook for delaying component unmount during animation
 *
 * @param isOpen - Open/close flag
 * @param delayTime - Delay time in milliseconds (default 300ms)
 * @returns shouldRender - Whether the element should be rendered
 */
export function useDelayedUnmount(isOpen: boolean, delayTime = 300) {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            // If opening, show immediately
            setShouldRender(true);
        } else {
            // If closing, wait for animation to complete
            const timeoutId = setTimeout(() => {
                setShouldRender(false);
            }, delayTime);

            return () => clearTimeout(timeoutId);
        }

        return undefined;
    }, [isOpen, delayTime]);

    return shouldRender;
}
