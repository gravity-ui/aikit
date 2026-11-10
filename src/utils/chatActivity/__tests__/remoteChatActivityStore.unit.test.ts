import {
    type RemoteChatActivityState,
    createRemoteChatActivityStore,
} from '../remoteChatActivityStore';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return {promise, resolve, reject};
}

function state(revision: number, responseId = 'a1', hasUnread = true): RemoteChatActivityState {
    return {accountId: 'alice', revision, chats: {a: {isGenerating: false, hasUnread, responseId}}};
}

function setup(options: Partial<Parameters<typeof createRemoteChatActivityStore>[0]> = {}) {
    return createRemoteChatActivityStore({
        accountId: 'alice',
        markResponseViewed: jest.fn(),
        ...options,
    });
}

test('derives summaries from immutable server rows and ignores equal or older revisions', async () => {
    const row = {isGenerating: false, hasUnread: true, responseId: 'a1'};
    const initial = {...state(0), chats: {a: row}};
    const load = jest.fn();
    const store = setup({initialState: initial, load});
    expect(store.getSnapshot()).toMatchObject({revision: 0, hasUnread: true, isGenerating: false});
    row.hasUnread = false;
    expect(store.getSnapshot().chats.a.hasUnread).toBe(true);
    store.applySnapshot({
        ...state(2),
        chats: {...state(2).chats, b: {isGenerating: true, hasUnread: false}},
    });
    const snapshot = store.getSnapshot();
    expect(snapshot).toMatchObject({isGenerating: true, hasUnread: true});
    store.applySnapshot(state(1, 'old', false));
    store.applySnapshot(state(2, 'duplicate', false));
    expect(store.getSnapshot()).toBe(snapshot);
    await store.load();
    expect(load).not.toHaveBeenCalled();
});

test('coalesces initial loads and keeps a newer push received while loading', async () => {
    const pending = deferred<RemoteChatActivityState>();
    const load = jest.fn(() => pending.promise);
    const store = setup({load});
    const first = store.load();
    expect(store.load()).toBe(first);
    expect(store.getSnapshot().isLoading).toBe(true);
    store.applySnapshot(state(5, 'new'));
    pending.resolve(state(3, 'old', false));
    await first;
    expect(load).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toMatchObject({revision: 5, isLoading: false, hasUnread: true});
    expect(store.getSnapshot().chats.a.responseId).toBe('new');
});

test('reports failed loads without changing existing activity and supports explicit retry', async () => {
    const failure = new Error('offline');
    const load = jest.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(state(2, 'a2'));
    const onError = jest.fn();
    const store = setup({initialState: state(1), load, onError});
    await expect(store.refresh()).rejects.toBe(failure);
    expect(store.getSnapshot()).toMatchObject({
        revision: 1,
        hasUnread: true,
        isLoading: false,
        error: {operation: 'load', cause: failure},
    });
    expect(onError).toHaveBeenCalledWith({operation: 'load', cause: failure});
    await store.refresh();
    expect(store.getSnapshot()).toMatchObject({revision: 2, error: undefined, isLoading: false});
});

test('deduplicates acknowledgements and waits for authoritative server confirmation', async () => {
    const pending = deferred<RemoteChatActivityState>();
    const markResponseViewed = jest.fn(() => pending.promise);
    const store = setup({initialState: state(1), markResponseViewed});
    const first = store.markResponseViewed('a', 'a1');
    expect(store.markResponseViewed('a', 'a1')).toBe(first);
    await Promise.resolve();
    expect(markResponseViewed).toHaveBeenCalledTimes(1);
    expect(markResponseViewed).toHaveBeenCalledWith('a', 'a1');
    expect(store.getSnapshot().hasUnread).toBe(true);
    pending.resolve(state(2, 'a1', false));
    await first;
    expect(store.getSnapshot().hasUnread).toBe(false);
});

test('a late acknowledgement cannot clear a newer response delivered by push', async () => {
    const pending = deferred<RemoteChatActivityState>();
    const store = setup({initialState: state(1), markResponseViewed: () => pending.promise});
    const acknowledgement = store.markResponseViewed('a', 'a1');
    store.applySnapshot(state(4, 'a2'));
    pending.resolve(state(2, 'a1', false));
    await acknowledgement;
    expect(store.getSnapshot()).toMatchObject({revision: 4, hasUnread: true});
    expect(store.getSnapshot().chats.a.responseId).toBe('a2');
});

test('failed acknowledgements preserve unread state and can be retried', async () => {
    const failure = new Error('write failed');
    const markResponseViewed = jest
        .fn()
        .mockRejectedValueOnce(failure)
        .mockResolvedValueOnce(state(2, 'a1', false));
    const onError = jest.fn();
    const store = setup({initialState: state(1), markResponseViewed, onError});
    await expect(store.markResponseViewed('a', 'a1')).rejects.toBe(failure);
    expect(store.getSnapshot()).toMatchObject({
        hasUnread: true,
        error: {operation: 'markResponseViewed', chatId: 'a', responseId: 'a1', cause: failure},
    });
    expect(onError).toHaveBeenCalledTimes(1);
    await store.markResponseViewed('a', 'a1');
    expect(store.getSnapshot()).toMatchObject({hasUnread: false, error: undefined});
});

