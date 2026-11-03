import {useState} from 'react';

import {Provider} from '@gravity-ui/uikit';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';

import {Header} from '../../src/components/organisms/Header';
import {HistoryList} from '../../src/components/templates/History/HistoryList';
import type {ChatType} from '../../src/types';

jest.mock('uuid', () => ({v4: () => 'navigation-test'}));

const chats: ChatType[] = [
    {id: 'alpha', name: 'Alpha chat', createTime: '2026-11-01'},
    {id: 'beta', name: 'Beta chat', createTime: '2026-10-31'},
];

function ChatNavigation({mobile = false}: {mobile?: boolean}) {
    const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
    const [pinned, setPinned] = useState<string[]>([]);
    const [notice, setNotice] = useState('');
    return (
        <Provider lang="en" mobile={mobile}>
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
