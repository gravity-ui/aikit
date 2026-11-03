import {useState} from 'react';

import {Provider} from '@gravity-ui/uikit';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';

import {Header} from '../../src/components/organisms/Header';
import {
    HistoryList,
    type HistoryListProps,
} from '../../src/components/templates/History/HistoryList';
import type {ChatType} from '../../src/types';

jest.mock('uuid', () => ({v4: () => 'navigation-test'}));

const chats: ChatType[] = [
    {id: 'alpha', name: 'Alpha chat', createTime: '2026-11-01'},
    {id: 'beta', name: 'Beta chat', createTime: '2026-10-31'},
];

function ChatNavigation({
    mobile = false,
    lang = 'en',
    searchable = true,
    filterFunction,
}: {
    mobile?: boolean;
    lang?: 'en' | 'ru';
    searchable?: boolean;
    filterFunction?: HistoryListProps['filterFunction'];
}) {
    const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
    const [pinned, setPinned] = useState<string[]>([]);
    const [notice, setNotice] = useState('');
    return (
        <Provider lang={lang} mobile={mobile}>
            <Header
                isMobile={mobile}
                title={selectedChat?.name ?? 'Choose a chat'}
                menuButtonTooltip="Chat actions"
                menuItems={[
                    {id: 'reset', label: 'Reset selection', onClick: () => setSelectedChat(null)},
                    {
                        id: 'disabled',
                        label: 'Unavailable action',
                        disabled: true,
                        onClick: () => setNotice('Unexpected action'),
                    },
                ]}
            />
            <HistoryList
                chats={chats}
                searchable={searchable}
                filterFunction={filterFunction}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                pinnedChatIds={pinned}
                onPinnedChange={(id, next) =>
                    setPinned((previous) =>
                        next ? [...previous, id] : previous.filter((value) => value !== id),
                    )
                }
                onDeleteChat={async (chat) => setNotice(`Deleted ${chat.name}`)}
            />
            <output aria-label="Action result">{notice}</output>
        </Provider>
    );
}

const originalMatchMedia = window.matchMedia;
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalResizeObserver = global.ResizeObserver;

beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }));
    Element.prototype.scrollIntoView = jest.fn();
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    }));
});

afterAll(() => {
    window.matchMedia = originalMatchMedia;
    Element.prototype.scrollIntoView = originalScrollIntoView;
    global.ResizeObserver = originalResizeObserver;
});

