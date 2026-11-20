import {type ReactNode} from 'react';

import {act, fireEvent, renderHook} from '@testing-library/react';

import {ChatViewActivityContext} from '../ChatViewActivity';
import {type MessageListScrollPositionRef} from '../useSmartScroll';
import {useVirtualStickToBottom} from '../useVirtualStickToBottom';

const element = document.createElement('div');
const mockPin = jest.fn();
let mockApi = {element, scrollToRow: mockPin};
jest.mock('../../utils/observeScrollContent', () => ({observeScrollContent: () => () => {}}));

it('keeps following asynchronous programmatic corrections but stops after a reader scroll', () => {
    const scroller = document.createElement('div');
    Object.defineProperties(scroller, {
        scrollHeight: {value: 2000},
        clientHeight: {value: 400},
    });
    scroller.scrollTop = 1000;
    const scrollToRow = jest.fn();
    const api = {element: scroller, scrollToRow, programmaticScrollTop: 900};
    const view = renderHook(
        ({signal}) =>
            useVirtualStickToBottom({
                rowCount: 10,
                messagesCount: 10,
                isStreaming: true,
                streamingSignal: signal,
            }),
        {initialProps: {signal: 0}},
    );
    act(() => view.result.current.listRef(api));
    act(() => {
        scroller.scrollTop = 900;
        fireEvent.scroll(scroller);
    });
    scrollToRow.mockClear();
    view.rerender({signal: 1});
    expect(scrollToRow).toHaveBeenCalled();

    act(() => {
        scroller.scrollTop = 800;
        fireEvent.scroll(scroller);
    });
    scrollToRow.mockClear();
    view.rerender({signal: 2});
    expect(scrollToRow).not.toHaveBeenCalled();
    view.unmount();
});

it('keeps a host-owned reading position across hidden API replacements and a later remount', () => {
    const position: MessageListScrollPositionRef = {current: {scrollTop: 700, isAtBottom: false}};
    Object.defineProperties(element, {
        scrollHeight: {value: 2000, configurable: true},
        clientHeight: {value: 400, configurable: true},
    });
    const previousObserver = global.ResizeObserver;
    global.ResizeObserver = jest.fn() as unknown as typeof ResizeObserver;
    let active = true;
    const wrapper = ({children}: {children: ReactNode}) => (
        <ChatViewActivityContext.Provider
            value={{active, conversationKey: 'conversation', trackScroll: true}}
        >
            {children}
        </ChatViewActivityContext.Provider>
    );
    const renderScroll = () =>
        useVirtualStickToBottom({rowCount: 10, messagesCount: 10, scrollPositionRef: position});
    const view = renderHook(renderScroll, {wrapper});
    act(() => view.result.current.listRef(mockApi));
    expect(element.scrollTop).toBe(700);
    active = false;
    view.rerender();
    element.scrollTop = 0;
    mockApi = {...mockApi};
    act(() => view.result.current.listRef(mockApi));
    view.rerender();
    expect(position.current).toEqual({scrollTop: 700, isAtBottom: false});
    active = true;
    view.rerender();
    expect(element.scrollTop).toBe(700);
    act(() => {
        element.scrollTop = 850;
        fireEvent.scroll(element);
    });
    element.scrollTop = 900;
    view.unmount();
    expect(position.current).toEqual({scrollTop: 900, isAtBottom: false});
    element.scrollTop = 0;
    const remount = renderHook(renderScroll, {wrapper});
    act(() => remount.result.current.listRef(mockApi));
    expect(element.scrollTop).toBe(900);
    expect(mockPin).not.toHaveBeenCalled();
    remount.unmount();
    global.ResizeObserver = previousObserver;
});
