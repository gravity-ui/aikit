import {type Ref, createRef} from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';

import type {PromptInputHandle} from '../../../organisms/PromptInput';
import {ChatContainer} from '../ChatContainer';

jest.mock('../../../templates/ChatContent', () => ({
    ChatContent: ({
        emptyContainerProps,
    }: {
        emptyContainerProps: {
            onSuggestionClick: (text: string, id: string, data: Record<string, unknown>) => void;
        };
    }) => (
        <button
            onClick={() =>
                emptyContainerProps.onSuggestionClick('Welcome prompt', 'welcome', {
                    mode: 'explain',
                })
            }
        >
            Welcome suggestion
        </button>
    ),
}));
jest.mock('uuid', () => ({v4: () => 'test-id'}));

const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalMatchMedia = window.matchMedia;
const originalResizeObserver = global.ResizeObserver;

afterAll(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
    window.matchMedia = originalMatchMedia;
    global.ResizeObserver = originalResizeObserver;
});

beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
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

const selection = {sourceId: 'context', id: 'guide', title: 'Guide', data: {documentId: 'guide'}};

function start(onSendMessage: jest.Mock, trigger: '/' | '@', apiRef?: Ref<PromptInputHandle>) {
    render(
        <ThemeProvider>
            <ChatContainer
                messages={[]}
                onSendMessage={onSendMessage}
                promptInputProps={{
                    apiRef,
                    commands: {
                        sources: [
                            {
                                id: 'context',
                                title: 'Context',
                                trigger,
                                items: [{id: 'guide', title: 'Guide', data: {documentId: 'guide'}}],
                            },
                        ],
                    },
                }}
            />
        </ThemeProvider>,
    );
    return screen.getByRole('combobox') as HTMLTextAreaElement;
}

async function selectContext(input: HTMLTextAreaElement, trigger: '/' | '@') {
    fireEvent.change(input, {target: {value: `Explain ${trigger}guide`}});
    await screen.findByRole('option', {name: 'Guide'});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() => expect(input.value).toBe('Explain '));
    expect(screen.getByText('Guide')).toBeTruthy();
}

describe('ChatContainer command submission integration', () => {
    it.each(['/', '@'] as const)(
        'selects %s with Enter without sending, then submits and clears context',
        async (trigger) => {
            const onSend = jest.fn().mockResolvedValue(undefined);
            const input = start(onSend, trigger);
            await selectContext(input, trigger);
            expect(onSend).not.toHaveBeenCalled();
            fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
            await waitFor(() => expect(input.value).toBe(''));
            expect(onSend).toHaveBeenCalledTimes(1);
            expect(onSend).toHaveBeenCalledWith({content: 'Explain', selections: [selection]});
            expect(screen.queryByText('Guide')).toBeNull();
            await waitFor(() => expect(input.disabled).toBe(false));
            fireEvent.change(input, {target: {value: 'Next'}});
            fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
            await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
            expect(onSend.mock.calls[1][0].selections ?? []).toEqual([]);
        },
    );

    it.each(['cancel', 'failure'])(
        'retains the real draft and selected context after %s',
        async (mode) => {
            const onSend =
                mode === 'cancel'
                    ? jest.fn().mockResolvedValue(false)
                    : jest.fn().mockRejectedValue(new Error('Network failure'));
            const input = start(onSend, '@');
            await selectContext(input, '@');
            fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
            await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
            await waitFor(() => expect(input.disabled).toBe(false));
            expect(input.value).toBe('Explain ');
            expect(screen.getByText('Guide')).toBeTruthy();
            onSend.mockResolvedValue(undefined);
            fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
            await waitFor(() => expect(input.value).toBe(''));
            expect(onSend.mock.calls[1][0].selections).toEqual([selection]);
        },
    );
});

it('submits welcome suggestions with context through the prompt lifecycle', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    const input = start(onSend, '@');
    await selectContext(input, '@');
    fireEvent.click(screen.getByRole('button', {name: 'Welcome suggestion'}));
    await waitFor(() =>
        expect(onSend).toHaveBeenCalledWith({
            content: 'Welcome prompt',
            suggestion: {id: 'welcome', data: {mode: 'explain'}},
            selections: [selection],
        }),
    );
    expect(input.value).toBe('');
    expect(screen.queryByText('Guide')).toBeNull();
});

it('restores context and the original draft after a rejected welcome suggestion', async () => {
    const onSend = jest.fn().mockResolvedValue(false);
    const input = start(onSend, '@');
    await selectContext(input, '@');
    fireEvent.click(screen.getByRole('button', {name: 'Welcome suggestion'}));
    await waitFor(() => expect(input.value).toBe('Explain '));
    expect(screen.getByText('Guide')).toBeTruthy();
});

it('clears context immediately while a send is still pending', async () => {
    let finish!: () => void;
    const onSend = jest.fn(
        () =>
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
    );
    const input = start(onSend, '@');
    await selectContext(input, '@');
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    expect(input.value).toBe('');
    expect(screen.queryByText('Guide')).toBeNull();
    await act(async () => finish());
});

it('clears a restored draft and its context through the Retry API', async () => {
    const apiRef = createRef<PromptInputHandle>();
    const input = start(jest.fn().mockResolvedValue(false), '@', apiRef);
    await selectContext(input, '@');
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() => expect(input.value).toBe('Explain '));
    act(() => {
        expect(apiRef.current?.clearFailedDraft()).toBe(true);
    });
    expect(input.value).toBe('');
    expect(screen.queryByText('Guide')).toBeNull();
});

it('preserves a newly selected context when the old request is retried', async () => {
    const apiRef = createRef<PromptInputHandle>();
    const input = start(jest.fn().mockResolvedValue(false), '@', apiRef);
    await selectContext(input, '@');
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    await waitFor(() => expect(input.value).toBe('Explain '));
    await selectContext(input, '@');
    act(() => {
        expect(apiRef.current?.clearFailedDraft()).toBe(false);
    });
    expect(input.value).toBe('Explain ');
    expect(screen.getByText('Guide')).toBeTruthy();
});
