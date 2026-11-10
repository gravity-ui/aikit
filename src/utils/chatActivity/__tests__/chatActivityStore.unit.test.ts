import {createChatActivityStore} from '../chatActivityStore';

function setup(accountId = 'alice') {
    return createChatActivityStore({accountId, storage: localStorage});
}

function complete(store: ReturnType<typeof setup>, chatId: string, responseId: string) {
    const request = store.startGeneration(chatId);
    request.responseReceived(responseId);
    request.finish();
    return request;
}

beforeEach(() => localStorage.clear());

test('tracks parallel generations from dispatch through text, tools and inter-chunk pauses', () => {
    const store = setup();
    const a = store.startGeneration('a');
    const b = store.startGeneration('b');
    expect(store.getSnapshot()).toMatchObject({isGenerating: true, hasUnread: false});
    a.responseReceived('a1');
    expect(store.getSnapshot().chats.a).toMatchObject({isGenerating: true, hasUnread: false});
    a.finish();
    expect(store.getSnapshot()).toMatchObject({isGenerating: true, hasUnread: true});
    expect(store.getSnapshot().chats.a).toMatchObject({isGenerating: false, hasUnread: true});
    b.responseReceived('b1');
    b.finish();
    store.markResponseViewed('b', 'b1');
    expect(store.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: true});
    store.markResponseViewed('a', 'a1');
    expect(store.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: false});
});

test('retains unread markers during subsequent requests and rejects stale acknowledgements', () => {
    const store = setup();
    complete(store, 'a', 'a1');
    const next = store.startGeneration('a');
    expect(store.getSnapshot().chats.a).toMatchObject({isGenerating: true, hasUnread: true});
    next.responseReceived('a2');
    next.finish();
    store.markResponseViewed('a', 'a1');
    expect(store.getSnapshot().chats.a).toMatchObject({responseId: 'a2', hasUnread: true});
});

test.each(['success', 'stop', 'error'])(
    '%s terminates activity without inventing an answer',
    () => {
        const store = setup();
        store.startGeneration('empty').finish();
        expect(store.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: false});
        complete(store, 'partial', 'text-before-terminal-event');
        expect(store.getSnapshot().chats.partial.hasUnread).toBe(true);
    },
);

test('late output and completion cannot replace a newer request or revive a deleted chat', () => {
    const store = setup();
    const previous = store.startGeneration('a');
    const latest = store.startGeneration('a');
    previous.responseReceived('old');
    previous.finish();
    expect(store.getSnapshot().chats.a.isGenerating).toBe(true);
    latest.responseReceived('new');
    latest.finish();
    previous.finish();
    expect(store.getSnapshot().chats.a.responseId).toBe('new');
    const deleted = store.startGeneration('a');
    store.deleteChat('a');
    deleted.responseReceived('deleted');
    deleted.finish();
    expect(store.getSnapshot().chats.a).toBeUndefined();
    expect(store.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: false});
});

test('restores unread and viewed markers per account without persisting active requests', () => {
    const store = setup();
    complete(store, 'read', 'read1');
    store.markResponseViewed('read', 'read1');
    complete(store, 'unread', 'unread1');
    store.startGeneration('pending');
    const restored = setup();
    restored.load();
    expect(restored.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: true});
    expect(restored.getSnapshot().chats.read.hasUnread).toBe(false);
    expect(restored.getSnapshot().chats.pending).toBeUndefined();
    complete(restored, 'read', 'read1');
    expect(restored.getSnapshot().chats.read.hasUnread).toBe(false);
    const bob = setup('bob');
    bob.load();
    expect(bob.getSnapshot().chats).toEqual({});
    restored.deleteChat('unread');
    const reloaded = setup();
    reloaded.load();
    expect(reloaded.getSnapshot().hasUnread).toBe(false);
});

test('persistence failures leave generation lifecycle usable and report the error', () => {
    const onPersistenceError = jest.fn();
    const store = createChatActivityStore({
        accountId: 'alice',
        storage: {
            length: 0,
            key: () => null,
            getItem: () => '{broken',
            setItem: () => {
                throw new Error('quota');
            },
        },
        onPersistenceError,
    });
    complete(store, 'a', 'a1');
    expect(store.getSnapshot()).toMatchObject({isGenerating: false, hasUnread: true});
    expect(onPersistenceError).toHaveBeenCalled();
});

function sharedStorage() {
    const values = new Map<string, string>();
    return {
        get length() {
            return values.size;
        },
        key: (index: number) => [...values.keys()][index] ?? null,
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
        removeItem: (key: string) => {
            values.delete(key);
        },
    };
}

