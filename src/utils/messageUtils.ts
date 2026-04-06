import type {
    ActionPopupConfig,
    BaseMessageAction,
    BaseMessageActionConfig,
    DefaultMessageAction,
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageContentUnion,
    TMessageMetadata,
    TUserMessage,
} from '../types';

import {splitMarkdown} from './splitMarkdown';

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
        const markdownParts = splitMarkdown(content);

        const contentParts = markdownParts.map((mb) => {
            if (mb.type === 'code') {
                const {type, content: markdownContent, language} = mb;

                const lines = markdownContent.split('\n');
                const codeContent = lines.slice(1, -1).join('\n');

                return {
                    type,
                    data: {text: codeContent, language},
                };
            }

            return {
                type: mb.type,
                data: {text: mb.content},
            };
        });

        return contentParts;
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

// Re-export ActionPopup types for convenience
export type {ActionPopupContext, ActionPopupConfig} from '../types';

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
                popup: action.popup as ActionPopupConfig<unknown>,
            }),
        );
    }

    return undefined;
}
