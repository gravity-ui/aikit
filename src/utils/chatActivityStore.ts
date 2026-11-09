/** Activity is independent of the currently selected chat and survives panel unmounts. */
export interface ChatActivity {
    readonly isGenerating: boolean;
    readonly hasUnread: boolean;
    /** Identifier of the latest completed response containing user-visible assistant text. */
    readonly responseId?: string;
}

export interface ChatActivityError {
    readonly operation: 'load' | 'markResponseViewed';
    readonly cause: unknown;
    readonly chatId?: string;
    readonly responseId?: string;
}

export interface ChatActivitySnapshot {
    readonly chats: Readonly<Record<string, ChatActivity>>;
    readonly isGenerating: boolean;
    readonly hasUnread: boolean;
    /** Async adapters expose loading and command failures without changing unread state. */
    readonly isLoading?: boolean;
    readonly error?: ChatActivityError;
}

export interface ChatGeneration {
    /** Report assistant text only, excluding tool output, reasoning and error messages. */
    responseReceived: (responseId: string) => void;
    /** Call on success, cancellation or failure, including failures before the first text. */
    finish: () => void;
}

export interface ChatActivityStore {
    getSnapshot: () => ChatActivitySnapshot;
    subscribe: (listener: () => void) => () => void;
    /** Optional initial loading; components consume rejected promises, stores report errors. */
    load?: () => void | Promise<void>;
    markResponseViewed: (chatId: string, responseId: string) => void | Promise<void>;
    /** Evict local state after the host has successfully deleted the chat. */
    deleteChat: (chatId: string) => void;
}

/** Local request lifecycle is independent of the contract consumed by components. */
export interface LocalChatActivityStore extends ChatActivityStore {
    load: () => void;
    /** Starting a new request invalidates all handles for the previous request in this chat. */
    startGeneration: (chatId: string) => ChatGeneration;
}

export interface ChatActivityStoreOptions {
    /** Stable authenticated account identifier. Create a separate store on account change. */
    accountId: string;
    /** Defaults to localStorage; use null to disable persistence. */
    storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
    onPersistenceError?: (error: unknown) => void;
}

export const EMPTY_CHAT_ACTIVITY: ChatActivitySnapshot = Object.freeze({
    chats: Object.freeze({}),
    isGenerating: false,
    hasUnread: false,
});

/** Normalize immutable rows and derive the history summary for local or external stores. */
export function createChatActivitySnapshot(
    chats: ChatActivitySnapshot['chats'],
): ChatActivitySnapshot {
    const rows = Object.fromEntries(
        Object.entries(chats).map(([id, chat]) => [id, Object.freeze({...chat})]),
    );
    const values = Object.values(rows);
    return Object.freeze({
        chats: Object.freeze(rows),
        isGenerating: values.some((chat) => chat.isGenerating),
        hasUnread: values.some((chat) => chat.hasUnread),
    });
}

/**
 * Create once per account, outside the panel's lifecycle. Only completed response markers are
 * persisted. Restore live requests from the backend with startGeneration; history loading must
 * never replay completion events. Response IDs must be unique across requests and stable on reload.
 */
export function createChatActivityStore({
    accountId,
    storage,
    onPersistenceError,
}: ChatActivityStoreOptions): LocalChatActivityStore {
    if (!accountId) throw new Error('Chat activity requires an account identifier');
    const key = `aikit:chat-activity:v1:${encodeURIComponent(accountId)}`;
    let snapshot = EMPTY_CHAT_ACTIVITY;
    let loaded = false;
    const listeners = new Set<() => void>();
    const generations = new Map<string, object>();
    const getStorage = () => {
        if (storage !== undefined) return storage;
        return typeof window === 'undefined' ? null : window.localStorage;
    };
    const publish = (chats: Record<string, ChatActivity>, persist = true) => {
        snapshot = createChatActivitySnapshot(chats);
        if (persist) {
            try {
                getStorage()?.setItem(
                    key,
                    JSON.stringify(
                        Object.entries(chats)
                            .filter(([, chat]) => chat.responseId !== undefined)
                            .map(([id, chat]) => [id, chat.responseId, chat.hasUnread]),
                    ),
                );
            } catch (error) {
                onPersistenceError?.(error);
            }
        }
        listeners.forEach((listener) => listener());
    };
    const load = () => {
        if (loaded) return;
        loaded = true;
        try {
            const raw = getStorage()?.getItem(key);
            if (!raw) return;
            const entries: unknown = JSON.parse(raw);
            if (
                !Array.isArray(entries) ||
                entries.some(
                    (entry) =>
                        !Array.isArray(entry) ||
                        entry.length !== 3 ||
                        typeof entry[0] !== 'string' ||
                        typeof entry[1] !== 'string' ||
                        typeof entry[2] !== 'boolean',
                )
            ) {
                throw new Error('Invalid chat activity storage');
            }
            publish(
                Object.fromEntries(
                    entries.map(([id, responseId, hasUnread]) => [
                        id,
                        Object.freeze({isGenerating: false, responseId, hasUnread}),
                    ]),
                ),
                false,
            );
        } catch (error) {
            onPersistenceError?.(error);
        }
    };
    const update = (id: string, activity: ChatActivity) =>
        publish({...snapshot.chats, [id]: Object.freeze(activity)});
    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        load,
        startGeneration: (chatId) => {
            load();
            const token = {};
            generations.set(chatId, token);
            let responseId: string | undefined;
            update(chatId, {
                ...snapshot.chats[chatId],
                isGenerating: true,
                hasUnread: snapshot.chats[chatId]?.hasUnread ?? false,
            });
            return {
                responseReceived: (id) => {
                    if (generations.get(chatId) === token && id) responseId = id;
                },
                finish: () => {
                    if (generations.get(chatId) !== token) return;
                    generations.delete(chatId);
                    const previous = snapshot.chats[chatId];
                    update(chatId, {
                        ...previous,
                        isGenerating: false,
                        ...(responseId === undefined
                            ? {}
                            : {
                                  responseId,
                                  hasUnread:
                                      previous.responseId === responseId
                                          ? previous.hasUnread
                                          : true,
                              }),
                    });
                },
            };
        },
        markResponseViewed: (chatId, responseId) => {
            load();
            const current = snapshot.chats[chatId];
            if (current?.hasUnread && current.responseId === responseId) {
                update(chatId, {...current, hasUnread: false});
            }
        },
        deleteChat: (chatId) => {
            load();
            generations.delete(chatId);
            const chats = {...snapshot.chats};
            delete chats[chatId];
            publish(chats);
        },
    };
}
