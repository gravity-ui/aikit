import {createLocalStoragePinnedChatsStore, createPinnedChatsStore} from '../pinnedChatsStore';

describe('pinned chat persistence', () => {
    test('loads existing pins before serializing concurrent mutations', async () => {
        const saved: string[][] = [];
        const store = createPinnedChatsStore({
            load: async () => ['existing', 'existing'],
            save: async (ids) => {
                saved.push([...ids]);
            },
        });
        await Promise.all([
            store.setPinned('first', true),
            store.setPinned('second', true),
            store.setPinned('first', false),
        ]);
        expect(saved).toEqual([
            ['existing', 'first'],
            ['existing', 'first', 'second'],
            ['existing', 'second'],
        ]);
        expect(store.getSnapshot()).toEqual({
            pinnedChatIds: ['existing', 'second'],
            isLoading: false,
            error: undefined,
        });
    });

    test('preserves confirmed state after failed save and allows retry', async () => {
        const error = new Error('offline');
        const save = jest.fn().mockRejectedValueOnce(error).mockResolvedValue(undefined);
        const store = createPinnedChatsStore({load: () => ['old'], save});
        await store.setPinned('new', true);
        expect(store.getSnapshot()).toEqual({pinnedChatIds: ['old'], isLoading: false, error});
        await store.setPinned('new', true);
        expect(store.getSnapshot().pinnedChatIds).toEqual(['old', 'new']);
        expect(store.getSnapshot().error).toBeUndefined();
    });

    test('never saves after a failed initial load and retries loading', async () => {
        const load = jest
            .fn()
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValue(['existing']);
        const save = jest.fn();
        const store = createPinnedChatsStore({load, save});
        await store.setPinned('new', true);
        expect(save).not.toHaveBeenCalled();
        await store.setPinned('new', true);
        expect(save).toHaveBeenCalledWith(['existing', 'new']);
    });

    test('persists local pins across store instances and isolates account keys', async () => {
        localStorage.clear();
        await createLocalStoragePinnedChatsStore('a').setPinned('chat', true);
        const restored = createLocalStoragePinnedChatsStore('a');
        const other = createLocalStoragePinnedChatsStore('b');
        await Promise.all([restored.load(), other.load()]);
        expect(restored.getSnapshot().pinnedChatIds).toEqual(['chat']);
        expect(other.getSnapshot().pinnedChatIds).toEqual([]);
    });

    test.each(['invalid json', '{}', '[12]'])(
        'does not overwrite corrupt local data: %s',
        async (value) => {
            localStorage.setItem('corrupt', value);
            const store = createLocalStoragePinnedChatsStore('corrupt');
            await store.setPinned('chat', true);
            expect(store.getSnapshot().error).toBeDefined();
            expect(store.getSnapshot().isLoading).toBe(false);
            expect(localStorage.getItem('corrupt')).toBe(value);
        },
    );
});