test('query-cache integrations can supply pushed state separately after a void acknowledgement', async () => {
    const store = setup({initialState: state(1), markResponseViewed: async () => {}});
    await store.markResponseViewed('a', 'a1');
    expect(store.getSnapshot().hasUnread).toBe(true);
    store.applySnapshot(state(2, 'a1', false));
    expect(store.getSnapshot().hasUnread).toBe(false);
});

test('does not send acknowledgements for missing, viewed or different responses', async () => {
    const markResponseViewed = jest.fn();
    const store = setup({initialState: state(1), markResponseViewed});
    await store.markResponseViewed('missing', 'a1');
    await store.markResponseViewed('a', 'old');
    store.applySnapshot(state(2, 'a1', false));
    await store.markResponseViewed('a', 'a1');
    expect(markResponseViewed).not.toHaveBeenCalled();
});

test('deletion filters even newer in-flight snapshots without deleting other chats', async () => {
    const pending = deferred<RemoteChatActivityState>();
    const store = setup({initialState: state(1), markResponseViewed: () => pending.promise});
    const acknowledgement = store.markResponseViewed('a', 'a1');
    await Promise.resolve();
    store.deleteChat('a');
    pending.resolve({
        ...state(2),
        chats: {...state(2).chats, b: {hasUnread: true, isGenerating: false, responseId: 'b1'}},
    });
    await acknowledgement;
    expect(store.getSnapshot().chats.a).toBeUndefined();
    expect(store.getSnapshot().chats.b.hasUnread).toBe(true);
    store.applySnapshot(state(3));
    expect(store.getSnapshot()).toMatchObject({chats: {}, hasUnread: false});
});

test('a command failure after deleting its chat does not surface an obsolete error', async () => {
    const pending = deferred<RemoteChatActivityState>();
    const onError = jest.fn();
    const store = setup({
        initialState: state(1),
        markResponseViewed: () => pending.promise,
        onError,
    });
    const acknowledgement = store.markResponseViewed('a', 'a1');
    await Promise.resolve();
    store.deleteChat('a');
    pending.reject(new Error('chat no longer exists'));
    await acknowledgement;
    expect(store.getSnapshot()).toMatchObject({hasUnread: false, error: undefined});
    expect(onError).not.toHaveBeenCalled();
});

test('rejects snapshots from another account without altering the current state', () => {
    const store = setup({initialState: state(1)});
    const previous = store.getSnapshot();
    expect(() => store.applySnapshot({...state(2), accountId: 'bob'})).toThrow('another account');
    expect(store.getSnapshot()).toBe(previous);
});

test('rejects unordered revision values and unread rows without response identifiers', () => {
    const store = setup({initialState: state(1)});
    const previous = store.getSnapshot();
    expect(() => store.applySnapshot(state(NaN))).toThrow('revision');
    expect(() =>
        store.applySnapshot({...state(2), chats: {a: {isGenerating: false, hasUnread: true}}}),
    ).toThrow('response identifier');
    expect(store.getSnapshot()).toBe(previous);
});

test('a server-confirmed acknowledgement ignores a late failure even after a newer reply', async () => {
    const pending = deferred<void>();
    const onError = jest.fn();
    const store = setup({
        initialState: state(1),
        markResponseViewed: () => pending.promise,
        onError,
    });
    const acknowledgement = store.markResponseViewed('a', 'a1');
    await Promise.resolve();
    store.applySnapshot(state(2, 'a1', false));
    store.applySnapshot(state(3, 'a2'));
    pending.reject(new Error('timeout'));
    await expect(acknowledgement).resolves.toBeUndefined();
    expect(onError).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({revision: 3, hasUnread: true, error: undefined});
});

test('a later authoritative read clears only the matching acknowledgement error', async () => {
    const store = setup({
        initialState: state(1),
        markResponseViewed: () => Promise.reject(new Error('timeout')),
    });
    await expect(store.markResponseViewed('a', 'a1')).rejects.toThrow('timeout');
    store.applySnapshot(state(2, 'a2'));
    expect(store.getSnapshot().error?.responseId).toBe('a1');
    store.applySnapshot(state(3, 'a1', false));
    expect(store.getSnapshot().error).toBeUndefined();
});

test('a read confirmation does not clear an unrelated load error', async () => {
    const failure = new Error('load failed');
    const store = setup({initialState: state(1), load: () => Promise.reject(failure)});
    await expect(store.refresh()).rejects.toBe(failure);
    store.applySnapshot(state(2, 'a1', false));
    expect(store.getSnapshot().error).toMatchObject({operation: 'load', cause: failure});
});
