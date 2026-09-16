import {act, render} from '@testing-library/react';

import {useSmartScroll} from '../useSmartScroll';

type ResizeObserverMock = {
    callback: ResizeObserverCallback;
    targets: Set<Element>;
};

const observers: ResizeObserverMock[] = [];

class FakeResizeObserver implements ResizeObserver {
    private readonly entry: ResizeObserverMock;

    constructor(callback: ResizeObserverCallback) {
        this.entry = {callback, targets: new Set()};
        observers.push(this.entry);
    }

    observe(target: Element) {
        this.entry.targets.add(target);
    }

    unobserve(target: Element) {
        this.entry.targets.delete(target);
    }

    disconnect() {
        this.entry.targets.clear();
    }
}

/** Fires every observer that currently watches `target`, as the browser would on a resize. */
function resize(target: Element) {
    act(() => {
        for (const observer of observers) {
            if (observer.targets.has(target)) {
                observer.callback([], {} as ResizeObserver);
            }
        }
    });
}

/** jsdom has no layout, so the geometry the hook reads is set by hand. */
function setGeometry(
    element: HTMLElement,
    {
        scrollTop,
        scrollHeight,
        clientHeight,
    }: Record<'scrollTop' | 'scrollHeight' | 'clientHeight', number>,
) {
    Object.defineProperty(element, 'scrollHeight', {value: scrollHeight, configurable: true});
    Object.defineProperty(element, 'clientHeight', {value: clientHeight, configurable: true});
    Object.defineProperty(element, 'scrollTop', {value: scrollTop, configurable: true});
}

function List({messages, hasPrevious = false}: {messages: string[]; hasPrevious?: boolean}) {
    const {containerRef} = useSmartScroll<HTMLDivElement>({messagesCount: messages.length});

    return (
        <div ref={containerRef} data-testid="list">
            {hasPrevious && <div data-testid="load-trigger" />}
            <div data-testid="messages">
                {messages.map((message) => (
                    <div key={message}>{message}</div>
                ))}
            </div>
            <div data-testid="footer" />
        </div>
    );
}

/** Lets the `childList` MutationObserver deliver its records. */
const flushMutations = () => act(async () => undefined);

describe('useSmartScroll', () => {
    let scrollTo: jest.Mock;
    let originalResizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
        observers.length = 0;
        originalResizeObserver = global.ResizeObserver;
        global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
        scrollTo = jest.fn();
        Element.prototype.scrollTo = scrollTo as unknown as Element['scrollTo'];
    });

    afterEach(() => {
        global.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
    });

    it('re-pins the list when the content reflows without the container resizing', () => {
        const {getByTestId} = render(<List messages={['a', 'b']} />);
        const messages = getByTestId('messages');

        scrollTo.mockClear();
        resize(messages);

        expect(scrollTo).toHaveBeenCalled();
    });

    it('re-pins when any other child of the scroll container changes height', () => {
        const {getByTestId} = render(<List messages={['a']} />);

        scrollTo.mockClear();
        resize(getByTestId('footer'));

        expect(scrollTo).toHaveBeenCalled();
    });

    it('keeps the position after the user scrolled up', () => {
        const {getByTestId} = render(<List messages={['a', 'b']} />);
        const list = getByTestId('list');

        setGeometry(list, {scrollTop: 0, scrollHeight: 1000, clientHeight: 300});
        act(() => {
            list.dispatchEvent(new Event('scroll'));
        });

        scrollTo.mockClear();
        resize(getByTestId('messages'));

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('resumes re-pinning once the user is back at the bottom', () => {
        const {getByTestId} = render(<List messages={['a', 'b']} />);
        const list = getByTestId('list');

        setGeometry(list, {scrollTop: 0, scrollHeight: 1000, clientHeight: 300});
        act(() => {
            list.dispatchEvent(new Event('scroll'));
        });

        setGeometry(list, {scrollTop: 700, scrollHeight: 1000, clientHeight: 300});
        act(() => {
            list.dispatchEvent(new Event('scroll'));
        });

        scrollTo.mockClear();
        resize(getByTestId('messages'));

        expect(scrollTo).toHaveBeenCalled();
    });

    it('picks up a child added later and drops the one removed', async () => {
        const {getByTestId, queryByTestId, rerender} = render(<List messages={['a']} />);

        rerender(<List messages={['a']} hasPrevious />);
        await flushMutations();

        const loadTrigger = getByTestId('load-trigger');
        scrollTo.mockClear();
        resize(loadTrigger);
        expect(scrollTo).toHaveBeenCalled();

        rerender(<List messages={['a']} />);
        await flushMutations();

        expect(queryByTestId('load-trigger')).toBeNull();
        expect(observers.some((observer) => observer.targets.has(loadTrigger))).toBe(false);
    });

    it('stops observing everything on unmount', () => {
        const {unmount} = render(<List messages={['a']} />);

        unmount();

        expect(observers.every((observer) => observer.targets.size === 0)).toBe(true);
    });
});
