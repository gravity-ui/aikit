import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';

import {type ChatActivityStore, EMPTY_CHAT_ACTIVITY} from '../utils/chatActivity';

export interface ChatActivityView {
    chatId?: string;
    /** Pass only the response actually rendered by the selected chat, never the pending response. */
    renderedResponseId?: string;
    /** False while the assistant panel is closed, collapsed or otherwise hidden. */
    isPanelVisible: boolean;
}

const noopSubscribe = () => () => {};
const emptySnapshot = () => EMPTY_CHAT_ACTIVITY;
// Async stores expose errors in their snapshots or callbacks; effects consume rejections.
const ignoreStoreError = () => {};

/** Subscribe to shared activity and acknowledge only a committed, visible response revision. */
export function useChatActivity(store?: ChatActivityStore, view?: ChatActivityView) {
    const subscribe = useCallback(
        (listener: () => void) => (store ? store.subscribe(listener) : noopSubscribe()),
        [store],
    );
    const getSnapshot = useCallback(() => (store ? store.getSnapshot() : emptySnapshot()), [store]);
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, emptySnapshot);
    const [visibilityRevision, setVisibilityRevision] = useState(0);
    useEffect(() => {
        Promise.resolve(store?.load?.()).catch(ignoreStoreError);
    }, [store]);
    useEffect(() => {
        if (!view?.isPanelVisible) {
            return undefined;
        }
        const refresh = () => setVisibilityRevision((revision) => revision + 1);
        document.addEventListener('visibilitychange', refresh);
        window.addEventListener('focus', refresh);
        return () => {
            document.removeEventListener('visibilitychange', refresh);
            window.removeEventListener('focus', refresh);
        };
    }, [view?.isPanelVisible]);
    const currentActivity = view?.chatId ? snapshot.chats[view.chatId] : undefined;
    useEffect(() => {
        if (
            view?.isPanelVisible &&
            view.chatId &&
            view.renderedResponseId &&
            currentActivity?.hasUnread &&
            currentActivity.responseId === view.renderedResponseId &&
            document.visibilityState === 'visible'
        ) {
            Promise.resolve(store?.markResponseViewed(view.chatId, view.renderedResponseId)).catch(
                ignoreStoreError,
            );
        }
    }, [
        store,
        currentActivity?.hasUnread,
        currentActivity?.responseId,
        view?.chatId,
        view?.renderedResponseId,
        view?.isPanelVisible,
        visibilityRevision,
    ]);
    return snapshot;
}
