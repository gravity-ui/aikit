import {renderHook} from '@testing-library/react';

import {mapOpenAIConversationsToChats} from '../helpers/mapOpenAIConversationsToChats';
import type {OpenAIConversationLike} from '../types/openAiTypes';
import {useOpenAIConversationsAdapter} from '../useOpenAIConversationsAdapter';

describe('mapOpenAIConversationsToChats', () => {
    it('returns empty array for null or undefined', () => {
        expect(mapOpenAIConversationsToChats(null)).toEqual([]);
        expect(mapOpenAIConversationsToChats(undefined)).toEqual([]);
    });

    it('returns empty array for non-array', () => {
        expect(mapOpenAIConversationsToChats('x' as unknown as OpenAIConversationLike[])).toEqual(
            [],
        );
    });

    it('maps id and created_at to id and createTime ISO string', () => {
        const conv: OpenAIConversationLike = {
            id: 'conv-1',
            created_at: 1700000000,
        };
        const result = mapOpenAIConversationsToChats([conv]);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('conv-1');
        expect(result[0].createTime).toBe('2023-11-14T22:13:20.000Z');
        expect(result[0].name).toBe('Chat');
    });

    it('uses metadata.title as name', () => {
        const conv: OpenAIConversationLike = {
            id: 'c1',
            created_at: 1700000000,
            metadata: {title: 'My chat'},
        };
        const result = mapOpenAIConversationsToChats([conv]);
        expect(result[0].name).toBe('My chat');
    });

    it('uses metadata.name as name when title is absent', () => {
        const conv: OpenAIConversationLike = {
            id: 'c1',
            created_at: 1700000000,
            metadata: {name: 'Fallback name'},
        };
        const result = mapOpenAIConversationsToChats([conv]);
        expect(result[0].name).toBe('Fallback name');
    });

    it('uses metadata.last_message as lastMessage', () => {
        const conv: OpenAIConversationLike = {
            id: 'c1',
            created_at: 1700000000,
            metadata: {last_message: 'Last reply'},
        };
        const result = mapOpenAIConversationsToChats([conv]);
        expect(result[0].lastMessage).toBe('Last reply');
    });

    it('passes metadata to chat', () => {
        const conv: OpenAIConversationLike = {
            id: 'c1',
            created_at: 1700000000,
            metadata: {title: 'T', foo: 'bar'},
        };
        const result = mapOpenAIConversationsToChats([conv]);
        expect(result[0].metadata).toEqual({title: 'T', foo: 'bar'});
    });

    it('maps multiple conversations', () => {
        const list: OpenAIConversationLike[] = [
            {id: 'a', created_at: 1700000000, metadata: {title: 'First'}},
            {id: 'b', created_at: 1700000100},
        ];
        const result = mapOpenAIConversationsToChats(list);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('a');
        expect(result[0].name).toBe('First');
        expect(result[1].id).toBe('b');
        expect(result[1].name).toBe('Chat');
    });
});

describe('useOpenAIConversationsAdapter', () => {
    it('returns chats from conversations array', () => {
        const conversations: OpenAIConversationLike[] = [
            {id: '1', created_at: 1700000000, metadata: {title: 'Sync chat'}},
        ];
        const {result} = renderHook(() => useOpenAIConversationsAdapter(conversations));
        expect(result.current.chats).toHaveLength(1);
        expect(result.current.chats[0].id).toBe('1');
        expect(result.current.chats[0].name).toBe('Sync chat');
    });

    it('returns empty chats when conversations is null or undefined', () => {
        const {result: resultNull} = renderHook(() => useOpenAIConversationsAdapter(null));
        expect(resultNull.current.chats).toEqual([]);

        const {result: resultUndef} = renderHook(() => useOpenAIConversationsAdapter(undefined));
        expect(resultUndef.current.chats).toEqual([]);
    });

    it('returns empty chats when conversations is empty array', () => {
        const {result} = renderHook(() => useOpenAIConversationsAdapter([]));
        expect(result.current.chats).toEqual([]);
    });

    it('accepts response-like object with data array', () => {
        const response = {
            data: [
                {id: 'r1', created_at: 1700000000, metadata: {title: 'From response'}},
            ] as OpenAIConversationLike[],
        };
        const {result} = renderHook(() => useOpenAIConversationsAdapter(response));
        expect(result.current.chats).toHaveLength(1);
        expect(result.current.chats[0].id).toBe('r1');
        expect(result.current.chats[0].name).toBe('From response');
    });

    it('returns empty chats when response has empty or missing data', () => {
        const {result: emptyData} = renderHook(() => useOpenAIConversationsAdapter({data: []}));
        expect(emptyData.current.chats).toEqual([]);

        const {result: nullData} = renderHook(() => useOpenAIConversationsAdapter({data: null}));
        expect(nullData.current.chats).toEqual([]);

        const {result: noData} = renderHook(() => useOpenAIConversationsAdapter({}));
        expect(noData.current.chats).toEqual([]);
    });
});
