import {ThemeProvider} from '@gravity-ui/uikit';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';

import {ChatContainer} from '../ChatContainer';

jest.mock('../../../templates/ChatContent', () => ({ChatContent: () => null}));
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

function start(onSendMessage: jest.Mock, trigger: '/' | '@') {
    render(
        <ThemeProvider>
            <ChatContainer
                messages={[]}
                onSendMessage={onSendMessage}
                promptInputProps={{
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
