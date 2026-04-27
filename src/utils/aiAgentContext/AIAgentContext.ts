// src/utils/aiAgentContext/AIAgentContext.ts

import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';

import type {AIAgentContextAPI, AIAgentContextValue, AIDataEntry, AIDataProps} from './types';

const AIAgentContext = createContext<AIAgentContextValue | null>(null);

/** Raw context — internal use only, not exported from the package. */
export {AIAgentContext as _AIAgentContext};

/**
 * Provider that manages the AI data registry.
 * Wrap your app or chat area with this to enable AIData collection.
 */
export function AIAgentContextProvider({children}: {children: React.ReactNode}) {
    const registryRef = useRef(new Map<string, () => AIDataProps>());

    const contextValue = useMemo<AIAgentContextValue>(
        () => ({
            register: (id: string, getter: () => AIDataProps) => {
                registryRef.current.set(id, getter);
            },
            unregister: (id: string) => {
                registryRef.current.delete(id);
            },
            getData: (): AIDataEntry[] =>
                Array.from(registryRef.current.values()).map((getter) => {
                    const {it, data} = getter();
                    return {it, data};
                }),
        }),
        [],
    );

    return React.createElement(AIAgentContext.Provider, {value: contextValue}, children);
}

/**
 * Hook for consumers to access registered AI data.
 * Returns { getData } where getData() returns the current list of all entries.
 * If no AIAgentContextProvider exists above, getData() returns [].
 */
export function useAIAgentContext<T = unknown>(): AIAgentContextAPI<T> {
    const ctx = useContext(AIAgentContext);

    const getData = useCallback((): AIDataEntry<T>[] => {
        if (!ctx) return [];
        return ctx.getData() as AIDataEntry<T>[];
    }, [ctx]);

    return useMemo(() => ({getData}), [getData]);
}
