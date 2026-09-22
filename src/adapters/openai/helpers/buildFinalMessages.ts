import type {TAssistantMessage, TChatMessage, TMessageContentUnion} from '../../../types';

import {contentPartsToMessageContent} from './contentPartsToMessageContent';

function isMessageContentEmpty(content: TAssistantMessage['content']): boolean {
    if (typeof content === 'string') return content.trim() === '';
    return Array.isArray(content) && content.length === 0;
}

export type BuildFinalMessagesParams = {
    baseMessages: TChatMessage[];
    currentAssistantMessageId: string;
    contentParts: TMessageContentUnion[];
};

export function buildFinalMessages(params: BuildFinalMessagesParams): TChatMessage[] {
    const {baseMessages, currentAssistantMessageId, contentParts} = params;
    const currentContent = contentPartsToMessageContent(contentParts);
    const result: TChatMessage[] = [...baseMessages];
    if (!isMessageContentEmpty(currentContent)) {
        result.push({
            id: currentAssistantMessageId,
            role: 'assistant',
            content: currentContent,
        } as TAssistantMessage);
    }
    return result;
}
