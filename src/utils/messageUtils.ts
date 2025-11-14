import type {
    TAssistantMessage,
    TMessage,
    TMessageMetadata,
    TMessagePart,
    TUserMessage,
} from '../types';

export function isUserMessage<Metadata = TMessageMetadata>(
    message: TMessage<Metadata>,
): message is TUserMessage<Metadata> {
    return message.role === 'user';
}

export function isAssistantMessage<Metadata = TMessageMetadata>(
    message: TMessage<Metadata>,
): message is TAssistantMessage<Metadata> {
    return message.role === 'assistant';
}

export function normalizeContent(content: TAssistantMessage['content']): TMessagePart[] {
    if (!content) {
        return [];
    }

    if (typeof content === 'string') {
        return [
            {
                type: 'text',
                data: {
                    text: content,
                },
            },
        ];
    }

    if (Array.isArray(content)) {
        return content;
    }

    return [content];
}
