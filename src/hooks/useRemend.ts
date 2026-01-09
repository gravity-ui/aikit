import {useMemo} from 'react';

import remend from 'remend';

export function useRemend(content: string, enabled: boolean): string {
    return useMemo(() => {
        if (typeof content !== 'string' || content === '') {
            return '';
        }
        if (!enabled) {
            return content;
        }
        try {
            return remend(content.trim());
        } catch {
            return content;
        }
    }, [content, enabled]);
}
