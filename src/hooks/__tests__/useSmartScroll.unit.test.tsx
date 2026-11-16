import {act, cleanup, fireEvent, render} from '@testing-library/react';

import {type MessageListScrollPositionRef, useSmartScroll} from '../useSmartScroll';

let height = 2000;
let viewportHeight = 400;
let notifyResize: () => void;

jest.mock('../../utils/observeScrollContent', () => ({
    observeScrollContent: (_element: HTMLElement, callback: () => void) => {
        notifyResize = callback;
        return () => {};
    },
}));

function Transcript({
    position,
    count = 10,
    streaming = false,
}: {
    position?: MessageListScrollPositionRef;
    count?: number;
    streaming?: boolean;
}) {
    const {containerRef} = useSmartScroll<HTMLDivElement>({
        messagesCount: count,
        isStreaming: streaming,
        status: streaming ? 'streaming' : 'ready',
        scrollPositionRef: position,
    });
    return <div ref={containerRef} data-testid="transcript" />;
}

beforeEach(() => {
    height = 2000;
    viewportHeight = 400;
    Object.defineProperties(HTMLElement.prototype, {
        scrollHeight: {configurable: true, get: () => height},
        clientHeight: {configurable: true, get: () => viewportHeight},
        scrollTop: {
            configurable: true,
            get() {
                return this._top ?? 0;
            },
            set(top: number) {
                this._top = Math.min(Math.max(0, top), Math.max(0, height - viewportHeight));
            },
        },
        scrollTo: {
            configurable: true,
            value(this: HTMLElement, {top}: ScrollToOptions) {
                this.scrollTop = top ?? 0;
            },
        },
    });
    global.ResizeObserver = jest.fn(() => ({observe() {}, unobserve() {}, disconnect() {}}));
});

afterEach(() => {
    cleanup();
    for (const property of ['scrollHeight', 'clientHeight', 'scrollTop', 'scrollTo']) {
        Reflect.deleteProperty(HTMLElement.prototype, property);
    }
    jest.restoreAllMocks();
});

it('keeps the default bottom-following behavior without persistence', () => {
    const view = render(<Transcript />);
    expect(view.getByTestId('transcript').scrollTop).toBe(1600);
    height += 300;
    act(() => notifyResize());
    expect(view.getByTestId('transcript').scrollTop).toBe(1900);
});

it('restores a reading position across unmounts and does not follow new content', () => {
    const position: MessageListScrollPositionRef = {current: undefined};
    const first = render(<Transcript position={position} />);
    const element = first.getByTestId('transcript');
    element.scrollTop = 350;
    fireEvent.scroll(element);
    first.unmount();
    expect(position.current).toEqual({scrollTop: 350, isAtBottom: false});

    const next = render(<Transcript position={position} streaming />);
    const restored = next.getByTestId('transcript');
    expect(restored.scrollTop).toBe(350);
    height += 500;
    act(() => notifyResize());
    next.rerender(<Transcript position={position} streaming count={12} />);
    expect(restored.scrollTop).toBe(350);
});

it('follows replies received while unmounted when the reader was at the bottom', () => {
    const position: MessageListScrollPositionRef = {current: undefined};
    const first = render(<Transcript position={position} />);
    first.unmount();
    expect(position.current?.isAtBottom).toBe(true);
    height += 700;
    const next = render(<Transcript position={position} />);
    expect(next.getByTestId('transcript').scrollTop).toBe(2300);
});

it('resumes following when the user scrolls back to the bottom', () => {
    const position: MessageListScrollPositionRef = {
        current: {scrollTop: 350, isAtBottom: false},
    };
    const view = render(<Transcript position={position} />);
    const element = view.getByTestId('transcript');
    element.scrollTop = 1600;
    fireEvent.scroll(element);
    height += 200;
    act(() => notifyResize());
    expect(element.scrollTop).toBe(1800);
});

it('finishes restoring when delayed message content becomes tall enough', () => {
    const position: MessageListScrollPositionRef = {
        current: {scrollTop: 1200, isAtBottom: false},
    };
    height = 800;
    const view = render(<Transcript position={position} />);
    const element = view.getByTestId('transcript');
    expect(element.scrollTop).toBe(400);
    fireEvent.scroll(element);
    height = 2000;
    act(() => notifyResize());
    expect(element.scrollTop).toBe(1200);
});

it('lets a user scroll cancel restoration of delayed content', () => {
    const position: MessageListScrollPositionRef = {
        current: {scrollTop: 1200, isAtBottom: false},
    };
    height = 800;
    const view = render(<Transcript position={position} />);
    const element = view.getByTestId('transcript');
    element.scrollTop = 100;
    fireEvent.scroll(element);
    height = 2000;
    act(() => notifyResize());
    expect(element.scrollTop).toBe(100);
});

it('captures the last offset at unmount even before a scroll event is delivered', () => {
    const position: MessageListScrollPositionRef = {
        current: {scrollTop: 350, isAtBottom: false},
    };
    const view = render(<Transcript position={position} />);
    view.getByTestId('transcript').scrollTop = 500;
    view.unmount();
    expect(position.current).toEqual({scrollTop: 500, isAtBottom: false});
});
