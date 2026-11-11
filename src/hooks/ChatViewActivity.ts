import {createContext, useContext} from 'react';

/** Internal visibility boundary; standalone components remain active. */
export const ChatViewActivityContext = createContext({active: true, conversationKey: ''});
export const useChatViewActivity = () => useContext(ChatViewActivityContext);
