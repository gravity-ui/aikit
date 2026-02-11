import type {TAssistantMessage, TChatMessage, TMessageContentUnion} from '../../../types';

import {contentPartsToMessageContent} from './contentPartsToMessageContent';

function isMessageContentEmpty(content: TAssistantMessage['content']): boolean {
    if (typeof content === 'string') return content.trim() === '';
    return Array.isArray(content) && content.length === 0;
}

export type BuildFinalMessagesParams = {
    baseMessages: TChatMessage[];
    completedAssistantMessages: {id: string; content: TAssistantMessage['content']}[];
    currentAssistantMessageId: string;
    contentParts: TMessageContentUnion[];
};

export function buildFinalMessages(params: BuildFinalMessagesParams): TChatMessage[] {
    const {baseMessages, completedAssistantMessages, currentAssistantMessageId, contentParts} =
        params;
    const currentContent = contentPartsToMessageContent(contentParts);
    const completedWithContent = completedAssistantMessages.filter(
        (m) => !isMessageContentEmpty(m.content),
    );
    const result: TChatMessage[] = [...baseMessages];
    for (const m of completedWithContent) {
        result.push({
            id: m.id,
            role: 'assistant' as const,
            content: m.content,
        } as TAssistantMessage);
    }
    if (!isMessageContentEmpty(currentContent)) {
        result.push({
            id: currentAssistantMessageId,
            role: 'assistant',
            content: currentContent,
        } as TAssistantMessage);
    }
    return result;
}
