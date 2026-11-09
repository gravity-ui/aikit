/** Shared activity contracts, immutable snapshots, and the local request lifecycle. */
import {createChatActivityPersistence} from './chatActivityPersistence';

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
    /** Storage must enumerate keys via key/length. Defaults to localStorage; null uses memory. */
    storage?: Pick<Storage, 'getItem' | 'setItem' | 'key' | 'length'> | null;
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
 * Create once per account, outside the panel's lifecycle. Persist response/read markers and request
 * ownership, but keep generation activity in memory. Restore live requests from the backend with
 * startGeneration; history loading must
 * never replay completion events. Response IDs must be unique across requests and stable on reload.
 */
export function createChatActivityStore(options: ChatActivityStoreOptions): LocalChatActivityStore {
    if (!options.accountId) throw new Error('Chat activity requires an account identifier');
    const persistence = createChatActivityPersistence(options);
    let snapshot = EMPTY_CHAT_ACTIVITY;
    const listeners = new Set<() => void>();
    const generations = new Map<string, string>();
    // Reconcile shared markers with this instance's active requests before publishing UI state.
    const load = () => {
        const {chats, requestIds} = persistence.readState();
        const activities = new Map<string, ChatActivity>(
            Object.entries(chats).map(([id, response]) => [id, {...response, isGenerating: false}]),
        );
        for (const [chatId, id] of generations) {
            if (requestIds.get(chatId) === id) {
                activities.set(chatId, {
                    ...activities.get(chatId),
                    isGenerating: true,
                    hasUnread: activities.get(chatId)?.hasUnread ?? false,
                });
            } else {
                generations.delete(chatId);
            }
        }
        snapshot = createChatActivitySnapshot(Object.fromEntries(activities));
        listeners.forEach((listener) => listener());
    };
    const handleStorage = (event: StorageEvent) => {
        if (persistence.isStorageEvent(event)) load();
    };
    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            if (!listeners.size && typeof window !== 'undefined') {
                window.addEventListener('storage', handleStorage);
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
                if (!listeners.size && typeof window !== 'undefined') {
                    window.removeEventListener('storage', handleStorage);
                }
            };
        },
        load,
        startGeneration: (chatId) => {
            load();
            const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
                value.toString(36),
            ).join('-');
            let responseId: string | undefined;
            if (!persistence.isDeleted(chatId)) {
                const current = snapshot.chats[chatId];
                persistence.start(
                    chatId,
                    id,
                    current?.responseId === undefined
                        ? undefined
                        : {responseId: current.responseId, hasUnread: current.hasUnread},
                );
                generations.set(chatId, id);
                load();
            }
            return {
                responseReceived: (response) => {
                    if (generations.get(chatId) === id && response) responseId = response;
                },
                finish: () => {
                    load();
                    if (generations.get(chatId) !== id) return;
                    generations.delete(chatId);
                    if (responseId !== undefined) persistence.finish(chatId, id, responseId);
                    load();
                },
            };
        },
        markResponseViewed: (chatId, responseId) => {
            load();
            const current = snapshot.chats[chatId];
            if (current?.hasUnread && current.responseId === responseId) {
                persistence.markViewed(chatId, responseId);
                load();
            }
        },
        deleteChat: (chatId) => {
            persistence.deleteChat(chatId);
            generations.delete(chatId);
            load();
        },
    };
}
