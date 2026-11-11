import {Button, ThemeProvider} from '@gravity-ui/uikit';
import {configure, fireEvent, render, screen, waitFor} from '@testing-library/react';

import {ChatContainer} from '../../src/components/pages/ChatContainer/ChatContainer';
import type {ChatContainerProps} from '../../src/components/pages/ChatContainer/types';

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
