import {createChatActivityStore} from './chatActivityStore';

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
