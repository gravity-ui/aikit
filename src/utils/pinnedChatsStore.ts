/** Persistence belongs to the application; only chat identifiers are stored. */
export interface PinnedChatsStorage {
    load: () => readonly string[] | Promise<readonly string[]>;
    save: (ids: readonly string[]) => void | Promise<void>;
}

export interface PinnedChatsSnapshot {
    readonly pinnedChatIds: readonly string[];
    readonly isLoading: boolean;
    readonly error: unknown;
}

export interface PinnedChatsStore {
    getSnapshot: () => PinnedChatsSnapshot;
    subscribe: (listener: () => void) => () => void;
    load: () => Promise<void>;
    setPinned: (id: string, pinned: boolean) => Promise<void>;
}

function validateIds(value: unknown): readonly string[] {
    if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) {
        throw new Error('Pinned chats must be an array of string identifiers');
    }
    return Object.freeze([...new Set<string>(value)]);
}

/**
 * Creates a store with application-provided persistence. Operations are serialized and only
 * successful saves update the snapshot. Errors are exposed in the snapshot; operations resolve.
 * Create a separate store for each account and keep its identity stable across renders.
 */
export function createPinnedChatsStore(storage: PinnedChatsStorage): PinnedChatsStore {
    let snapshot: PinnedChatsSnapshot = {
        pinnedChatIds: Object.freeze([]),
        isLoading: false,
        error: undefined,
    };
    let loaded = false;
    let pending = 0;
    let queue = Promise.resolve();
    const listeners = new Set<() => void>();
    const update = (patch: Partial<PinnedChatsSnapshot>) => {
        snapshot = {...snapshot, ...patch};
        listeners.forEach((listener) => listener());
    };
    const ensureLoaded = async () => {
        if (!loaded) {
            const pinnedChatIds = validateIds(await storage.load());
            loaded = true;
            update({pinnedChatIds});
        }
    };
    const enqueue = (operation: () => Promise<void>) => {
        pending += 1;
        update({isLoading: true});
        queue = queue.then(async () => {
            try {
                await operation();
                update({error: undefined});
            } catch (error) {
                update({error});
            } finally {
                pending -= 1;
                update({isLoading: pending > 0});
            }
        });
        return queue;
    };
    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        load: () => enqueue(ensureLoaded),
        setPinned: (id, pinned) =>
            enqueue(async () => {
                await ensureLoaded();
                const current = snapshot.pinnedChatIds;
                if (current.includes(id) === pinned) return;
                const next = pinned ? [...current, id] : current.filter((item) => item !== id);
                await storage.save([...next]);
                update({pinnedChatIds: Object.freeze(next)});
            }),
    };
}

/** Browser storage is accessed lazily, so creation is safe during server rendering. */
export function createLocalStoragePinnedChatsStore(key: string): PinnedChatsStore {
    return createPinnedChatsStore({
        load: () => {
            const value = window.localStorage.getItem(key);
            return value === null ? [] : validateIds(JSON.parse(value));
        },
        save: (ids) => window.localStorage.setItem(key, JSON.stringify(ids)),
    });
}
