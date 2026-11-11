import {useRef, useState} from 'react';

import {Button, ThemeProvider} from '@gravity-ui/uikit';
import {act, configure, fireEvent, render, screen, waitFor} from '@testing-library/react';

import {ChatContainer} from '../../src/components/pages/ChatContainer/ChatContainer';
import type {ChatContainerProps} from '../../src/components/pages/ChatContainer/types';
import {
    UserInstructionsScreen,
    type UserInstructionsScreenState,
} from '../../src/components/templates/UserInstructionsScreen';

jest.mock('uuid', () => ({v4: () => 'screen-test'}));
jest.mock('@diplodoc/transform', () => ({__esModule: true, default: jest.fn()}));

configure({testIdAttribute: 'data-qa'});

const originalMatchMedia = window.matchMedia;
const originalResizeObserver = global.ResizeObserver;
const originalScrollTo = Element.prototype.scrollTo;

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
    Element.prototype.scrollTo = jest.fn();
});
afterAll(() => {
    window.matchMedia = originalMatchMedia;
    global.ResizeObserver = originalResizeObserver;
    Element.prototype.scrollTo = originalScrollTo;
});

const screens: ChatContainerProps['screens'] = [
    {
        id: 'instructions',
        title: 'Instructions',
        menu: {label: 'Edit instructions'},
        render: () => <p>Instructions form</p>,
        footer: ({back}) => <Button onClick={back}>Cancel editing</Button>,
    },
];
const props: ChatContainerProps = {
    onSendMessage: async () => {},
    screens,
    showHistory: false,
    texts: {promptPlaceholder: 'Write a message', emptyStateTitle: 'Welcome screen'},
};
const chat = (overrides: Partial<ChatContainerProps> = {}) => (
    <ThemeProvider theme="light">
        <ChatContainer {...props} {...overrides} />
    </ThemeProvider>
);

it('uses the screen menu on welcome and preserves the same prompt instance and draft on Back', async () => {
    render(chat());
    const input = screen.getByPlaceholderText('Write a message');
    fireEvent.change(input, {target: {value: 'Keep this draft'}});
    fireEvent.click(screen.getByTestId('header-menu-button'));
    fireEvent.click(await screen.findByText('Edit instructions'));
    await screen.findByText('Instructions form');
    expect(input.closest('[hidden]')).not.toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    await waitFor(() => expect(screen.queryByText('Instructions form')).toBeNull());
    expect(screen.getByPlaceholderText('Write a message')).toBe(input);
    expect((input as HTMLTextAreaElement).value).toBe('Keep this draft');
    expect(input.closest('[hidden]')).toBeNull();
});

it('accepts messages while a secondary screen is open and returns to conversation without resetting input', async () => {
    const view = render(chat());
    const input = screen.getByPlaceholderText('Write a message');
    fireEvent.change(input, {target: {value: 'Next question'}});
    view.rerender(chat({activeScreen: 'instructions'}));
    const messages: NonNullable<ChatContainerProps['messages']> = [
        {id: 'one', role: 'user', content: 'Sent message', format: 'plain'},
    ];
    view.rerender(chat({activeScreen: 'instructions', messages}));
    view.rerender(chat({activeScreen: 'chat', messages}));
    expect(await screen.findByText('Sent message')).toBeTruthy();
    expect(screen.getByPlaceholderText('Write a message')).toBe(input);
    expect((input as HTMLTextAreaElement).value).toBe('Next question');
    expect(screen.queryByText('Welcome screen')).toBeNull();
});

it('removes disabled screens from the menu and immediately falls back when the active screen is removed', async () => {
    const onScreenChange = jest.fn();
    const view = render(chat({activeScreen: 'instructions', onScreenChange}));
    expect(screen.getByText('Instructions form')).toBeTruthy();
    view.rerender(chat({activeScreen: 'instructions', screens: [], onScreenChange}));
    expect(screen.queryByText('Instructions form')).toBeNull();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.queryByTestId('header-menu-button')).toBeNull();
    expect(onScreenChange).toHaveBeenCalledWith('chat', {
        previousScreen: 'instructions',
        reason: 'unavailable',
    });
});

