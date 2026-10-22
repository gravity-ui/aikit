import {type ReactNode, useImperativeHandle} from 'react';

import {act, render} from '@testing-library/react';

import type {ChatContainerProps} from '../../ChatContainer';
import {AIStudioChat} from '../AIStudioChat';
import type {AIStudioChatProps} from '../types';

let mockChatProps: ChatContainerProps;
let mockId = 0;
const mockReset = jest.fn();
const mockClearFailedDraft = jest.fn().mockReturnValue(true);

jest.mock('../McpToolRenderer', () => ({McpToolRenderer: () => null}));

jest.mock('uuid', () => ({v4: () => `id-${++mockId}`}));
jest.mock('../../ChatContainer', () => ({
    ChatContainer: (props: ChatContainerProps) => {
        mockChatProps = props;
        useImperativeHandle(props.promptInputProps?.apiRef, () => ({
            submit: async () => {},
            clearFailedDraft: mockClearFailedDraft,
        }));
        return null;
    },
}));
jest.mock('../../../molecules/InputContext', () => ({
    InputContextProvider: ({children}: {children: ReactNode}) => children,
    useInputContext: () => ({
        prepareFilesForSend: async () => ({
            base64Images: [],
            perSendFileParams: {fileAttachments: [], fileNames: []},
        }),
        reset: mockReset,
        contextItems: [],
        attachmentContent: null,
    }),
}));
jest.mock('../../../../adapters/openai', () => ({
    useOpenAIStreamAdapter: () => ({messages: [], status: 'ready', error: null}),
    fetchResponseToStreamEvents: () => ({}),
}));
jest.mock('../transforms', () => ({
    normalizeMcpCallIds: (value: unknown) => value,
    omitMcpListToolsEvents: (value: unknown) => value,
}));

const originalFetch = global.fetch;
const failedResponse = {ok: false, status: 503, statusText: 'Unavailable'};
const start = (extra: Partial<AIStudioChatProps> = {}) =>
    render(
        <AIStudioChat
            apiUrl="/chat"
            fileUpload={{} as AIStudioChatProps['fileUpload']}
            {...extra}
        />,
    );
const send = async (content: string) => {
    const result: {value: void | false} = {value: undefined};
    await act(async () => {
        result.value = await mockChatProps.onSendMessage({content});
    });
    return result.value;
};

afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    mockClearFailedDraft.mockReturnValue(true);
});

describe('AIStudioChat failed-send integration', () => {
    it.each(['hello', 'edited draft'])(
        'resubmits %s without the failed attempt or technical error',
        async (content) => {
            const fetchMock = jest
                .fn()
                .mockResolvedValueOnce(failedResponse)
                .mockResolvedValueOnce({ok: true});
            global.fetch = fetchMock;
            start();
            expect(await send('hello')).toBe(false);
            expect(mockChatProps.error?.message).toBe('API error: 503 Unavailable');
            expect(mockChatProps.messages?.map((message) => message.content)).toEqual(['hello']);
            await send(content);
            expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual([
                {role: 'user', content},
            ]);
            expect(mockChatProps.error).toBeNull();
        },
    );
    it('preserves accepted history across repeated failures', async () => {
        const fetchMock = jest.fn().mockResolvedValue(failedResponse);
        global.fetch = fetchMock;
        start({
            initialMessages: [
                {id: 'earlier', role: 'user', content: 'Earlier question'},
                {id: 'answer', role: 'assistant', content: 'Earlier answer'},
            ],
        });
        await send('hello');
        await send('hello');
        expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual([
            {role: 'user', content: 'Earlier question'},
            {role: 'assistant', content: 'Earlier answer'},
            {role: 'user', content: 'hello'},
        ]);
    });
    it('retries the original request and keeps failure UI separate from history', async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValueOnce(failedResponse)
            .mockResolvedValueOnce({ok: true});
        global.fetch = fetchMock;
        const transformRequest = jest.fn((request) => ({
            ...request,
            context: {documentId: 'doc-1'},
        }));
        start({transformRequest});
        await send('hello');
        await act(async () => {
            await mockChatProps.onRetry?.();
        });
        expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
        expect(transformRequest).toHaveBeenCalledTimes(1);
        expect(mockClearFailedDraft).toHaveBeenCalledTimes(1);
        expect(mockReset).toHaveBeenCalledTimes(1);
        expect(mockChatProps.error).toBeNull();
    });
    it('resets command scope on explicit new/select/delete, but not implicit first-chat creation', async () => {
        global.fetch = jest.fn().mockResolvedValue(failedResponse);
        start({
            showHistory: true,
            promptInputProps: {
                bodyProps: {autoFocusOnNewChat: false, autoFocusOnChatSelect: false},
            },
        });
        const initialKey = mockChatProps.promptInputProps?.commandsResetKey;
        await send('hello');
        expect(mockChatProps.promptInputProps?.commandsResetKey).toBe(initialKey);
        const firstChat = mockChatProps.activeChat;
        if (!firstChat) throw new Error('Expected an implicitly created conversation');
        await act(async () => {
            await mockChatProps.onCreateChat?.();
        });
        const newKey = mockChatProps.promptInputProps?.commandsResetKey;
        expect(newKey).not.toBe(initialKey);
        await act(async () => {
            await mockChatProps.onSelectChat?.(firstChat);
        });
        const selectedKey = mockChatProps.promptInputProps?.commandsResetKey;
        expect(selectedKey).not.toBe(newKey);
        await act(async () => {
            await mockChatProps.onDeleteChat?.(firstChat);
        });
        expect(mockChatProps.promptInputProps?.commandsResetKey).not.toBe(selectedKey);
        expect(mockChatProps.error).toBeNull();
    });
});

it('does not clear files belonging to a changed draft after Retry', async () => {
    global.fetch = jest
        .fn()
        .mockResolvedValueOnce(failedResponse)
        .mockResolvedValueOnce({ok: true});
    start();
    await send('hello');
    mockClearFailedDraft.mockReturnValue(false);
    await act(async () => {
        await mockChatProps.onRetry?.();
    });
    expect(mockReset).not.toHaveBeenCalled();
});

it('keeps the draft when Retry fails again', async () => {
    global.fetch = jest.fn().mockResolvedValue(failedResponse);
    start();
    await send('hello');
    await act(async () => {
        await mockChatProps.onRetry?.();
    });
    expect(mockClearFailedDraft).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
});