describe('chat navigation with UIKit 8', () => {
    it('filters history and selects the visible chat from the keyboard', async () => {
        render(<ChatNavigation />);
        const search = screen.getByRole('combobox', {name: 'Search your chats'});
        expect(search.getAttribute('aria-autocomplete')).toBe('list');
        expect(search.getAttribute('aria-haspopup')).toBe('grid');
        fireEvent.change(search, {target: {value: 'Beta'}});
        expect(screen.queryByRole('row', {name: /Alpha chat/})).toBeNull();
        fireEvent.keyDown(search, {key: 'Enter', code: 'Enter'});
        await waitFor(() => {
            expect(screen.getByRole('row', {name: /Beta chat/}).getAttribute('aria-selected')).toBe(
                'true',
            );
        });
        expect(screen.getAllByText('Beta chat')).toHaveLength(2);

        fireEvent.change(search, {target: {value: 'no results'}});
        expect(screen.getByText('No chats match your search')).toBeTruthy();
        fireEvent.change(search, {target: {value: ''}});
        expect(screen.getByRole('row', {name: /Alpha chat/})).toBeTruthy();
    });

    it('reuses filtered history while moving the active row and selects after query changes', () => {
        const matches = jest.fn((item: {type: string; name?: string}) => item.type === 'chat');
        const filterFunction = jest.fn(() => matches);
        render(<ChatNavigation filterFunction={filterFunction} />);
        const search = screen.getByRole('combobox', {name: 'Search your chats'});
        fireEvent.change(search, {target: {value: 'chat'}});
        expect(filterFunction).toHaveBeenCalledTimes(1);
        expect(matches).toHaveBeenCalledTimes(2);
        const firstActive = search.getAttribute('aria-activedescendant');
        expect(firstActive).toBeTruthy();
        fireEvent.keyDown(search, {key: 'ArrowDown', code: 'ArrowDown'});
        expect(search.getAttribute('aria-activedescendant')).not.toBe(firstActive);
        expect(filterFunction).toHaveBeenCalledTimes(1);
        expect(matches).toHaveBeenCalledTimes(2);
        fireEvent.change(search, {target: {value: 'another query'}});
        expect(filterFunction).toHaveBeenCalledTimes(2);
        expect(matches).toHaveBeenCalledTimes(4);
        expect(search.getAttribute('aria-activedescendant')).toBe(firstActive);
        fireEvent.keyDown(search, {key: 'Enter', code: 'Enter'});
        expect(screen.getAllByText('Alpha chat')).toHaveLength(2);
    });

    it('pins and deletes a chat without selecting it', async () => {
        render(<ChatNavigation />);
        const row = screen.getByRole('row', {name: /Beta chat/});
        fireEvent.click(within(row).getByRole('button', {name: 'Pin chat', exact: true}));
        expect(within(row).getByRole('button', {name: 'Unpin chat', exact: true})).toBeTruthy();
        expect(screen.getByText('Choose a chat')).toBeTruthy();
        fireEvent.click(within(row).getByRole('button', {name: 'Delete', exact: true}));
        await waitFor(() => expect(screen.queryByRole('row', {name: /Beta chat/})).toBeNull());
        expect(screen.getByLabelText('Action result').textContent).toBe('Deleted Beta chat');
        expect(screen.getByText('Choose a chat')).toBeTruthy();
    });

    it('updates translations when the Provider language changes', () => {
        const view = render(<ChatNavigation />);
        expect(screen.getByRole('combobox', {name: 'Search your chats'})).toBeTruthy();
        view.rerender(<ChatNavigation lang="ru" />);
        expect(screen.queryByRole('combobox', {name: 'Search your chats'})).toBeNull();
        expect(screen.getByRole('combobox', {name: 'Поиск по чатам'})).toBeTruthy();
        expect(screen.getAllByRole('button', {name: 'Удалить', exact: true})).toHaveLength(2);
        view.rerender(<ChatNavigation />);
        expect(screen.getByRole('combobox', {name: 'Search your chats'})).toBeTruthy();
    });

    it('keeps simultaneous Provider language scopes independent', () => {
        render(
            <>
                <ChatNavigation />
                <ChatNavigation lang="ru" />
            </>,
        );
        const english = screen.getByRole('grid', {name: 'Chat history'});
        const russian = screen.getByRole('grid', {name: 'История чатов'});
        expect(within(english).getAllByRole('button', {name: 'Delete', exact: true})).toHaveLength(
            2,
        );
        expect(within(russian).getAllByRole('button', {name: 'Удалить', exact: true})).toHaveLength(
            2,
        );
    });

    it.each([false, true])(
        'bypasses custom filtering before typing when searchable=%s',
        (searchable) => {
            const filterFunction = jest.fn(
                (query: string) => (item: {type: string; name?: string}) =>
                    item.type === 'chat' && item.name === query,
            );
            render(<ChatNavigation searchable={searchable} filterFunction={filterFunction} />);
            expect(screen.getByRole('row', {name: /Alpha chat/})).toBeTruthy();
            expect(screen.getByRole('row', {name: /Beta chat/})).toBeTruthy();
            expect(filterFunction).not.toHaveBeenCalled();
            if (searchable) {
                const search = screen.getByRole('combobox', {name: 'Search your chats'});
                fireEvent.change(search, {target: {value: 'Beta chat'}});
                expect(screen.queryByRole('row', {name: /Alpha chat/})).toBeNull();
                expect(screen.getByRole('row', {name: /Beta chat/})).toBeTruthy();
                filterFunction.mockClear();
                fireEvent.change(search, {target: {value: ''}});
                expect(screen.getByRole('row', {name: /Alpha chat/})).toBeTruthy();
                expect(filterFunction).not.toHaveBeenCalled();
            }
        },
    );

    it.each([false, true])('sets the row action Tab order for searchable=%s', (searchable) => {
        render(<ChatNavigation searchable={searchable} />);
        const row = screen.getByRole('row', {name: /Alpha chat/});
        const remove = within(row).getByRole('button', {name: 'Delete', exact: true});
        const pin = within(row).getByRole('button', {name: 'Pin chat', exact: true});
        expect(remove.tabIndex).toBe(searchable ? 0 : -1);
        expect(pin.tabIndex).toBe(searchable ? 0 : -1);
    });

    it.each([false, true])('opens and dismisses the header menu when mobile=%s', async (mobile) => {
        render(<ChatNavigation mobile={mobile} />);
        fireEvent.click(screen.getByRole('row', {name: /Alpha chat/}));
        expect(screen.getAllByText('Alpha chat')).toHaveLength(2);
        fireEvent.click(screen.getByRole('button', {name: 'Chat actions'}));
        const reset = await screen.findByRole('menuitem', {name: 'Reset selection'});
        const disabled = screen.getByRole('menuitem', {name: 'Unavailable action'});
        expect(disabled.hasAttribute('disabled')).toBe(true);
        fireEvent.click(reset);
        expect(screen.getByText('Choose a chat')).toBeTruthy();
        await waitFor(() =>
            expect(screen.queryByRole('menuitem', {name: 'Reset selection'})).toBeNull(),
        );
    });
});