function InstructionsChat({
    value = '',
    enabled = true,
    onSave,
    onSaved = () => {},
}: {
    value?: string;
    enabled?: boolean;
    onSave: (next: string) => Promise<void>;
    onSaved?: () => void;
}) {
    const [activeScreen, setActiveScreen] = useState('instructions');
    const state = useRef<UserInstructionsScreenState>({dirty: false, saving: false});
    return (
        <ThemeProvider theme="light">
            <ChatContainer
                {...props}
                activeScreen={activeScreen}
                onScreenChange={setActiveScreen}
                screens={[
                    {
                        id: 'instructions',
                        title: 'Instructions',
                        menu: {label: 'Edit instructions'},
                        enabled,
                        beforeLeave: () => !state.current.saving,
                        render: () => (
                            <UserInstructionsScreen
                                value={value}
                                maxLength={10}
                                onStateChange={(next) => {
                                    state.current = next;
                                }}
                                onSave={onSave}
                                onSaved={() => {
                                    onSaved();
                                    setActiveScreen('chat');
                                }}
                                onCancel={() => setActiveScreen('chat')}
                            />
                        ),
                    },
                ]}
            />
        </ThemeProvider>
    );
}

it('keeps the instructions draft after save failure, prevents duplicate saves and exits only on success', async () => {
    let reject!: (error: Error) => void;
    const onSave = jest
        .fn()
        .mockImplementationOnce(
            () =>
                new Promise<void>((_, fail) => {
                    reject = fail;
                }),
        )
        .mockResolvedValue(undefined);
    render(<InstructionsChat onSave={onSave} />);
    const input = screen.getByLabelText('User instructions');
    fireEvent.change(input, {target: {value: '  hello  '}});
    expect(screen.getByText('9 / 10')).toBeTruthy();
    const save = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(save);
    fireEvent.click(save);
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('  hello  ');
    expect((input as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole('button', {name: 'Cancel'}) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => reject(new Error('offline')));
    expect(screen.getByRole('alert').textContent).toContain('Could not save');
    expect((input as HTMLTextAreaElement).value).toBe('  hello  ');
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByLabelText('User instructions')).toBeNull());
    expect(onSave).toHaveBeenCalledTimes(2);
});

it('refreshes clean instructions, retains a dirty draft, validates the counter limit and discards on Cancel', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const view = render(<InstructionsChat value="saved" onSave={onSave} />);
    view.rerender(<InstructionsChat value="server" onSave={onSave} />);
    const input = screen.getByLabelText('User instructions') as HTMLTextAreaElement;
    expect(input.value).toBe('server');
    fireEvent.change(input, {target: {value: '123456789😀'}});
    expect(screen.getByText('11 / 10')).toBeTruthy();
    expect((screen.getByRole('button', {name: 'Save'}) as HTMLButtonElement).disabled).toBe(true);
    view.rerender(<InstructionsChat value="new server" onSave={onSave} />);
    expect(input.value).toBe('123456789😀');
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    fireEvent.click(screen.getByTestId('header-menu-button'));
    fireEvent.click(await screen.findByText('Edit instructions'));
    expect(((await screen.findByLabelText('User instructions')) as HTMLTextAreaElement).value).toBe(
        'new server',
    );
    expect(onSave).not.toHaveBeenCalled();
});

it('ignores a departed instructions visit save completion after forced fallback and reopening', async () => {
    let resolve!: () => void;
    const onSave = jest.fn(
        () =>
            new Promise<void>((done) => {
                resolve = done;
            }),
    );
    const onSaved = jest.fn();
    const view = render(<InstructionsChat onSave={onSave} onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText('User instructions'), {target: {value: 'old draft'}});
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    view.rerender(<InstructionsChat enabled={false} onSave={onSave} onSaved={onSaved} />);
    view.rerender(<InstructionsChat onSave={onSave} onSaved={onSaved} />);
    fireEvent.click(screen.getByTestId('header-menu-button'));
    fireEvent.click(await screen.findByText('Edit instructions'));
    fireEvent.change(await screen.findByLabelText('User instructions'), {
        target: {value: 'new draft'},
    });
    await act(async () => resolve());
    expect(onSaved).not.toHaveBeenCalled();
    expect((screen.getByLabelText('User instructions') as HTMLTextAreaElement).value).toBe(
        'new draft',
    );
});