function twoTabs(storage = sharedStorage()) {
    const first = createChatActivityStore({accountId: 'alice', storage});
    const second = createChatActivityStore({accountId: 'alice', storage});
    first.load();
    second.load();
    const reload = () => {
        const restored = createChatActivityStore({accountId: 'alice', storage});
        restored.load();
        return restored.getSnapshot();
    };
    return {first, second, storage, reload};
}

test('another tab starting a request cannot erase an unread response on reload', () => {
    const {first, second, reload} = twoTabs();
    complete(first, 'a', 'a1');
    second.startGeneration('b');
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: true});
});

test('another tab cannot bring back a viewed marker with its stale unread snapshot', () => {
    const {first, second, reload} = twoTabs();
    complete(first, 'a', 'a1');
    second.load();
    first.markResponseViewed('a', 'a1');
    complete(second, 'b', 'b1');
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: false});
});

test('overlapping completion writes in different tabs preserve both chat responses', () => {
    const {first, second, storage, reload} = twoTabs();
    const a = first.startGeneration('a');
    a.responseReceived('a1');
    const b = second.startGeneration('b');
    b.responseReceived('b1');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        a.finish();
        write(key, value);
    });
    b.finish();
    expect(reload().chats).toMatchObject({
        a: {responseId: 'a1', hasUnread: true},
        b: {responseId: 'b1', hasUnread: true},
    });
});

test('an acknowledgement overlapping a newer completion only marks its own response viewed', () => {
    const {first, second, storage, reload} = twoTabs();
    complete(first, 'a', 'a1');
    second.load();
    const next = first.startGeneration('a');
    next.responseReceived('a2');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        next.finish();
        write(key, value);
    });
    second.markResponseViewed('a', 'a1');
    expect(reload().chats.a).toMatchObject({responseId: 'a2', hasUnread: true});
});

test('a newer request in another tab invalidates a previous request in the same chat', () => {
    const {first, second, reload} = twoTabs();
    const previous = first.startGeneration('a');
    previous.responseReceived('old');
    const latest = second.startGeneration('a');
    latest.responseReceived('new');
    latest.finish();
    previous.finish();
    expect(reload().chats.a).toMatchObject({responseId: 'new', hasUnread: true});
    expect(first.getSnapshot().isGenerating).toBe(false);
});

test('a stale tab cannot resurrect a deleted chat through unrelated activity or another dispatch', () => {
    const {first, second, reload} = twoTabs();
    complete(first, 'a', 'a1');
    second.load();
    first.deleteChat('a');
    complete(second, 'b', 'b1');
    complete(second, 'a', 'late');
    expect(reload().chats.a).toBeUndefined();
    expect(reload().chats.b).toMatchObject({responseId: 'b1', hasUnread: true});
});

test('deletion racing with the final completion write prevents the response from returning', () => {
    const {first, second, storage, reload} = twoTabs();
    complete(first, 'b', 'b1');
    const pending = first.startGeneration('a');
    pending.responseReceived('a1');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        second.deleteChat('a');
        write(key, value);
    });
    pending.finish();
    expect(reload().chats.a).toBeUndefined();
    expect(reload().chats.b).toMatchObject({responseId: 'b1', hasUnread: true});
    expect(first.getSnapshot().isGenerating).toBe(false);
});

test('reads legacy markers alongside per-chat updates, acknowledgements and deletion tombstones', () => {
    const storage = sharedStorage();
    storage.setItem(
        'aikit:chat-activity:v1:alice',
        JSON.stringify([
            ['read', 'read1', false],
            ['unread', 'unread1', true],
            ['deleted', 'deleted1', true],
        ]),
    );
    const {first, second, reload} = twoTabs(storage);
    first.markResponseViewed('unread', 'unread1');
    second.deleteChat('deleted');
    complete(first, 'new', 'new1');
    complete(second, 'read', 'read1');
    expect(reload().chats).toMatchObject({
        read: {responseId: 'read1', hasUnread: false},
        unread: {responseId: 'unread1', hasUnread: false},
        new: {responseId: 'new1', hasUnread: true},
    });
    expect(reload().chats.deleted).toBeUndefined();
});

test('storage events refresh other-tab markers, preserve local generation and invalidate deleted handles', () => {
    const first = setup();
    const second = setup();
    const pending = second.startGeneration('b');
    const unsubscribe = second.subscribe(jest.fn());
    const notify = () =>
        window.dispatchEvent(
            new StorageEvent('storage', {
                key: localStorage.key(localStorage.length - 1),
                storageArea: localStorage,
            }),
        );
    try {
        complete(first, 'a', 'a1');
        notify();
        expect(second.getSnapshot().chats.a.hasUnread).toBe(true);
        expect(second.getSnapshot().chats.b.isGenerating).toBe(true);
        first.markResponseViewed('a', 'a1');
        notify();
        expect(second.getSnapshot().chats.a.hasUnread).toBe(false);
        first.deleteChat('b');
        notify();
        expect(second.getSnapshot().isGenerating).toBe(false);
        pending.responseReceived('late');
        pending.finish();
        expect(second.getSnapshot().chats.b).toBeUndefined();
    } finally {
        unsubscribe();
    }
});

