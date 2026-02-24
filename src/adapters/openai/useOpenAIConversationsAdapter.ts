import {useMemo} from 'react';

import type {ChatType} from '../../types';

import {mapOpenAIConversationsToChats} from './helpers/mapOpenAIConversationsToChats';
import type {OpenAIConversationLike} from './types/openAiTypes';

export type OpenAIConversationsListResponseLike = {
    data?: OpenAIConversationLike[] | null;
};

export type UseOpenAIConversationsAdapterResult = {
    chats: ChatType[];
};

function getConversationsList(
    input: OpenAIConversationLike[] | OpenAIConversationsListResponseLike | null | undefined,
): OpenAIConversationLike[] | null | undefined {
    if (!input || Array.isArray(input)) return input;
    if (typeof input === 'object' && 'data' in input) return input.data ?? null;
    return null;
}

export function useOpenAIConversationsAdapter(
    conversations:
        | OpenAIConversationLike[]
        | OpenAIConversationsListResponseLike
        | null
        | undefined,
): UseOpenAIConversationsAdapterResult {
    const list = getConversationsList(conversations);
    const chats = useMemo(() => mapOpenAIConversationsToChats(list), [list]);
    return {chats};
}
