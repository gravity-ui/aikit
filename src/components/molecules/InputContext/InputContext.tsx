import {createContext} from 'react';

import type {InputContextValue} from './types';

/** Internal React context for `InputContextProvider` / `useInputContext`. */
export const InputContext = createContext<InputContextValue | null>(null);
