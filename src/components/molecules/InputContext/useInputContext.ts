import {useContext} from 'react';

import {InputContext} from './InputContext';
import type {InputContextValue} from './types';

/**
 * Returns attachment context (files, header chips, send helpers).
 * Must be used only under `InputContextProvider`.
 */
export function useInputContext(): InputContextValue {
    const ctx = useContext(InputContext);
    if (!ctx) {
        throw new Error('useInputContext must be used within InputContextProvider');
    }
    return ctx;
}