test('a completion between another tab reading and dispatching survives an empty request', () => {
    const {first, second, storage, reload} = twoTabs();
    const earlier = first.startGeneration('a');
    earlier.responseReceived('a1');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        earlier.finish();
        write(key, value);
    });
    second.startGeneration('a').finish();
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: true});
    second.startGeneration('a').finish();
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: true});
});

test('compaction bounds request, completion and viewed keys and retains only deletion tombstones', () => {
    const {first, storage, reload} = twoTabs();
    storage.setItem('unrelated', 'keep');
    for (let index = 0; index < 100; index++) {
        complete(first, 'a', `a${index}`);
        first.markResponseViewed('a', `a${index}`);
    }
    expect(storage.length).toBe(4);
    expect(reload().chats.a).toMatchObject({responseId: 'a99', hasUnread: false});
    first.startGeneration('a').finish();
    expect(storage.length).toBe(4);
    expect(reload().chats.a.hasUnread).toBe(false);
    first.deleteChat('a');
    expect(storage.length).toBe(2);
    expect(storage.getItem('aikit:chat-activity:v2:alice:deleted:a')).toBe('1');
    expect(storage.getItem('unrelated')).toBe('keep');
});

test('repeated responses fit a fixed storage quota and remain durable after reload', () => {
    const storage = sharedStorage();
    const write = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
        const entries = new Map(
            Array.from({length: storage.length}, (_, index) => {
                const storedKey = storage.key(index) as string;
                return [storedKey, storage.getItem(storedKey) as string] as const;
            }),
        );
        entries.set(key, value);
        const bytes = Array.from(entries).reduce(
            (total, [k, v]) => total + 2 * (k.length + v.length),
            0,
        );
        if (bytes > 3000) {
            throw new DOMException('Storage is full', 'QuotaExceededError');
        }
        write(key, value);
    };
    const onPersistenceError = jest.fn();
    const store = createChatActivityStore({accountId: 'alice', storage, onPersistenceError});
    for (let index = 0; index < 100; index++) {
        complete(store, 'a', `a${index}`);
        store.markResponseViewed('a', `a${index}`);
    }
    complete(store, 'a', 'latest');
    const restored = createChatActivityStore({accountId: 'alice', storage});
    restored.load();
    expect(restored.getSnapshot().chats.a).toMatchObject({responseId: 'latest', hasUnread: true});
    expect(onPersistenceError).not.toHaveBeenCalled();
});

test('a failed replacement cannot collect the previously durable response', () => {
    const {first, storage, reload} = twoTabs();
    complete(first, 'a', 'durable');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementation((key, value) => {
        if (key.includes(':completion:') && value.includes('unsaved')) {
            throw new DOMException('Storage is full', 'QuotaExceededError');
        }
        write(key, value);
    });
    complete(first, 'a', 'unsaved');
    first.markResponseViewed('a', 'unsaved');
    expect(first.getSnapshot().chats.a).toMatchObject({responseId: 'unsaved', hasUnread: false});
    expect(reload().chats.a).toMatchObject({responseId: 'durable', hasUnread: true});
});

test('a collector cannot erase a newer completion and viewed marker written by another tab', () => {
    const {first, second, storage, reload} = twoTabs();
    complete(first, 'a', 'a1');
    first.markResponseViewed('a', 'a1');
    const remove = storage.removeItem.bind(storage);
    jest.spyOn(storage, 'removeItem').mockImplementationOnce((key) => {
        complete(second, 'a', 'a3');
        second.markResponseViewed('a', 'a3');
        remove(key);
    });
    complete(first, 'a', 'a2');
    expect(reload().chats.a).toMatchObject({responseId: 'a3', hasUnread: false});
});

test('a completion written after deletion is reclaimed without removing its tombstone', () => {
    const {first, second, storage, reload} = twoTabs();
    const request = first.startGeneration('a');
    request.responseReceived('late');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        second.deleteChat('a');
        write(key, value);
    });
    request.finish();
    expect(reload().chats.a).toBeUndefined();
    expect(storage.length).toBe(1);
    expect(storage.getItem('aikit:chat-activity:v2:alice:deleted:a')).toBe('1');
});

