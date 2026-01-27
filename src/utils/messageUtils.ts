import type {ButtonView} from '@gravity-ui/uikit';

import type {
    BaseMessageAction,
    BaseMessageActionConfig,
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

/**
 * Check if message content contains ONLY thinking content (no other content types).
 * @param content - Message content to check
 * @returns true if content contains only thinking parts and nothing else
 */
export function hasOnlyThinkingContent<TCustomMessageContent extends TMessageContent = never>(
    content: TAssistantMessage<TCustomMessageContent, TMessageMetadata>['content'],
): boolean {
    const parts = normalizeContent(content);
    if (parts.length === 0) {
        return false;
    }
    return parts.every((part) => part.type === 'thinking');
}

export type DefaultMessageAction<TMessage> = {
    type?: string;
    onClick: (message: TMessage) => void;
    icon?: React.ReactNode;
    label?: string;
    view?: ButtonView;
};

export function resolveMessageActions<
    TMessage extends TChatMessage<TMessageContent, TMessageMetadata>,
>(
    message: TMessage,
    defaultActions?: DefaultMessageAction<TMessage>[],
): BaseMessageAction[] | undefined {
    if (message.actions) {
        return message.actions;
    }

    if (defaultActions) {
        return defaultActions.map(
            (action): BaseMessageActionConfig => ({
                actionType: action.type,
                icon: action.icon,
                label: action.label,
                view: action.view,
                onClick: () => action.onClick(message),
            }),
        );
    }

    return undefined;
}
