import type {ChatType} from '../../../types';
import type {OpenAIConversationLike} from '../types/openAiTypes';

const DEFAULT_CHAT_NAME = 'Chat';

function getConversationName(metadata: OpenAIConversationLike['metadata']): string {
    const title = metadata?.title ?? metadata?.name;
    return title && title.trim() ? title.trim() : DEFAULT_CHAT_NAME;
}

export function mapOpenAIConversationsToChats(
    conversations: OpenAIConversationLike[] | null | undefined,
): ChatType[] {
    if (!Array.isArray(conversations)) {
        return [];
    }
    return conversations.map((conv): ChatType => {
        const createTime = conv.created_at ? new Date(conv.created_at * 1000).toISOString() : null;
        return {
            id: conv.id,
            name: getConversationName(conv.metadata),
            createTime,
            lastMessage: conv.metadata?.last_message || undefined,
            metadata: (conv.metadata as Record<string, unknown>) ?? undefined,
        };
    });
}
