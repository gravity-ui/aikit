import {renderHook} from '@testing-library/react';

import {
    type UseVirtualStickToBottomParams,
    useVirtualStickToBottom,
} from '../useVirtualStickToBottom';

const scrollToRow = jest.fn();
let listApi: {element: HTMLDivElement; scrollToRow: jest.Mock} | null = null;

jest.mock('react-window', () => ({
    useListCallbackRef: () => [listApi, jest.fn()],
}));

const renderStickHook = (initialProps: UseVirtualStickToBottomParams) =>
    renderHook((props: UseVirtualStickToBottomParams) => useVirtualStickToBottom(props), {
        initialProps,
    });

describe('useVirtualStickToBottom', () => {
    beforeEach(() => {
        scrollToRow.mockClear();
        listApi = {element: document.createElement('div'), scrollToRow};
    });

    it('should pin to the bottom on mount by default', () => {
        renderStickHook({rowCount: 3, messagesCount: 3});
        expect(scrollToRow).toHaveBeenCalled();
    });

    it('should not pin on mount when auto-scroll is disabled', () => {
        renderStickHook({rowCount: 3, messagesCount: 3, autoScroll: false});
        expect(scrollToRow).not.toHaveBeenCalled();
    });

    it('should pin when a message is appended', () => {
        const {rerender} = renderStickHook({rowCount: 3, messagesCount: 3});
        scrollToRow.mockClear();
        rerender({rowCount: 4, messagesCount: 4});
        expect(scrollToRow).toHaveBeenCalled();
    });

    it('should not pin on a new message when auto-scroll is disabled', () => {
        const {rerender} = renderStickHook({rowCount: 3, messagesCount: 3, autoScroll: false});
        scrollToRow.mockClear();
        rerender({rowCount: 4, messagesCount: 4, autoScroll: false});
        expect(scrollToRow).not.toHaveBeenCalled();
    });

    it('should pin on a status change', () => {
        const {rerender} = renderStickHook({rowCount: 3, messagesCount: 3, status: 'streaming'});
        scrollToRow.mockClear();
        rerender({rowCount: 3, messagesCount: 3, status: 'ready'});
        expect(scrollToRow).toHaveBeenCalled();
    });

    it('should not pin on a status change when auto-scroll is disabled', () => {
        const {rerender} = renderStickHook({
            rowCount: 3,
            messagesCount: 3,
            status: 'streaming',
            autoScroll: false,
        });
        scrollToRow.mockClear();
        rerender({rowCount: 3, messagesCount: 3, status: 'ready', autoScroll: false});
        expect(scrollToRow).not.toHaveBeenCalled();
    });

    it('should pin on a streaming tick', () => {
        const {rerender} = renderStickHook({
            rowCount: 3,
            messagesCount: 3,
            isStreaming: true,
            streamingSignal: 'token-1',
        });
        scrollToRow.mockClear();
        rerender({
            rowCount: 3,
            messagesCount: 3,
            isStreaming: true,
            streamingSignal: 'token-2',
        });
        expect(scrollToRow).toHaveBeenCalled();
    });

    it('should not pin on a streaming tick when auto-scroll is disabled', () => {
        const {rerender} = renderStickHook({
            rowCount: 3,
            messagesCount: 3,
            isStreaming: true,
            streamingSignal: 'token-1',
            autoScroll: false,
        });
        scrollToRow.mockClear();
        rerender({
            rowCount: 3,
            messagesCount: 3,
            isStreaming: true,
            streamingSignal: 'token-2',
            autoScroll: false,
        });
        expect(scrollToRow).not.toHaveBeenCalled();
    });

    it('should not pin when only auto-scroll flips from disabled to enabled', () => {
        // No other prop changes here (status/messagesCount stay put), so if autoScroll were ever
        // added to an effect's dependency array, that effect would spuriously re-fire on this
        // transition and - since the ref is already updated by the time effects run - the call
        // would go through uninhibited, unlike the disable direction where the ref masks it.
        const {rerender} = renderStickHook({
            rowCount: 3,
            messagesCount: 3,
            status: 'ready',
            autoScroll: false,
        });
        scrollToRow.mockClear();
        rerender({rowCount: 3, messagesCount: 3, status: 'ready', autoScroll: true});
        expect(scrollToRow).not.toHaveBeenCalled();
    });
});
