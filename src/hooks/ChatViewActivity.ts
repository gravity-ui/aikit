import {createContext, useContext} from 'react';

/** Internal visibility boundary; standalone components remain active. */
export const ChatViewActivityContext = createContext({
    active: true,
    conversationKey: '',
    trackScroll: false,
});
export const useChatViewActivity = () => useContext(ChatViewActivityContext);
