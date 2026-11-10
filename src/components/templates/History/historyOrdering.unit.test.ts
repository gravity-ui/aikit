import type {ChatType} from '../../../types';

import {orderHistoryChats} from './historyOrdering';

const today: ChatType = {id: 'today', name: 'Today', createTime: '2026-11-10T10:00:00Z'};
const yesterday: ChatType = {
    id: 'yesterday',
    name: 'Yesterday',
    createTime: '2026-11-09T10:00:00Z',
};
const newToday: ChatType = {id: 'new', name: 'New today', createTime: '2026-11-10T11:00:00Z'};

test('new chats stay in their date group while existing chats retain their order', () => {
    const input = [newToday, today, yesterday];
    const ordered = orderHistoryChats(input, ['today', 'yesterday'], {
        preserveOrder: true,
        groupBy: 'date',
        pinnedChatIds: [],
    });
    expect(ordered.map((chat) => chat.id)).toEqual(['today', 'new', 'yesterday']);
    expect(input).toEqual([newToday, today, yesterday]);
});

test('pin changes and date changes take precedence over the previous row position', () => {
    const changed = {...yesterday, createTime: '2026-11-11T10:00:00Z'};
    const ordered = orderHistoryChats([newToday, today, changed], ['today', 'yesterday'], {
        preserveOrder: true,
        groupBy: 'date',
        pinnedChatIds: ['new'],
    });
    expect(ordered.map((chat) => chat.id)).toEqual(['new', 'yesterday', 'today']);
});

test('explicitly disabling preservation uses the refreshed caller order', () => {
    const ordered = orderHistoryChats([newToday, today, yesterday], ['today', 'yesterday'], {
        preserveOrder: false,
        groupBy: 'date',
        pinnedChatIds: [],
    });
    expect(ordered.map((chat) => chat.id)).toEqual(['new', 'today', 'yesterday']);
});

test('ungrouped history retains existing order and appends new chats', () => {
    const ordered = orderHistoryChats([newToday, today, yesterday], ['yesterday', 'today'], {
        preserveOrder: true,
        groupBy: 'none',
    });
    expect(ordered.map((chat) => chat.id)).toEqual(['yesterday', 'today', 'new']);
});
