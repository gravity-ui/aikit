import {createContext, useContext} from 'react';

/** Cooperate with the transcript before a disclosure changes layout. */
export const LayoutChangeContext = createContext<(change: () => void) => void>((change) =>
    change(),
);

export function useChatLayoutChange() {
    return useContext(LayoutChangeContext);
}
