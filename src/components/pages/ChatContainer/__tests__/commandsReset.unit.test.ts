import {act, renderHook} from '@testing-library/react';

import type {ChatContainerProps} from '../types';
import {useChatContainer} from '../useChatContainer';

jest.mock('../../../organisms/Header', () => ({
    HeaderAction: {NewChat: 'new', History: 'history'},
}));

const chat = {id: 'a', name: 'First', createTime: '2026-10-20'};
const props: ChatContainerProps = {
    messages: [],
    onSendMessage: async () => {},
    activeChat: chat,
    promptInputProps: {bodyProps: {autoFocusOnNewChat: false, autoFocusOnChatSelect: false}},
};

describe('conversation command scope', () => {
    it('resets new and selected conversations independently of autofocus', () => {
        const {result} = renderHook(() => useChatContainer(props));
        const first = result.current.commandsResetKey;
        act(() => result.current.handleNewChat());
        const second = result.current.commandsResetKey;
        expect(second).not.toBe(first);
        expect(result.current.promptInputKey).toBe(0);
        act(() => result.current.handleSelectChat({...chat, id: 'b'}));
        expect(result.current.commandsResetKey).not.toBe(second);
        expect(result.current.promptInputKey).toBe(0);
    });
    it('observes external conversation switches and active deletion', () => {
        const {result, rerender} = renderHook(
            (input: ChatContainerProps) => useChatContainer(input),
            {initialProps: props},
        );
        const first = result.current.commandsResetKey;
        rerender({...props, activeChat: {...chat, id: 'b'}});
        const second = result.current.commandsResetKey;
        expect(second).not.toBe(first);
        rerender({...props, activeChat: null});
        expect(result.current.commandsResetKey).not.toBe(second);
        expect(result.current.promptInputKey).toBe(0);
    });
});
