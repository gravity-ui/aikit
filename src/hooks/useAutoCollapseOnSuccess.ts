import {useEffect} from 'react';

import type {TToolStatus} from '../types/tool';

export function useAutoCollapseOnSuccess(options: {
    enabled: boolean;
    status: TToolStatus | undefined;
    setIsExpanded: (expanded: boolean) => void;
}): void {
    const {enabled, status, setIsExpanded} = options;
    const isSuccess = status === 'success';

    useEffect(() => {
        if (enabled && isSuccess) {
            setIsExpanded(false);
        }
    }, [enabled, isSuccess, setIsExpanded]);
}
