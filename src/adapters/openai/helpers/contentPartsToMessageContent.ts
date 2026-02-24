import type {TAssistantMessage, TMessageContentUnion} from '../../../types';

export function contentPartsToMessageContent(
    parts: TMessageContentUnion[],
): TAssistantMessage['content'] {
    if (parts.length === 0) return '';
    if (parts.length === 1 && parts[0].type === 'text') return parts[0].data.text;
    return [...parts];
}
