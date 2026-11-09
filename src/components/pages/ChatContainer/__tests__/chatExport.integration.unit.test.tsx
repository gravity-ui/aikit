import {useState} from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import {act, fireEvent, render, screen} from '@testing-library/react';

import type {ChatType} from '../../../../types';
import {ChatContainer} from '../ChatContainer';

jest.mock('../../../templates/ChatContent/ChatContent', () => ({ChatContent: () => null}));
jest.mock('../../../organisms/PromptInput', () => ({PromptInput: () => null}));
jest.mock('uuid', () => ({v4: () => 'test-id'}));

const originalMatchMedia = window.matchMedia;
const originalResizeObserver = global.ResizeObserver;
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

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
    window.matchMedia = originalMatchMedia;
    global.ResizeObserver = originalResizeObserver;
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
});

function Conversation({autoFocus}: {autoFocus: boolean}) {
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
                chatExport={{}}
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
