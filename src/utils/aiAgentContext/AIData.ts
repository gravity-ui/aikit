import {useContext, useEffect, useId, useRef} from 'react';

import {_AIAgentContext} from './AIAgentContext';
import type {AIDataProps} from './types';

/**
 * Hook to register data in the AI agent context.
 *
 * Registration happens in `useEffect`, so `getData()` is only meaningful
 * **after mount** of components that register data. Do not call `getData()`
 * synchronously during render or in `useLayoutEffect` in the same commit.
 *
 * Uses a ref + getter pattern: the registry stores `() => propsRef.current`
 * so `getData()` always reads the latest props without re-registering on every render.
 */
export function useProvideAIData<T>(props: AIDataProps<T>): void {
    const ctx = useContext(_AIAgentContext);
    const id = useId();
    const propsRef = useRef(props);
    propsRef.current = props;

    useEffect(() => {
        if (!ctx) {
            // eslint-disable-next-line no-console
            console.warn('useProvideAIData must be used inside AIAgentContextProvider');

            return;
        }

        ctx.register(id, () => propsRef.current);

        // eslint-disable-next-line consistent-return
        return () => {
            ctx.unregister(id);
        };
    }, [ctx, id]);
}

/**
 * Component that registers data in the AI agent context.
 * Pure side-effect — renders nothing.
 */
export function AIData<T>(props: AIDataProps<T>): null {
    useProvideAIData(props);
    return null;
}
