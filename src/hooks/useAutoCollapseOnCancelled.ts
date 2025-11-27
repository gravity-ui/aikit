import {useEffect} from 'react';

import type {TToolStatus} from '../types/tool';

export function useAutoCollapseOnCancelled(options: {
    enabled: boolean;
    status: TToolStatus | undefined;
    setIsExpanded: (expanded: boolean) => void;
}): void {
    const {enabled, status, setIsExpanded} = options;
    const isCancelled = status === 'cancelled';

    useEffect(() => {
        if (enabled && isCancelled) {
            setIsExpanded(false);
        }
    }, [enabled, isCancelled, setIsExpanded]);
}
