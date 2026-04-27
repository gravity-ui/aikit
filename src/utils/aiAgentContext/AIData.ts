// src/utils/aiAgentContext/AIData.ts

import {useContext, useEffect, useId, useRef} from 'react';

import {_AIAgentContext} from './AIAgentContext';
import type {AIDataProps} from './types';

/**
 * Hook to register data in the AI agent context.
 * Uses ref + getter pattern so getData() always returns fresh values.
 */
export function useProvideAIData<T>(props: AIDataProps<T>): void {
    const ctx = useContext(_AIAgentContext);
    const id = useId();
    const propsRef = useRef(props);
    propsRef.current = props;

    useEffect(() => {
        if (!ctx) {
            // eslint-disable-next-line no-console
            console.warn('AIAgentContext, but you are trying to register data without it');

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
