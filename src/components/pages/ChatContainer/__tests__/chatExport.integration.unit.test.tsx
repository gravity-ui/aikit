import {useState} from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import {act, fireEvent, render, renderHook, screen} from '@testing-library/react';

import type {ChatType} from '../../../../types';
import type {TChatMessage} from '../../../../types/messages';
import * as chatMarkdown from '../../../../utils/chatMarkdown';
import {ChatContainer} from '../ChatContainer';
import type {ChatExportConfig} from '../types';
import {useChatExport} from '../useChatExport';

jest.mock('../../../templates/ChatContent/ChatContent', () => ({ChatContent: () => null}));
jest.mock('../../../organisms/PromptInput', () => ({PromptInput: () => null}));
jest.mock('uuid', () => ({v4: () => 'test-id'}));

const originalExecCommand = document.execCommand;
const originalMatchMedia = window.matchMedia;
const originalResizeObserver = global.ResizeObserver;
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
    document.execCommand = jest.fn(() => false);
});

beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }));
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    }));
});

afterAll(() => {
    document.execCommand = originalExecCommand;
    window.matchMedia = originalMatchMedia;
    global.ResizeObserver = originalResizeObserver;
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
});

function Conversation({
    autoFocus,
    onResult,
}: {
    autoFocus: boolean;
    onResult?: ChatExportConfig['onResult'];
}) {
    const [chat, setChat] = useState<ChatType | undefined>({
        id: '1',
        name: 'Saved chat',
        createTime: null,
    });
    return (
        <ThemeProvider>
            <ChatContainer
                activeChat={chat}
                messages={[{role: 'user', content: chat ? 'Saved message' : 'Draft message'}]}
                onCreateChat={() => setChat(undefined)}
                onSendMessage={async () => undefined}
                chatExport={{onResult}}
                showHistory={false}
                promptInputProps={{bodyProps: {autoFocusOnNewChat: autoFocus}}}
            />
        </ThemeProvider>
    );
}

function clickQa(qa: string) {
    const element = document.querySelector(`[data-qa="${qa}"]`);
    if (!element) throw new Error(`Missing control: ${qa}`);
    fireEvent.click(element);
}

function copy() {
    clickQa('header-menu-button');
    clickQa('header-menu-item-chat-export-copy');
}

function deferClipboard() {
    let resolve = () => {};
    let reject = (_error: Error) => {};
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    const writeText = jest.fn(() => promise);
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});
    return {writeText, resolve, reject};
}

describe.each([true, false])('chat export conversation isolation (autofocus=%s)', (autoFocus) => {
    it('clears a completed notification when saved chat 1 becomes a draft', async () => {
        const clipboard = deferClipboard();
        render(<Conversation autoFocus={autoFocus} />);
        copy();
        await act(async () => clipboard.resolve());
        expect(screen.getByRole('status').textContent).toBe('Chat copied');
        clickQa('header-action-newChat');
        expect(screen.queryByRole('status')).toBeNull();
    });

    it.each(['success', 'failure'] as const)(
        'ignores pending %s after switching to a new chat and permits copying in each draft',
        async (outcome) => {
            const original = deferClipboard();
            render(<Conversation autoFocus={autoFocus} />);
            copy();
            expect(original.writeText).toHaveBeenCalledWith('## User\n\nSaved message');
            clickQa('header-action-newChat');
            await act(async () => {
                if (outcome === 'success') original.resolve();
                else original.reject(new Error('Clipboard denied'));
            });
            expect(screen.queryByRole('status')).toBeNull();

            const draft = deferClipboard();
            copy();
            expect(draft.writeText).toHaveBeenCalledWith('## User\n\nDraft message');
            clickQa('header-action-newChat');
            await act(async () => draft.resolve());
            expect(screen.queryByRole('status')).toBeNull();

            const next = deferClipboard();
            copy();
            await act(async () => next.resolve());
            expect(screen.getByRole('status').textContent).toBe('Chat copied');
        },
    );
});

