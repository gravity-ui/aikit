import {act, renderHook} from '@testing-library/react';

import {useDelayedUnmount} from '../useDelayedUnmount';

describe('useDelayedUnmount', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should initialize with provided isOpen value', () => {
        const {result} = renderHook(() => useDelayedUnmount(true));

        expect(result.current).toBe(true);
    });

    it('should immediately show element when isOpen=true', () => {
        const {result, rerender} = renderHook(({isOpen}) => useDelayedUnmount(isOpen), {
            initialProps: {isOpen: false},
        });

        expect(result.current).toBe(false);

        rerender({isOpen: true});

        expect(result.current).toBe(true);
    });

    it('should delay hiding element when isOpen=false', () => {
        const {result, rerender} = renderHook(({isOpen}) => useDelayedUnmount(isOpen, 300), {
            initialProps: {isOpen: true},
        });

        expect(result.current).toBe(true);

        rerender({isOpen: false});

        // Element is still visible immediately after change
        expect(result.current).toBe(true);

        // Advance to half animation time
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Element is still visible
        expect(result.current).toBe(true);

        // Advance to full animation time
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Element is hidden after delay
        expect(result.current).toBe(false);
    });

    it('should use custom delay time', () => {
        const customDelay = 500;
        const {result, rerender} = renderHook(
            ({isOpen}) => useDelayedUnmount(isOpen, customDelay),
            {
                initialProps: {isOpen: true},
            },
        );

        rerender({isOpen: false});

        act(() => {
            jest.advanceTimersByTime(300);
        });

        // With custom delay of 500ms, element is still visible after 300ms
        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Now hidden after full delay
        expect(result.current).toBe(false);
    });

    it('should cancel timer on unmount', () => {
        const {result, rerender, unmount} = renderHook(
            ({isOpen}) => useDelayedUnmount(isOpen, 300),
            {
                initialProps: {isOpen: true},
            },
        );

        rerender({isOpen: false});

        expect(result.current).toBe(true);

        // Unmounting should cancel timer
        unmount();

        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Verify there are no memory leaks or unexpected updates
        expect(jest.getTimerCount()).toBe(0);
    });

    it('should correctly handle rapid toggles', () => {
        const {result, rerender} = renderHook(({isOpen}) => useDelayedUnmount(isOpen, 300), {
            initialProps: {isOpen: true},
        });

        // Close
        rerender({isOpen: false});

        expect(result.current).toBe(true);

        // Immediately open again before animation completes
        act(() => {
            jest.advanceTimersByTime(100);
        });

        rerender({isOpen: true});

        // Should remain visible
        expect(result.current).toBe(true);

        // Wait remaining time
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Still visible because isOpen=true
        expect(result.current).toBe(true);
    });
});