test('the previous per-chat format remains readable until a new durable completion replaces it', () => {
    const storage = sharedStorage();
    const prefix = 'aikit:chat-activity:v2:alice:';
    storage.setItem(`${prefix}chat:a`, JSON.stringify({id: 'old'}));
    storage.setItem(`${prefix}response:a:old`, JSON.stringify('a1'));
    storage.setItem(`${prefix}viewed:a:a1`, '1');
    const {first, reload} = twoTabs(storage);
    first.startGeneration('a').finish();
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: false});
    complete(first, 'a', 'a2');
    expect(reload().chats.a).toMatchObject({responseId: 'a2', hasUnread: true});
    expect(storage.getItem(`${prefix}chat:a`)).toBeNull();
    expect(storage.getItem(`${prefix}response:a:old`)).toBeNull();
    expect(storage.getItem(`${prefix}viewed:a:a1`)).toBeNull();
});

test('storage adapters without removeItem keep the original durable read/write contract', () => {
    const source = sharedStorage();
    const storage = {
        getItem: source.getItem,
        setItem: source.setItem,
        key: source.key,
        get length() {
            return source.length;
        },
    };
    const first = createChatActivityStore({accountId: 'alice', storage});
    complete(first, 'a', 'a1');
    first.markResponseViewed('a', 'a1');
    complete(first, 'a', 'a2');
    const restored = createChatActivityStore({accountId: 'alice', storage});
    restored.load();
    expect(restored.getSnapshot().chats.a).toMatchObject({responseId: 'a2', hasUnread: true});
});

test('compaction reclaims obsolete keys from the previous format without losing its current marker', () => {
    const storage = sharedStorage();
    const prefix = 'aikit:chat-activity:v2:alice:';
    for (let index = 0; index < 30; index++) {
        storage.setItem(`${prefix}response:a:old-${index}`, JSON.stringify(`a${index}`));
        storage.setItem(`${prefix}viewed:a:a${index}`, '1');
    }
    storage.setItem(`${prefix}chat:a`, JSON.stringify({id: 'old-29'}));
    const {first, reload} = twoTabs(storage);
    first.load();
    expect(storage.length).toBe(3);
    expect(reload().chats.a).toMatchObject({responseId: 'a29', hasUnread: false});
});

test('a transient quota failure is retried after compaction without reporting a durable failure', () => {
    const storage = sharedStorage();
    const onPersistenceError = jest.fn();
    const store = createChatActivityStore({accountId: 'alice', storage, onPersistenceError});
    jest.spyOn(storage, 'setItem').mockImplementationOnce(() => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
    });
    complete(store, 'a', 'a1');
    const restored = createChatActivityStore({accountId: 'alice', storage});
    restored.load();
    expect(restored.getSnapshot().chats.a).toMatchObject({responseId: 'a1', hasUnread: true});
    expect(onPersistenceError).not.toHaveBeenCalled();
});

test('a failed tombstone write does not collect the still-durable chat', () => {
    const {first, second, storage, reload} = twoTabs();
    complete(first, 'a', 'a1');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementation((key, value) => {
        if (key.includes(':deleted:')) {
            throw new Error('storage unavailable');
        }
        write(key, value);
    });
    second.deleteChat('a');
    expect(second.getSnapshot().chats.a).toBeUndefined();
    expect(reload().chats.a).toMatchObject({responseId: 'a1', hasUnread: true});
});

test('simultaneous dispatches use a deterministic owner even if writes arrive in reverse order', () => {
    const {first, second, storage, reload} = twoTabs();
    let nested!: ReturnType<typeof first.startGeneration>;
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementationOnce((key, value) => {
        nested = second.startGeneration('a');
        write(key, value);
    });
    const outer = first.startGeneration('a');
    first.load();
    second.load();
    const firstOwns = first.getSnapshot().isGenerating;
    expect(Number(firstOwns) + Number(second.getSnapshot().isGenerating)).toBe(1);
    outer.responseReceived('outer');
    nested.responseReceived('nested');
    outer.finish();
    nested.finish();
    expect(reload().chats.a).toMatchObject({
        responseId: firstOwns ? 'outer' : 'nested',
        hasUnread: true,
    });
});

test('a durable completion supersedes old ownership when its initial request write failed', () => {
    const {first, second, storage, reload} = twoTabs();
    const previous = first.startGeneration('a');
    const write = storage.setItem.bind(storage);
    jest.spyOn(storage, 'setItem').mockImplementation((key, value) => {
        if (key.includes(':request:') && JSON.parse(value).sequence === 2) {
            throw new Error('request write failed');
        }
        write(key, value);
    });
    complete(second, 'a', 'durable-new');
    first.load();
    expect(first.getSnapshot().isGenerating).toBe(false);
    previous.responseReceived('obsolete');
    previous.finish();
    expect(reload().chats.a).toMatchObject({responseId: 'durable-new', hasUnread: true});
    expect(storage.length).toBe(1);
});
