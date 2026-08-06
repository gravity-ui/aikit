import {act, renderHook} from '@testing-library/react';

import type {UseMascotStateOptions} from '../useMascotState';
import {useMascotState} from '../useMascotState';

describe('useMascotState', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const renderMascotHook = (initialProps: UseMascotStateOptions) =>
        renderHook((props: UseMascotStateOptions) => useMascotState(props), {initialProps});

    it('derives hero reading from typing', () => {
        const {result, rerender} = renderMascotHook({view: 'hero'});
        expect(result.current).toBe('idle');
        rerender({view: 'hero', isTyping: true});
        expect(result.current).toBe('reading');
    });

    it('derives chat reading from typing while ready', () => {
        const {result, rerender} = renderMascotHook({view: 'chat'});
        rerender({view: 'chat', isTyping: true});
        expect(result.current).toBe('reading');
    });

    it('plays reveal once on initial chat mount', () => {
        const {result} = renderMascotHook({view: 'chat', onceDurations: {reveal: 480}});
        expect(result.current).toBe('reveal');
        act(() => jest.advanceTimersByTime(480));
        expect(result.current).toBe('idle');
    });

    it('plays done for both short and streaming success paths', () => {
        const {result, rerender} = renderMascotHook({view: 'chat', status: 'submitted'});
        expect(result.current).toBe('thinking');
        rerender({view: 'chat', status: 'ready'});
        expect(result.current).toBe('done');
        rerender({view: 'chat', status: 'ready', activitySignal: 1});
        expect(result.current).toBe('done');
        act(() => jest.advanceTimersByTime(600));
        expect(result.current).toBe('idle');

        rerender({view: 'chat', status: 'streaming'});
        expect(result.current).toBe('thinking');
        rerender({view: 'chat', status: 'ready'});
        expect(result.current).toBe('done');
    });

    it('does not restart error while the status remains error', () => {
        const {result, rerender} = renderMascotHook({view: 'chat', status: 'ready'});
        rerender({view: 'chat', status: 'error'});
        expect(result.current).toBe('error');
        act(() => jest.advanceTimersByTime(820));
        expect(result.current).toBe('idle');
        rerender({view: 'chat', status: 'error', activitySignal: 1});
        expect(result.current).toBe('idle');
    });

    it('ignores the initial stop token and reacts to the next token', () => {
        const {result, rerender} = renderMascotHook({view: 'chat', stopSignal: 10});
        act(() => jest.advanceTimersByTime(480));
        expect(result.current).toBe('idle');
        rerender({view: 'chat', stopSignal: 11});
        expect(result.current).toBe('stopped');
    });

    it('cancels a once state while overridden and recomputes after removal', () => {
        const {result, rerender} = renderMascotHook({view: 'chat'});
        rerender({view: 'chat', stateOverride: 'listening'});
        expect(result.current).toBe('listening');
        act(() => jest.advanceTimersByTime(1_000));
        rerender({view: 'chat'});
        expect(result.current).toBe('idle');
    });

    it('sleeps after inactivity and wakes on activity', () => {
        const {result, rerender} = renderMascotHook({
            view: 'chat',
            onceDurations: {reveal: 0},
            sleepDelayMs: 100,
        });
        act(() => jest.advanceTimersByTime(0));
        expect(result.current).toBe('idle');
        act(() => jest.advanceTimersByTime(100));
        expect(result.current).toBe('sleeping');
        rerender({view: 'chat', sleepDelayMs: 100, activitySignal: 1});
        expect(result.current).toBe('idle');
    });
});
