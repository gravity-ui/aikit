import {act, cleanup, fireEvent, renderHook} from '@testing-library/react';

import type {MessageListScrollPositionRef} from '../useSmartScroll';
import {useVirtualStickToBottom} from '../useVirtualStickToBottom';

const resizeObserverDescriptor = Object.getOwnPropertyDescriptor(global, 'ResizeObserver');
let notifyResize: () => void;
jest.mock('../../utils/observeScrollContent', () => ({
    observeScrollContent: (_element: HTMLElement, callback: () => void) => {
        notifyResize = callback;
        return () => {};
    },
}));

let height: number;
let top: number;
let frames: Map<number, FrameRequestCallback>;
let nextFrameId: number;

function advanceFrames(count = 1) {
    for (let index = 0; index < count; index += 1) {
        const callbacks = [...frames.values()];
        frames.clear();
        act(() => callbacks.forEach((callback) => callback(index * 16)));
    }
}

function setup({savedTop = 1200, initialHeight = 400, count = 0, atBottom = false} = {}) {
    height = initialHeight;
    const element = document.createElement('div');
    Object.defineProperties(element, {
        clientHeight: {get: () => 400},
        scrollHeight: {get: () => height},
        scrollTop: {
            get: () => top,
            set: (value: number) => {
                top = Math.min(Math.max(0, value), Math.max(0, height - 400));
            },
        },
    });
    const scrollToRow = jest.fn(() => {
        element.scrollTop = height - 400;
    });
    const position: MessageListScrollPositionRef = {
        current: {scrollTop: savedTop, isAtBottom: atBottom},
    };
    const view = renderHook(
        (messagesCount) =>
            useVirtualStickToBottom({
                rowCount: messagesCount,
                messagesCount,
                scrollPositionRef: position,
            }),
        {initialProps: count},
    );
    act(() => view.result.current.listRef({element, scrollToRow}));
    return {view, element, position, scrollToRow};
}

beforeEach(() => {
    top = 0;
    frames = new Map();
    nextFrameId = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        frames.set(++nextFrameId, callback);
        return nextFrameId;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
        frames.delete(id);
    });
    // Only the existence of ResizeObserver is needed: the content observer above is controlled.
    Object.defineProperty(global, 'ResizeObserver', {configurable: true, value: jest.fn()});
});

afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    if (resizeObserverDescriptor) {
        Object.defineProperty(global, 'ResizeObserver', resizeObserverDescriptor);
    } else {
        Reflect.deleteProperty(global, 'ResizeObserver');
    }
});

it('restores history arriving after the initial frame budget without an endless animation loop', () => {
    const {view, element} = setup();
    advanceFrames(10);
    expect(frames.size).toBe(0);
    expect(element.scrollTop).toBe(0);
    height = 2400;
    view.rerender(30);
    advanceFrames(10);
    expect(element.scrollTop).toBe(1200);
    expect(frames.size).toBe(0);
});

it('retries on content resize even when the message count does not change', () => {
    const {element} = setup({count: 30, initialHeight: 800});
    advanceFrames(10);
    fireEvent.scroll(element);
    height = 2400;
    act(() => notifyResize());
    advanceFrames(10);
    expect(element.scrollTop).toBe(1200);
});

it.each([200, 600])(
    'respects a user scroll to %s in either direction during restoration',
    (nextTop) => {
        const {element, position} = setup({savedTop: 400, initialHeight: 2400, count: 30});
        expect(element.scrollTop).toBe(400);
        element.scrollTop = nextTop;
        fireEvent.scroll(element);
        advanceFrames(10);
        height += 200;
        act(() => notifyResize());
        advanceFrames(10);
        expect(element.scrollTop).toBe(nextTop);
        expect(position.current).toEqual({scrollTop: nextTop, isAtBottom: false});
    },
);

it('ignores scroll events from its own writes while retaining the unreachable saved target', () => {
    const {element, position} = setup();
    fireEvent.scroll(element);
    expect(position.current?.scrollTop).toBe(1200);
    advanceFrames(10);
    height = 2400;
    act(() => notifyResize());
    fireEvent.scroll(element);
    advanceFrames(10);
    expect(element.scrollTop).toBe(1200);
});

it('preserves a pending target when unmounted before history arrives', () => {
    const {view, position} = setup();
    advanceFrames(10);
    view.unmount();
    expect(position.current).toEqual({scrollTop: 1200, isAtBottom: false});
    expect(frames.size).toBe(0);
});

it('continues following the bottom when the user reaches it during restoration', () => {
    const {element, position} = setup({savedTop: 400, initialHeight: 2400, count: 30});
    element.scrollTop = 2000;
    fireEvent.scroll(element);
    advanceFrames(10);
    expect(position.current?.isAtBottom).toBe(true);
    height += 200;
    act(() => notifyResize());
    advanceFrames(10);
    expect(element.scrollTop).toBe(2200);
});

it('keeps following new replies for a reader restored at the bottom', () => {
    const {element, scrollToRow} = setup({atBottom: true, initialHeight: 2400, count: 30});
    advanceFrames(10);
    expect(element.scrollTop).toBe(2000);
    height += 200;
    act(() => notifyResize());
    advanceFrames(10);
    expect(element.scrollTop).toBe(2200);
    expect(scrollToRow).toHaveBeenCalled();
});
