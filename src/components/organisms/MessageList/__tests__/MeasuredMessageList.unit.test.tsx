import {act, render, screen} from '@testing-library/react';

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
