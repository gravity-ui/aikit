import {act, renderHook, waitFor} from '@testing-library/react';

import {
    type RemoteChatActivityState,
    createChatActivityStore,
    createRemoteChatActivityStore,
} from '../utils/chatActivity';

import {type ChatActivityView, useChatActivity} from './useChatActivity';

beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'visible'});
});

function setup() {
    const store = createChatActivityStore({accountId: 'alice'});
    const view: ChatActivityView = {chatId: 'a', isPanelVisible: true};
    const hook = renderHook((props: ChatActivityView) => useChatActivity(store, props), {
        initialProps: view,
    });
    return {store, ...hook};
}

function complete(store: ReturnType<typeof setup>['store'], chatId: string, responseId: string) {
    act(() => {
        const request = store.startGeneration(chatId);
        request.responseReceived(responseId);
        request.finish();
    });
}

test('selection and history subscription do not acknowledge an answer until its content renders', () => {
    const {store, result, rerender} = setup();
    const history = renderHook(() => useChatActivity(store));
    complete(store, 'a', 'a1');
    complete(store, 'b', 'b1');
    expect(history.result.current.hasUnread).toBe(true);
    expect(result.current.chats.a.hasUnread).toBe(true);
    rerender({chatId: 'a', isPanelVisible: true, renderedResponseId: 'a1'});
    expect(result.current.chats.a.hasUnread).toBe(false);
    expect(result.current.chats.b.hasUnread).toBe(true);
});

test('hidden panel and inactive tab retain unread answers until visible rendered content returns', () => {
    const {store, result, rerender} = setup();
    rerender({chatId: 'a', isPanelVisible: false, renderedResponseId: 'a1'});
    complete(store, 'a', 'a1');
    expect(result.current.chats.a.hasUnread).toBe(true);
    Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'hidden'});
    rerender({chatId: 'a', isPanelVisible: true, renderedResponseId: 'a1'});
    expect(result.current.chats.a.hasUnread).toBe(true);
    act(() => {
        Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'visible'});
        document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.hasUnread).toBe(false);
});

test('opening a generating chat does not mark its future response as viewed after leaving it', () => {
    const {store, result, rerender} = setup();
    let request: ReturnType<typeof store.startGeneration>;
    act(() => {
        request = store.startGeneration('a');
    });
    rerender({chatId: 'b', isPanelVisible: true});
    act(() => {
        request.responseReceived('a1');
        request.finish();
    });
    expect(result.current.chats.a.hasUnread).toBe(true);
    rerender({chatId: 'a', isPanelVisible: true, renderedResponseId: 'a1'});
    complete(store, 'a', 'a2');
    expect(result.current.chats.a.hasUnread).toBe(true);
    rerender({chatId: 'a', isPanelVisible: true, renderedResponseId: 'a2'});
    expect(result.current.hasUnread).toBe(false);
});

test('a rendered answer in the current visible chat is acknowledged on completion', () => {
    const {store, result, rerender} = setup();
    rerender({chatId: 'a', isPanelVisible: true, renderedResponseId: 'a1'});
    complete(store, 'a', 'a1');
    expect(result.current).toMatchObject({isGenerating: false, hasUnread: false});
});

test('server acknowledgement failures are reported once and retry when the panel is reopened', async () => {
    const cause = new Error('offline');
    const initialState = {
        accountId: 'alice',
        revision: 1,
        chats: {a: {isGenerating: false, hasUnread: true, responseId: 'a1'}},
    };
    const markResponseViewed = jest
        .fn()
        .mockRejectedValueOnce(cause)
        .mockResolvedValueOnce({
            ...initialState,
            revision: 2,
            chats: {a: {...initialState.chats.a, hasUnread: false}},
        });
    const store = createRemoteChatActivityStore({
        accountId: 'alice',
        initialState,
        markResponseViewed,
    });
    const view: ChatActivityView = {chatId: 'a', renderedResponseId: 'a1', isPanelVisible: true};
    const {result, rerender} = renderHook(
        (props: ChatActivityView) => useChatActivity(store, props),
        {initialProps: view},
    );
    await waitFor(() => expect(result.current.error?.cause).toBe(cause));
    expect(result.current.hasUnread).toBe(true);
    rerender({...view});
    expect(markResponseViewed).toHaveBeenCalledTimes(1);
    rerender({...view, isPanelVisible: false});
    rerender(view);
    await waitFor(() => expect(result.current.hasUnread).toBe(false));
    expect(markResponseViewed).toHaveBeenCalledTimes(2);
});

test('async initial-load failures are observable without unhandled rejections or retry loops', async () => {
    const cause = new Error('offline');
    const load = jest.fn().mockRejectedValue(cause);
    const store = createRemoteChatActivityStore({
        accountId: 'alice',
        load,
        markResponseViewed: jest.fn(),
    });
    const {result, rerender} = renderHook(() => useChatActivity(store));
    await waitFor(() => expect(result.current.error?.cause).toBe(cause));
    expect(result.current.isLoading).toBe(false);
    rerender();
    expect(load).toHaveBeenCalledTimes(1);
});

test('switching accounts disconnects pending server results from the displayed state', async () => {
    let resolve!: (state: RemoteChatActivityState) => void;
    const first = createRemoteChatActivityStore({
        accountId: 'alice',
        load: () =>
            new Promise((done) => {
                resolve = done;
            }),
        markResponseViewed: jest.fn(),
    });
    const second = createRemoteChatActivityStore({
        accountId: 'bob',
        initialState: {
            accountId: 'bob',
            revision: 1,
            chats: {b: {hasUnread: true, isGenerating: false, responseId: 'b1'}},
        },
        markResponseViewed: jest.fn(),
    });
    const {result, rerender} = renderHook((store) => useChatActivity(store), {initialProps: first});
    await waitFor(() => expect(resolve).toBeDefined());
    rerender(second);
    await act(async () => {
        resolve({
            accountId: 'alice',
            revision: 2,
            chats: {a: {isGenerating: true, hasUnread: false}},
        });
        await first.load();
    });
    expect(result.current.chats.a).toBeUndefined();
    expect(result.current.chats.b.hasUnread).toBe(true);
    expect(result.current.isGenerating).toBe(false);
});

test('class stores retain their receiver and stable subscriptions across renders and account changes', () => {
    class ExternalStore {
        snapshot = {chats: {}, isGenerating: false, hasUnread: false};
        listeners = new Set<() => void>();
        subscriptions = 0;
        getSnapshot() {
            return this.snapshot;
        }
        subscribe(listener: () => void) {
            this.subscriptions++;
            this.listeners.add(listener);
            return () => {
                this.listeners.delete(listener);
            };
        }
        markResponseViewed() {}
        deleteChat() {}
        publish() {
            this.snapshot = {...this.snapshot, hasUnread: true};
            this.listeners.forEach((listener) => listener());
        }
    }
    const first = new ExternalStore();
    const second = new ExternalStore();
    const {result, rerender, unmount} = renderHook((store) => useChatActivity(store), {
        initialProps: first,
    });
    rerender(first);
    expect(first.subscriptions).toBe(1);
    act(() => {
        first.publish();
    });
    expect(result.current.hasUnread).toBe(true);
    rerender(second);
    expect(first.listeners.size).toBe(0);
    expect(second.listeners.size).toBe(1);
    expect(result.current.hasUnread).toBe(false);
    act(() => {
        first.publish();
    });
    expect(result.current.hasUnread).toBe(false);
    unmount();
    expect(second.listeners.size).toBe(0);
});