describe('chat export clipboard compatibility', () => {
    it('copies synchronously without using a restricted async clipboard API', () => {
        const clipboard = deferClipboard();
        document.execCommand = jest.fn((command) => {
            expect(command).toBe('copy');
            expect((document.activeElement as HTMLTextAreaElement).value).toBe(
                '## User\n\nSaved message',
            );
            return true;
        });
        render(<Conversation autoFocus={false} />);
        copy();
        expect(document.execCommand).toHaveBeenCalledTimes(1);
        expect(clipboard.writeText).not.toHaveBeenCalled();
        expect(screen.getByRole('status').textContent).toBe('Chat copied');
    });

    it('reports failure when both methods fail and allows retry via synchronous copy', async () => {
        const clipboard = deferClipboard();
        render(<Conversation autoFocus={false} />);
        copy();
        await act(async () => clipboard.reject(new Error('NotAllowedError')));
        expect(screen.getByRole('status').textContent).toBe(
            'Could not copy chat. Please try again.',
        );
        document.execCommand = jest.fn(() => true);
        copy();
        expect(screen.getByRole('status').textContent).toBe('Chat copied');
        expect(clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it('reports failure when synchronous copy fails and the async API is unavailable', () => {
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: undefined});
        render(<Conversation autoFocus={false} />);
        copy();
        expect(screen.getByRole('status').textContent).toBe(
            'Could not copy chat. Please try again.',
        );
    });
});

describe('export hook lifecycle', () => {
    const messages = [{role: 'user' as const, content: 'Message'}];

    it('ignores the original request after A -> B -> A without unlocking the new request', async () => {
        const original = deferClipboard();
        const {result, rerender} = renderHook(
            ({conversationKey}) =>
                useChatExport({
                    conversationKey,
                    messages,
                    status: 'ready',
                    config: {},
                }),
            {initialProps: {conversationKey: 'chat:A'}},
        );
        act(() => {
            result.current.menuItems[0].onClick();
        });
        rerender({conversationKey: 'chat:B'});
        rerender({conversationKey: 'chat:A'});
        const next = deferClipboard();
        act(() => {
            result.current.menuItems[0].onClick();
        });
        await act(async () => original.resolve());
        expect(result.current.notice).toBeUndefined();
        expect(result.current.dialogProps.disabled).toBe(true);
        await act(async () => next.resolve());
        expect(result.current.notice?.text).toBe('Chat copied');
        expect(result.current.dialogProps.disabled).toBe(false);
    });

    it('resets selection and invalidates an operation when export is disabled and enabled again', async () => {
        const original = deferClipboard();
        const {result, rerender} = renderHook(
            ({enabled}) =>
                useChatExport({
                    conversationKey: 'chat:A',
                    messages,
                    status: 'ready',
                    config: enabled ? {} : undefined,
                }),
            {initialProps: {enabled: true}},
        );
        act(() => {
            result.current.menuItems[2].onClick();
        });
        expect(result.current.dialogProps.open).toBe(true);
        act(() => {
            result.current.dialogProps.onCopy();
        });
        rerender({enabled: false});
        expect(result.current.menuItems).toEqual([]);
        rerender({enabled: true});
        expect(result.current.dialogProps.open).toBe(false);
        expect(result.current.dialogProps.messages).toEqual([]);
        await act(async () => original.reject(new Error('Clipboard denied')));
        expect(result.current.notice).toBeUndefined();
    });

    it('supports a ChatContainer with omitted messages and export configuration', () => {
        render(
            <ThemeProvider>
                <ChatContainer onSendMessage={async () => undefined} />
            </ThemeProvider>,
        );
        expect(screen.queryByRole('status')).toBeNull();
        expect(document.querySelector('[data-qa="header-menu-button"]')).toBeNull();
    });
});

it('connects dialog selection and copy actions to the export hook', async () => {
    document.execCommand = jest.fn(() => true);
    render(<Conversation autoFocus={false} />);
    await act(async () => {
        clickQa('header-menu-button');
    });
    await act(async () => {
        clickQa('header-menu-item-chat-export-select');
    });
    fireEvent.click(screen.getByRole('checkbox', {name: 'Select all'}));
    expect((screen.getByRole('button', {name: 'Copy'}) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', {name: 'User: Saved message'}));
    fireEvent.click(screen.getByRole('button', {name: 'Copy'}));
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByRole('status').textContent).toBe('Chat copied');
});

describe('custom export notifications', () => {
    const messages = [{role: 'user' as const, content: 'Message'}];
    afterEach(() => jest.restoreAllMocks());

    it.each(['success', 'error'] as const)(
        'delivers copy %s to the application without a built-in alert',
        async (status) => {
            const clipboard = deferClipboard();
            const onResult = jest.fn();
            const error = new Error('Clipboard denied');
            render(<Conversation autoFocus={false} onResult={onResult} />);
            copy();
            await act(async () => {
                if (status === 'success') clipboard.resolve();
                else clipboard.reject(error);
            });
            expect(onResult).toHaveBeenCalledTimes(1);
            expect(onResult).toHaveBeenCalledWith({
                action: 'copy',
                status,
                chatId: '1',
                ...(status === 'error' ? {error} : {}),
            });
            expect(screen.queryByRole('status')).toBeNull();
        },
    );

    it.each(['success', 'error'] as const)(
        'delivers selected-message download %s with an undefined draft ID',
        async (status) => {
            const onResult = jest.fn();
            const error = new Error('Download failed');
            const download = jest
                .spyOn(chatMarkdown, 'downloadChatMarkdown')
                .mockImplementation(() => {
                    if (status === 'error') throw error;
                });
            const {result} = renderHook(() =>
                useChatExport({
                    conversationKey: 'draft:1',
                    messages,
                    status: 'ready',
                    config: {onResult},
                }),
            );
            act(() => {
                result.current.menuItems[2].onClick();
            });
            await act(async () => result.current.dialogProps.onDownload());
            expect(download).toHaveBeenCalledWith('## User\n\nMessage', undefined);
            expect(onResult).toHaveBeenCalledTimes(1);
            expect(onResult).toHaveBeenCalledWith({
                action: 'download',
                status,
                chatId: undefined,
                ...(status === 'error' ? {error} : {}),
            });
            expect(result.current.notice).toBeUndefined();
            expect(result.current.dialogProps.disabled).toBe(false);
        },
    );

    it.each(['switch', 'disable', 'unmount'] as const)(
        'does not notify after %s',
        async (transition) => {
            const clipboard = deferClipboard();
            const onResult = jest.fn();
            const {result, rerender, unmount} = renderHook(
                ({conversationKey, enabled}) =>
                    useChatExport({
                        conversationKey,
                        chatId: conversationKey,
                        messages,
                        status: 'ready',
                        config: enabled ? {onResult} : undefined,
                    }),
                {initialProps: {conversationKey: 'A', enabled: true}},
            );
            act(() => {
                result.current.menuItems[0].onClick();
            });
            if (transition === 'switch') {
                rerender({conversationKey: 'B', enabled: true});
                rerender({conversationKey: 'A', enabled: true});
            } else if (transition === 'disable') {
                rerender({conversationKey: 'A', enabled: false});
            } else unmount();
            await act(async () => clipboard.resolve());
            expect(onResult).not.toHaveBeenCalled();
        },
    );

    it('does not report callback exceptions as export failures or keep the action pending', async () => {
        document.execCommand = jest.fn(() => true);
        const error = new Error('Notification failed');
        const onResult = jest.fn(() => {
            throw error;
        });
        const {result} = renderHook(() =>
            useChatExport({
                conversationKey: 'A',
                chatId: 'A',
                messages,
                status: 'ready',
                config: {onResult},
            }),
        );
        await act(async () => {
            await expect(Promise.resolve(result.current.menuItems[0].onClick())).rejects.toBe(
                error,
            );
        });
        expect(onResult).toHaveBeenCalledTimes(1);
        expect(onResult).toHaveBeenCalledWith({action: 'copy', status: 'success', chatId: 'A'});
        expect(result.current.dialogProps.disabled).toBe(false);
        expect(result.current.notice).toBeUndefined();
    });
});

describe('export review regressions', () => {
    it('defers custom serializers until exporting and reports their failures', async () => {
        const error = new Error('Incomplete custom card');
        const getContentMarkdown = jest.fn(() => {
            throw error;
        });
        const onResult = jest.fn();
        const {result, rerender} = renderHook(
            ({streaming}) =>
                useChatExport({
                    conversationKey: 'chat:A',
                    chatId: 'A',
                    messages: [
                        {role: 'assistant', content: {type: 'card', data: {}}},
                    ] as unknown as TChatMessage[],
                    status: streaming ? 'streaming' : 'ready',
                    config: {getContentMarkdown, onResult},
                }),
            {initialProps: {streaming: true}},
        );
        expect(result.current.menuItems[0].disabled).toBe(true);
        expect(getContentMarkdown).not.toHaveBeenCalled();
        rerender({streaming: false});
        act(() => {
            result.current.menuItems[2].onClick();
        });
        expect(getContentMarkdown).not.toHaveBeenCalled();
        await act(async () => {
            await result.current.menuItems[0].onClick();
        });
        expect(onResult).toHaveBeenCalledWith({
            action: 'copy',
            status: 'error',
            chatId: 'A',
            error,
        });
        expect(result.current.dialogProps.disabled).toBe(false);
    });

    it('keeps selection through equivalent arrays and closes it after reordering', () => {
        const first = {id: 'a', role: 'user' as const, content: 'First'};
        const second = {id: 'b', role: 'assistant' as const, content: 'Second'};
        const {result, rerender} = renderHook(
            ({messages}) =>
                useChatExport({
                    conversationKey: 'chat:A',
                    messages,
                    status: 'error',
                    config: {},
                }),
            {initialProps: {messages: [first, second]}},
        );
        expect(result.current.dialogProps.messages).toEqual([]);
        act(() => {
            result.current.menuItems[2].onClick();
        });
        act(() => {
            result.current.dialogProps.onSelectionChange(0, false);
        });
        rerender({messages: [{...first}, {...second}]});
        expect(result.current.dialogProps.open).toBe(true);
        expect(result.current.dialogProps.messages.map(({selected}) => selected)).toEqual([
            false,
            true,
        ]);
        rerender({messages: [second, first]});
        expect(result.current.dialogProps.open).toBe(false);
    });
});
