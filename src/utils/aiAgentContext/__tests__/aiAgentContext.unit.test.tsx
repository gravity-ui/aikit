// src/utils/aiAgentContext/__tests__/aiAgentContext.unit.test.tsx

import React from 'react';

import {renderHook} from '@testing-library/react';

import {AIAgentContextProvider, useAIAgentContext} from '../AIAgentContext';
import {useProvideAIData} from '../AIData';

describe('AIAgentContext', () => {
    describe('without provider', () => {
        it('getData should return empty array', () => {
            const {result} = renderHook(() => useAIAgentContext());
            expect(result.current.getData()).toEqual([]);
        });
    });

    describe('with provider', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => (
            <AIAgentContextProvider>{children}</AIAgentContextProvider>
        );

        it('should return empty array when no data registered', () => {
            const {result} = renderHook(() => useAIAgentContext(), {wrapper});
            expect(result.current.getData()).toEqual([]);
        });

        it('should return registered data', () => {
            const {result} = renderHook(
                () => {
                    useProvideAIData({it: 'Test data', data: {name: 'Alice'}});
                    return useAIAgentContext();
                },
                {wrapper},
            );

            const entries = result.current.getData();
            expect(entries).toHaveLength(1);
            expect(entries[0]).toEqual({it: 'Test data', data: {name: 'Alice'}});
        });

        it('should return data from multiple providers', () => {
            const {result} = renderHook(
                () => {
                    useProvideAIData({it: 'User', data: {name: 'Alice'}});
                    useProvideAIData({it: 'Page', data: {title: 'Dashboard'}});
                    return useAIAgentContext();
                },
                {wrapper},
            );

            const entries = result.current.getData();
            expect(entries).toHaveLength(2);
            expect(entries.map((e) => e.it)).toEqual(['User', 'Page']);
        });

        it('should unregister data on unmount', () => {
            let getDataFromOutside: (() => unknown[]) | undefined;

            const {unmount} = renderHook(
                () => {
                    useProvideAIData({it: 'Temp', data: 'value'});
                    const {getData} = useAIAgentContext();
                    getDataFromOutside = getData;
                },
                {wrapper},
            );

            expect(getDataFromOutside!()).toHaveLength(1);

            unmount();

            expect(getDataFromOutside!()).toHaveLength(0);
        });

        it('should always return fresh data via ref', () => {
            let data = {name: 'Alice'};

            const {result, rerender} = renderHook(
                () => {
                    useProvideAIData({it: 'User', data});
                    return useAIAgentContext();
                },
                {wrapper},
            );

            expect(result.current.getData()[0].data).toEqual({name: 'Alice'});

            data = {name: 'Bob'};
            rerender();

            expect(result.current.getData()[0].data).toEqual({name: 'Bob'});
        });
    });
});
