import type {IconData} from '@gravity-ui/uikit';

import type {
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageContentUnion,
    TMessageMetadata,
    TUserMessage,
} from '../types';

export function isUserMessage<
    Metadata = TMessageMetadata,
    TCustomMessageContent extends TMessageContent = never,
>(message: TChatMessage<TCustomMessageContent, Metadata>): message is TUserMessage<Metadata> {
    return message.role === 'user';
}

export function isAssistantMessage<
    Metadata = TMessageMetadata,
    TCustomMessageContent extends TMessageContent = never,
>(
    message: TChatMessage<TCustomMessageContent, Metadata>,
): message is TAssistantMessage<TCustomMessageContent, Metadata> {
    return message.role === 'assistant';
}

export function normalizeContent<TCustomMessageContent extends TMessageContent = never>(
    content: TAssistantMessage<TCustomMessageContent, TMessageMetadata>['content'],
): TMessageContentUnion<TCustomMessageContent>[] {
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

export type DefaultMessageAction<TMessage> = {
    type: string;
    onClick: (message: TMessage) => void;
    icon?: IconData;
};

export function resolveMessageActions<
    TMessage extends TChatMessage<TMessageContent, TMessageMetadata>,
>(
    message: TMessage,
    defaultActions?: DefaultMessageAction<TMessage>[],
): Array<{type: string; onClick: () => void; icon?: IconData}> | undefined {
    if (message.actions) {
        return message.actions;
    }

    if (defaultActions) {
        return defaultActions.map((action) => ({
            ...action,
            onClick: () => action.onClick(message),
        }));
    }

    return undefined;
}
