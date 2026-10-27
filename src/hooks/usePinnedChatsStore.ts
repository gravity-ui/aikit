import {useEffect, useSyncExternalStore} from 'react';

import type {PinnedChatsStore} from '../utils/pinnedChatsStore';

/** Loads a stable store and subscribes to its confirmed state and persistence errors. */
export function usePinnedChatsStore(store: PinnedChatsStore) {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    useEffect(() => {
        store.load();
    }, [store]);
    return {...snapshot, setPinned: store.setPinned, load: store.load};
}
