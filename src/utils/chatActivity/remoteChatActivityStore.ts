import {
    type ChatActivityError,
    type ChatActivitySnapshot,
    type ChatActivityStore,
    EMPTY_CHAT_ACTIVITY,
    createChatActivitySnapshot,
} from './chatActivityStore';

/** Full account-scoped server state. Revisions must increase for every state change. */
export interface RemoteChatActivityState {
    readonly accountId: string;
    readonly revision: number;
    readonly chats: ChatActivitySnapshot['chats'];
}

export interface RemoteChatActivityStoreOptions {
    accountId: string;
    initialState?: RemoteChatActivityState;
    /** Omit when the application feeds its query cache or pushed updates through applySnapshot. */
    load?: () => Promise<RemoteChatActivityState>;
    /**
     * Acknowledge this exact response. Return authoritative state, or feed it separately through
     * applySnapshot after query invalidation/push. A resolved command alone never clears a dot.
     */
    markResponseViewed: (
        chatId: string,
        responseId: string,
    ) => void | RemoteChatActivityState | Promise<void | RemoteChatActivityState>;
    onError?: (error: ChatActivityError) => void;
}

export interface RemoteChatActivitySnapshot extends ChatActivitySnapshot {
    readonly revision?: number;
    readonly isLoading: boolean;
}

export interface RemoteChatActivityStore extends ChatActivityStore {
    getSnapshot: () => RemoteChatActivitySnapshot;
    markResponseViewed: (chatId: string, responseId: string) => Promise<void>;
    /** Idempotent initial load; concurrent calls share the same request. */
    load: () => Promise<void>;
    /** Explicit retry/refresh. Rejections are also exposed through error and onError. */
    refresh: () => Promise<void>;
    /** Accept a full authoritative snapshot, ignoring equal or older revisions. */
    applySnapshot: (state: RemoteChatActivityState) => void;
}

/**
 * Adapts application-provided backend data without running the local generation engine or using
 * localStorage. Keep one instance per account and replace it when the account changes.
 */
export function createRemoteChatActivityStore(
    options: RemoteChatActivityStoreOptions,
): RemoteChatActivityStore {
    if (!options.accountId) {
        throw new Error('Chat activity requires an account identifier');
    }
    let activity = EMPTY_CHAT_ACTIVITY;
    let revision: number | undefined;
    let isLoading = false;
    let error: ChatActivityError | undefined;
    let snapshot: RemoteChatActivitySnapshot = Object.freeze({...activity, isLoading});
    let loaded = false;
    let loadingPromise: Promise<void> | undefined;
    const acknowledgements = new Map<string, Promise<void>>();
    const confirmedAcknowledgements = new Set<string>();
    // Chat IDs must not be reused within an account. Tombstones also filter late command results.
    const deletedChats = new Set<string>();
    const listeners = new Set<() => void>();
    const publish = () => {
        snapshot = Object.freeze({...activity, revision, isLoading, error});
        listeners.forEach((listener) => listener());
    };
    const reportError = (failure: ChatActivityError) => {
        error = failure;
        publish();
        options.onError?.(failure);
    };
    const applySnapshot = (state: RemoteChatActivityState) => {
        if (state.accountId !== options.accountId) {
            throw new Error('Chat activity snapshot belongs to another account');
        }
        if (!Number.isSafeInteger(state.revision) || state.revision < 0) {
            throw new Error('Chat activity revision must be a nonnegative safe integer');
        }
        if (revision !== undefined && state.revision <= revision) {
            return;
        }
        if (Object.values(state.chats).some((chat) => chat.hasUnread && !chat.responseId)) {
            throw new Error('Unread chat activity requires a response identifier');
        }
        activity = createChatActivitySnapshot(
            Object.fromEntries(Object.entries(state.chats).filter(([id]) => !deletedChats.has(id))),
        );
        for (const [chatId, chat] of Object.entries(activity.chats)) {
            if (chat.responseId && !chat.hasUnread) {
                const key = JSON.stringify([chatId, chat.responseId]);
                if (acknowledgements.has(key)) {
                    confirmedAcknowledgements.add(key);
                }
                if (
                    error?.operation === 'markResponseViewed' &&
                    error.chatId === chatId &&
                    error.responseId === chat.responseId
                ) {
                    error = undefined;
                }
            }
        }
        revision = state.revision;
        loaded = true;
        publish();
    };
    const refresh = (): Promise<void> => {
        if (loadingPromise) {
            return loadingPromise;
        }
        if (!options.load) {
            return Promise.resolve();
        }
        const load = options.load;
        loadingPromise = Promise.resolve()
            .then(load)
            .then(applySnapshot)
            .catch((cause: unknown) => {
                reportError({operation: 'load', cause});
                throw cause;
            })
            .finally(() => {
                loadingPromise = undefined;
                isLoading = false;
                publish();
            });
        isLoading = true;
        error = undefined;
        publish();
        return loadingPromise;
    };
    if (options.initialState) {
        applySnapshot(options.initialState);
    }
    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        load: () => (loaded ? Promise.resolve() : refresh()),
        refresh,
        applySnapshot,
        markResponseViewed: (chatId, responseId) => {
            const current = activity.chats[chatId];
            if (!current?.hasUnread || current.responseId !== responseId) {
                return Promise.resolve();
            }
            const key = JSON.stringify([chatId, responseId]);
            const pending = acknowledgements.get(key);
            if (pending) {
                return pending;
            }
            const command = Promise.resolve()
                .then(() => {
                    if (deletedChats.has(chatId)) {
                        return undefined;
                    }
                    return options.markResponseViewed(chatId, responseId);
                })
                .then((state) => {
                    if (state) {
                        applySnapshot(state);
                    }
                })
                .catch((cause: unknown) => {
                    if (deletedChats.has(chatId) || confirmedAcknowledgements.has(key)) {
                        return;
                    }
                    reportError({operation: 'markResponseViewed', chatId, responseId, cause});
                    throw cause;
                })
                .finally(() => {
                    acknowledgements.delete(key);
                    confirmedAcknowledgements.delete(key);
                });
            acknowledgements.set(key, command);
            error = undefined;
            publish();
            return command;
        },
        deleteChat: (chatId) => {
            deletedChats.add(chatId);
            const chats = {...activity.chats};
            delete chats[chatId];
            activity = createChatActivitySnapshot(chats);
            publish();
        },
    };
}
