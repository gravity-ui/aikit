import type {
    TAssistantMessage,
    TMessage,
    TMessageMetadata,
    TMessagePart,
    TMessagePartUnion,
    TUserMessage,
} from '../types';

export function isUserMessage<
    Metadata = TMessageMetadata,
    TAdditionalPart extends TMessagePart = never,
>(message: TMessage<TAdditionalPart, Metadata>): message is TUserMessage<Metadata> {
    return message.role === 'user';
}

export function isAssistantMessage<
    Metadata = TMessageMetadata,
    TAdditionalPart extends TMessagePart = never,
>(
    message: TMessage<TAdditionalPart, Metadata>,
): message is TAssistantMessage<Metadata, TAdditionalPart> {
    return message.role === 'assistant';
}

export function normalizeContent<TAdditionalPart extends TMessagePart = never>(
    content: TAssistantMessage<TMessageMetadata, TAdditionalPart>['content'],
): TMessagePartUnion<TAdditionalPart>[] {
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
