import type {ChatActivityStoreOptions} from './chatActivityStore';

interface StoredResponse {
    responseId: string;
    hasUnread: boolean;
}

interface StoredRequest {
    id: string;
    previous?: StoredResponse;
}

/**
 * Browser persistence protocol used by the local store. Each writer owns its completion key;
 * viewed and deletion markers only move forward. This module does not own React subscriptions
 * or active-generation state. See README.md for the key layout and cross-tab ordering rules.
 */
export function createChatActivityPersistence({
    accountId,
    storage,
    onPersistenceError,
}: ChatActivityStoreOptions) {
    const legacyKey = `aikit:chat-activity:v1:${encodeURIComponent(accountId)}`;
    const prefix = `aikit:chat-activity:v2:${encodeURIComponent(accountId)}:`;
    const headPrefix = `${prefix}chat:`;
    const deletedPrefix = `${prefix}deleted:`;
    const memory = new Map<string, string>();
    const unsaved = new Set<string>();
    const getStorage = () => {
        if (storage !== undefined) return storage;
        return typeof window === 'undefined' ? null : window.localStorage;
    };
    const read = (key: string) => {
        if (unsaved.has(key)) return memory.get(key) ?? null;
        try {
            const source = getStorage();
            if (!source) return memory.get(key) ?? null;
            const value = source.getItem(key);
            if (value === null) memory.delete(key);
            else memory.set(key, value);
            return value;
        } catch (error) {
            onPersistenceError?.(error);
            return memory.get(key) ?? null;
        }
    };
    const write = (key: string, value: string) => {
        memory.set(key, value);
        unsaved.add(key);
        try {
            const source = getStorage();
            if (source) {
                source.setItem(key, value);
                unsaved.delete(key);
            }
        } catch (error) {
            onPersistenceError?.(error);
        }
    };
    const keys = () => {
        const result = new Set(memory.keys());
        try {
            const source = getStorage();
            if (source) {
                for (let index = 0; index < source.length; index++) {
                    const key = source.key(index);
                    if (key !== null) result.add(key);
                }
            }
        } catch (error) {
            onPersistenceError?.(error);
        }
        return result;
    };
    const parse = (key: string): unknown => {
        const raw = read(key);
        if (raw === null) return undefined;
        try {
            return JSON.parse(raw);
        } catch (error) {
            onPersistenceError?.(error);
            return undefined;
        }
    };
    const isResponse = (value: unknown): value is StoredResponse => {
        if (!value || typeof value !== 'object') return false;
        const row = value as Record<string, unknown>;
        return typeof row.responseId === 'string' && typeof row.hasUnread === 'boolean';
    };
    const readRequest = (chatId: string): StoredRequest | undefined => {
        const value = parse(`${headPrefix}${encodeURIComponent(chatId)}`);
        if (!value || typeof value !== 'object') return undefined;
        const row = value as Record<string, unknown>;
        if (
            typeof row.id !== 'string' ||
            (row.previous !== undefined && !isResponse(row.previous))
        ) {
            onPersistenceError?.(new Error('Invalid chat activity request'));
            return undefined;
        }
        return {id: row.id, previous: row.previous};
    };
    const responseKey = (chatId: string, requestId: string) =>
        `${prefix}response:${encodeURIComponent(chatId)}:${requestId}`;
    const viewedKey = (chatId: string, responseId: string) =>
        `${prefix}viewed:${encodeURIComponent(chatId)}:${encodeURIComponent(responseId)}`;
    const isDeleted = (chatId: string) =>
        read(`${deletedPrefix}${encodeURIComponent(chatId)}`) === '1';
    const readState = () => {
        const chats = new Map<string, StoredResponse>();
        const requestIds = new Map<string, string>();
        // Legacy snapshots are read-only baselines; per-chat keys and tombstones take precedence.
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
            } else onPersistenceError?.(new Error('Invalid chat activity storage'));
        }
        const chatIds = new Set(chats.keys());
        for (const key of keys()) {
            if (key.startsWith(headPrefix)) {
                try {
                    chatIds.add(decodeURIComponent(key.slice(headPrefix.length)));
                } catch (error) {
                    onPersistenceError?.(error);
                }
            }
        }
        for (const chatId of chatIds) {
            if (isDeleted(chatId)) {
                chats.delete(chatId);
                continue;
            }
            const request = readRequest(chatId);
            if (request) {
                requestIds.set(chatId, request.id);
                const responseId = parse(responseKey(chatId, request.id));
                const response =
                    typeof responseId === 'string'
                        ? {
                              responseId,
                              hasUnread:
                                  request.previous?.responseId === responseId
                                      ? request.previous.hasUnread
                                      : true,
                          }
                        : request.previous;
                if (response) chats.set(chatId, response);
                else chats.delete(chatId);
            }
            const response = chats.get(chatId);
            if (response && read(viewedKey(chatId, response.responseId)) === '1') {
                response.hasUnread = false;
            }
        }
        return {chats: Object.fromEntries(chats), requestIds};
    };
    return {
        readState,
        isDeleted,
        start: (chatId: string, id: string, previous?: StoredResponse) => {
            write(`${headPrefix}${encodeURIComponent(chatId)}`, JSON.stringify({id, previous}));
        },
        finish: (chatId: string, id: string, responseId: string) => {
            write(responseKey(chatId, id), JSON.stringify(responseId));
        },
        markViewed: (chatId: string, responseId: string) =>
            write(viewedKey(chatId, responseId), '1'),
        deleteChat: (chatId: string) => write(`${deletedPrefix}${encodeURIComponent(chatId)}`, '1'),
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
