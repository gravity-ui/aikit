import {useEffect} from 'react';

import type {ToolStatus} from '../types/tool';

export function useAutoCollapseOnSuccess(options: {
    enabled: boolean;
    status: ToolStatus | undefined;
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
