import {useRef, useState} from 'react';

import {composeStories} from '@storybook/react';

import {usePinnedChatsStore} from '../../../../hooks';
import {createPinnedChatsStore} from '../../../../utils';
import {HistoryList} from '../HistoryList';
import * as DefaultHistoryStories from '../__stories__/History.stories';

export const HistoryStories = composeStories(DefaultHistoryStories);

export function PendingPinnedHistory() {
    const pending = useRef<{resolve: () => void; reject: () => void}>();
    const [saveCount, setSaveCount] = useState(0);
    const [store] = useState(() =>
        createPinnedChatsStore({
            load: () => [],
            save: () =>
                new Promise<void>((resolve, reject) => {
                    setSaveCount((count) => count + 1);
                    pending.current = {resolve, reject: () => reject(new Error('Save failed'))};
                }),
        }),
    );
    const {pinnedChatIds, setPinned, isLoading, error} = usePinnedChatsStore(store);
    return (
        <>
            <button onClick={() => pending.current?.resolve()}>Resolve save</button>
            <button onClick={() => pending.current?.reject()}>Reject save</button>
            <output data-qa="save-count">{saveCount}</output>
            {Boolean(error) && <div role="alert">Save failed</div>}
            <HistoryList
                chats={[
                    {id: 'first', name: 'First chat', createTime: '2025-11-12'},
                    {id: 'second', name: 'Second chat', createTime: '2025-11-11'},
                ]}
                pinnedChatIds={pinnedChatIds}
                onPinnedChange={setPinned}
                pinningDisabled={isLoading}
            />
        </>
    );
}
