import {act, fireEvent, render, screen} from '@testing-library/react';

import {MeasuredMessageList, type MessageRowComponentProps} from '../MeasuredMessageList';

type Row = {height: number};
const originalResizeObserver = global.ResizeObserver;
const observers = new Map<Element, ResizeObserverCallback>();

function Content({index, rows, ariaAttributes}: MessageRowComponentProps<{rows: Row[]}>) {
    return (
        <div {...ariaAttributes} data-testid={`row-${index}`} data-height={rows[index].height} />
    );
}

beforeEach(() => {
    observers.clear();
    jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(480);
    jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
        {},
    ] as unknown as DOMRectList);
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(480);
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
        this: HTMLElement,
    ) {
        return Number(this.firstElementChild?.getAttribute('data-height') ?? 0);
    });
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
    ) {
        return {
            width: 480,
            height: Number(this.firstElementChild?.getAttribute('data-height') ?? 0),
        } as DOMRect;
    });
    global.ResizeObserver = class {
        private callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
            this.callback = callback;
        }
        observe(element: Element) {
            observers.set(element, this.callback);
        }
        disconnect() {
            for (const [element, callback] of observers) {
                if (callback === this.callback) {
                    observers.delete(element);
                }
            }
        }
    } as unknown as typeof ResizeObserver;
});

afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
});

function List({rows, keys}: {rows: Row[]; keys: string[]}) {
    return (
        <MeasuredMessageList
            rowComponent={Content}
            rowProps={{rows}}
            rowKeys={keys}
            rowVersions={rows}
            rowCount={rows.length}
            defaultRowHeight={80}
            overscanCount={5}
            className="list"
            listRef={() => {}}
            onRowsRendered={() => {}}
            data-qa="messages"
        />
    );
}

function parentOf(element: HTMLElement) {
    const parent = element.parentElement;
    if (!parent) {
        throw new Error('Missing parent element');
    }
    return parent;
}

function offset(index: number) {
    return screen.getByTestId(`row-${index}`).parentElement?.parentElement?.style.top;
}

test('remeasures changed content and moves subsequent rows without overlap', () => {
    const rows = [{height: 120}, {height: 60}, {height: 90}];
    const view = render(<List rows={rows} keys={['a', 'b', 'c']} />);
    expect(offset(1)).toBe('120px');
    expect(offset(2)).toBe('180px');
    view.rerender(<List rows={[{height: 240}, rows[1], rows[2]]} keys={['a', 'b', 'c']} />);
    expect(offset(1)).toBe('240px');
    expect(offset(2)).toBe('300px');

    // Delayed content changes, such as diagrams, do not replace the message object.
    const content = screen.getByTestId('row-1');
    content.setAttribute('data-height', '110');
    const measured = content.parentElement;
    if (!measured) {
        throw new Error('Missing measured row');
    }
    act(() => observers.get(measured)?.([], {} as ResizeObserver));
    expect(offset(2)).toBe('350px');
});

test('rebuilds index offsets after prepending and removing rows', () => {
    const rows = [{height: 120}, {height: 60}];
    const view = render(<List rows={rows} keys={['a', 'b']} />);
    view.rerender(<List rows={[{height: 30}, ...rows]} keys={['header', 'a', 'b']} />);
    expect(offset(1)).toBe('30px');
    expect(offset(2)).toBe('150px');
    view.rerender(<List rows={[rows[1]]} keys={['b']} />);
    expect(offset(0)).toBe('0px');
    expect(screen.getByRole('listitem').getAttribute('aria-setsize')).toBe('1');
});

test('uses layout heights rather than transformed visual heights', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 240,
        height: 50,
    } as DOMRect);
    render(<List rows={[{height: 100}, {height: 100}]} keys={['a', 'b']} />);
    expect(offset(1)).toBe('100px');
    const measured = parentOf(screen.getByTestId('row-0'));
    act(() =>
        observers.get(measured)?.(
            [
                {
                    target: measured,
                    borderBoxSize: [{blockSize: 125.5, inlineSize: 480}],
                } as unknown as ResizeObserverEntry,
            ],
            {} as ResizeObserver,
        ),
    );
    expect(offset(1)).toBe('125.5px');
});

test('keeps the reading anchor and old offscreen estimates across width changes', () => {
    const rows = Array.from({length: 40}, (_, index) => ({height: index < 20 ? 500 : 80}));
    render(<List rows={rows} keys={rows.map((_, index) => String(index))} />);
    const scroller = screen.getByRole('list');
    Object.defineProperties(scroller, {
        scrollHeight: {value: 20000},
        clientHeight: {value: 400},
    });
    for (let top = 500; top <= 8100; top += 100) {
        fireEvent.scroll(scroller, {target: {scrollTop: top}});
    }
    expect(screen.getByTestId('row-16')).toBeTruthy();
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
    const viewport = parentOf(scroller);
    act(() => observers.get(viewport)?.([], {} as ResizeObserver));
    expect(scroller.scrollTop).toBe(8100);
    expect(screen.getByTestId('row-16')).toBeTruthy();

    // A mounted overscan row above the anchor grows after wrapping at the new width.
    const measured = parentOf(screen.getByTestId('row-15'));
    act(() =>
        observers.get(measured)?.(
            [
                {
                    target: measured,
                    borderBoxSize: [{blockSize: 700, inlineSize: 400}],
                } as unknown as ResizeObserverEntry,
            ],
            {} as ResizeObserver,
        ),
    );
    expect(scroller.scrollTop).toBe(8300);
    expect(offset(16)).toBe('8200px');

    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(480);
    act(() => observers.get(viewport)?.([], {} as ResizeObserver));
    expect(scroller.scrollTop).toBe(8100);
    expect(offset(16)).toBe('8000px');

    // A reader scroll ends restoration of the previous anchor.
    fireEvent.scroll(scroller, {target: {scrollTop: 8500}});
    act(() =>
        observers.get(measured)?.(
            [
                {
                    target: measured,
                    borderBoxSize: [{blockSize: 700, inlineSize: 480}],
                } as unknown as ResizeObserverEntry,
            ],
            {} as ResizeObserver,
        ),
    );
    expect(scroller.scrollTop).toBe(8500);
});

test('keeps the reading message visible when widening makes it shorter than the saved offset', () => {
    const rows = Array.from({length: 20}, () => ({height: 500}));
    render(<List rows={rows} keys={rows.map((_, index) => String(index))} />);
    const scroller = screen.getByRole('list');
    Object.defineProperty(scroller, 'scrollHeight', {value: 10000});
    fireEvent.scroll(scroller, {target: {scrollTop: 900}});

    const content = screen.getByTestId('row-1');
    const viewport = parentOf(scroller);
    content.setAttribute('data-height', '100');
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(960);
    act(() => observers.get(viewport)?.([], {} as ResizeObserver));

    const anchorTop = parseFloat(offset(1) ?? 'NaN');
    expect(scroller.scrollTop).toBeGreaterThanOrEqual(anchorTop);
    expect(scroller.scrollTop).toBeLessThan(anchorTop + 100);

    // Keep the original reading offset available if the message grows again.
    content.setAttribute('data-height', '500');
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(480);
    act(() => observers.get(viewport)?.([], {} as ResizeObserver));
    expect(scroller.scrollTop).toBe(900);
});
