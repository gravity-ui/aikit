import type {ChatActivityStoreOptions} from './chatActivityStore';

interface StoredResponse {
    responseId: string;
    hasUnread: boolean;
}

interface StoredOrder {
    sequence: number;
    id: string;
}

interface StoredCompletion extends StoredOrder, StoredResponse {}

interface RecordEntry {
    key: string;
    chatId: string;
    kind: string;
    suffix: string;
    order?: StoredOrder;
    completion?: StoredCompletion;
}

const compare = (first: StoredOrder, second: StoredOrder) =>
    first.sequence - second.sequence || (first.id < second.id ? -1 : Number(first.id > second.id));

/**
 * Requests and completions are independent immutable records. A logical sequence and request ID
 * order concurrent writers without copying a response that another tab may still be completing.
 * Compaction only removes records dominated by an already persisted replacement. A completion
 * also records its request ownership, including when persisting the initial request failed.
 */
export function createChatActivityPersistence({
    accountId,
    storage,
    onPersistenceError,
}: ChatActivityStoreOptions) {
    const legacyKey = `aikit:chat-activity:v1:${encodeURIComponent(accountId)}`;
    const prefix = `aikit:chat-activity:v2:${encodeURIComponent(accountId)}:`;
    const memory = new Map<string, string>();
    const unsaved = new Set<string>();
    const getStorage = () => {
        if (storage !== undefined) {
            return storage;
        }
        return typeof window === 'undefined' ? null : window.localStorage;
    };
    const read = (key: string) => {
        if (unsaved.has(key)) {
            return memory.get(key) ?? null;
        }
        try {
            const source = getStorage();
            if (!source) {
                return memory.get(key) ?? null;
            }
            const value = source.getItem(key);
            if (value === null) {
                memory.delete(key);
            } else {
                memory.set(key, value);
            }
            return value;
        } catch (error) {
            onPersistenceError?.(error);
            return memory.get(key) ?? null;
        }
    };
    const keys = () => {
        const result = new Set(memory.keys());
        try {
            const source = getStorage();
            if (source) {
                for (let index = 0; index < source.length; index++) {
                    const key = source.key(index);
                    if (key !== null) {
                        result.add(key);
                    }
                }
            }
        } catch (error) {
            onPersistenceError?.(error);
        }
        return result;
    };
    const remove = (key: string) => {
        try {
            const source = getStorage();
            if (source && !source.removeItem) {
                return;
            }
            source?.removeItem?.(key);
            memory.delete(key);
            unsaved.delete(key);
        } catch (error) {
            onPersistenceError?.(error);
        }
    };
    const parse = (key: string): unknown => {
        const raw = read(key);
        if (raw === null) {
            return undefined;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            onPersistenceError?.(error);
            return undefined;
        }
    };
    const isResponse = (value: unknown): value is StoredResponse => {
        if (!value || typeof value !== 'object') {
            return false;
        }
        const row = value as Record<string, unknown>;
        return typeof row.responseId === 'string' && typeof row.hasUnread === 'boolean';
    };
    const isOrder = (value: unknown): value is StoredOrder => {
        if (!value || typeof value !== 'object') {
            return false;
        }
        const row = value as Record<string, unknown>;
        return (
            Number.isSafeInteger(row.sequence) &&
            Number(row.sequence) > 0 &&
            typeof row.id === 'string'
        );
    };
    const keyFor = (kind: string, chatId: string, suffix?: string) =>
        `${prefix}${kind}:${encodeURIComponent(chatId)}${suffix === undefined ? '' : `:${encodeURIComponent(suffix)}`}`;
    const isDeleted = (chatId: string) => read(keyFor('deleted', chatId)) === '1';
    const entries = () => {
        const result: RecordEntry[] = [];
        for (const key of keys()) {
            if (!key.startsWith(prefix)) {
                continue;
            }
            try {
                const [kind, encodedChat, encodedSuffix = ''] = key.slice(prefix.length).split(':');
                const value = parse(key);
                if (value === undefined) {
                    continue;
                }
                const order = isOrder(value) ? value : undefined;
                result.push({
                    key,
                    kind,
                    chatId: decodeURIComponent(encodedChat),
                    suffix: decodeURIComponent(encodedSuffix),
                    order,
                    completion:
                        kind === 'completion' && order && isResponse(value)
                            ? {...order, ...value}
                            : undefined,
                });
            } catch (error) {
                onPersistenceError?.(error);
            }
        }
        return result;
    };
    const latest = (records: RecordEntry[], durable = false) => {
        const requests = new Map<string, RecordEntry>();
        const completions = new Map<string, RecordEntry>();
        const update = (target: Map<string, RecordEntry>, entry: RecordEntry) => {
            const previous = target.get(entry.chatId);
            if (entry.order && (!previous?.order || compare(entry.order, previous.order) > 0)) {
                target.set(entry.chatId, entry);
            }
        };
        for (const entry of records) {
            if (!entry.order || (durable && unsaved.has(entry.key))) {
                continue;
            }
            if (entry.kind === 'request' || entry.completion) {
                update(requests, entry);
            }
            if (entry.completion) {
                update(completions, entry);
            }
        }
        return {requests, completions};
    };
    const readBaseline = () => {
        const chats = new Map<string, StoredResponse>();
        const legacy = parse(legacyKey);
        if (legacy !== undefined) {
            if (
                Array.isArray(legacy) &&
                legacy.every(
                    (entry) =>
                        Array.isArray(entry) &&
                        entry.length === 3 &&
                        typeof entry[0] === 'string' &&
                        typeof entry[1] === 'string' &&
                        typeof entry[2] === 'boolean',
                )
            ) {
                for (const [id, responseId, hasUnread] of legacy) {
                    chats.set(id, {responseId, hasUnread});
                }
            } else {
                onPersistenceError?.(new Error('Invalid chat activity storage'));
            }
        }
        // Read the previous per-chat format until an ordered completion supersedes it.
        for (const key of keys()) {
            if (!key.startsWith(`${prefix}chat:`)) {
                continue;
            }
            const value = parse(key);
            if (!value || typeof value !== 'object') {
                continue;
            }
            const row = value as Record<string, unknown>;
            if (
                typeof row.id !== 'string' ||
                (row.previous !== undefined && !isResponse(row.previous))
            ) {
                onPersistenceError?.(new Error('Invalid chat activity request'));
                continue;
            }
            try {
                const chatId = decodeURIComponent(key.slice(`${prefix}chat:`.length));
                const responseId = parse(keyFor('response', chatId, row.id));
                const response =
                    typeof responseId === 'string'
                        ? {
                              responseId,
                              hasUnread:
                                  isResponse(row.previous) && row.previous.responseId === responseId
                                      ? row.previous.hasUnread
                                      : true,
                          }
                        : row.previous;
                if (isResponse(response)) {
                    chats.set(chatId, {...response});
                } else {
                    chats.delete(chatId);
                }
            } catch (error) {
                onPersistenceError?.(error);
            }
        }
        return chats;
    };
    const compactBaselineEntry = (entry: RecordEntry, response?: StoredResponse) => {
        if (entry.kind === 'response') {
            const head = parse(keyFor('chat', entry.chatId));
            if (!head || typeof head !== 'object' || !('id' in head) || head.id !== entry.suffix) {
                remove(entry.key);
            }
        } else if (
            entry.kind === 'viewed' &&
            !entry.order &&
            entry.suffix !== response?.responseId
        ) {
            remove(entry.key);
        }
    };
    const compact = () => {
        const records = entries();
        const {requests, completions} = latest(records, true);
        const baseline = readBaseline();
        for (const entry of records) {
            const deletionKey = keyFor('deleted', entry.chatId);
            if (entry.kind !== 'deleted' && !unsaved.has(deletionKey) && isDeleted(entry.chatId)) {
                remove(entry.key);
                continue;
            }
            const replacement =
                entry.kind === 'request'
                    ? requests.get(entry.chatId)
                    : completions.get(entry.chatId);
            if (!replacement?.order) {
                compactBaselineEntry(entry, baseline.get(entry.chatId));
                continue;
            }
            // A completion also durably replaces older request ownership. Replacements can only
            // be collected after an even greater durable record exists.
            if (
                (entry.kind === 'request' || entry.kind === 'completion') &&
                entry.order &&
                compare(entry.order, replacement.order) < 0
            ) {
                remove(entry.key);
            } else if (
                entry.kind === 'viewed' &&
                entry.suffix !== replacement.completion?.responseId &&
                (!entry.order || compare(entry.order, replacement.order) < 0)
            ) {
                remove(entry.key);
            } else if (entry.kind === 'chat' || entry.kind === 'response') {
                remove(entry.key);
            }
        }
    };
    const write = (key: string, value: string) => {
        memory.set(key, value);
        unsaved.add(key);
        try {
            const source = getStorage();
            if (source) {
                try {
                    source.setItem(key, value);
                } catch (error) {
                    if (!(error instanceof Error) || error.name !== 'QuotaExceededError') {
                        throw error;
                    }
                    compact();
                    source.setItem(key, value);
                }
            }
            unsaved.delete(key);
        } catch (error) {
            onPersistenceError?.(error);
        }
    };
    const readState = () => {
        compact();
        const chats = readBaseline();
        const {requests, completions} = latest(entries());
        const requestIds = new Map<string, string>();
        for (const [chatId, entry] of completions) {
            if (entry.completion) {
                chats.set(chatId, {
                    responseId: entry.completion.responseId,
                    hasUnread: entry.completion.hasUnread,
                });
            }
        }
        for (const [chatId, entry] of requests) {
            if (entry.order && !isDeleted(chatId)) {
                requestIds.set(chatId, entry.order.id);
            }
        }
        for (const [chatId, response] of chats) {
            if (isDeleted(chatId)) {
                chats.delete(chatId);
            } else {
                const viewed = parse(keyFor('viewed', chatId, response.responseId));
                if (viewed === 1 || isOrder(viewed)) {
                    response.hasUnread = false;
                }
            }
        }
        return {chats: Object.fromEntries(chats), requestIds};
    };
    return {
        readState,
        isDeleted,
        start: (chatId: string, id: string) => {
            const {requests, completions} = latest(entries());
            const sequence =
                Math.max(
                    requests.get(chatId)?.order?.sequence ?? 0,
                    completions.get(chatId)?.order?.sequence ?? 0,
                ) + 1;
            if (!Number.isSafeInteger(sequence)) {
                throw new Error('Chat activity sequence exceeded the safe integer range');
            }
            write(keyFor('request', chatId, id), JSON.stringify({sequence, id}));
            compact();
        },
        finish: (chatId: string, id: string, responseId: string) => {
            const order = parse(keyFor('request', chatId, id));
            if (!isOrder(order) || isDeleted(chatId)) {
                return;
            }
            const previous = readState().chats[chatId];
            write(
                keyFor('completion', chatId, id),
                JSON.stringify({
                    ...order,
                    responseId,
                    hasUnread: previous?.responseId === responseId ? previous.hasUnread : true,
                }),
            );
            compact();
        },
        markViewed: (chatId: string, responseId: string) => {
            const current = latest(entries()).completions.get(chatId);
            if (current?.completion && current.completion.responseId !== responseId) {
                return;
            }
            write(keyFor('viewed', chatId, responseId), JSON.stringify(current?.order ?? 1));
            compact();
        },
        deleteChat: (chatId: string) => {
            write(keyFor('deleted', chatId), '1');
            compact();
        },
        isStorageEvent: (event: StorageEvent) => {
            if (event.key !== null && event.key !== legacyKey && !event.key.startsWith(prefix)) {
                return false;
            }
            try {
                return !event.storageArea || event.storageArea === getStorage();
            } catch (error) {
                onPersistenceError?.(error);
                return false;
            }
        },
    };
}
