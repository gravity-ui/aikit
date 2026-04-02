import {useMemo} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {
    BaseMessageProps,
    TAssistantMessage,
    TMessageContent,
    TMessageContentUnion,
    TMessageMetadata,
} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {
    type MessageRendererRegistry,
    getMessageRenderer,
    mergeMessageRendererRegistries,
} from '../../../utils/messageTypeRegistry';
import {normalizeContent} from '../../../utils/messageUtils';
import {BaseMessage} from '../../molecules/BaseMessage';

import {createDefaultMessageRegistry} from './defaultMessageTypeRegistry';

import './AssistantMessage.scss';

type BaseMessagePick = Pick<
    BaseMessageProps,
    'actions' | 'extraInfo' | 'timestamp' | 'showActionsOnHover' | 'showTimestamp' | 'onActionPopup'
>;
type AssistantMessagePick<TContent extends TMessageContent> = Pick<
    TAssistantMessage<TContent, TMessageMetadata>,
    'id' | 'content' | 'userRating'
>;

export type AssistantMessageProps<TContent extends TMessageContent = never> = BaseMessagePick &
    AssistantMessagePick<TContent> & {
        messageRendererRegistry?: MessageRendererRegistry;
        transformOptions?: OptionsType;
        shouldParseIncompleteMarkdown?: boolean;
        className?: string;
        qa?: string;
    };

const b = block('assistant-message');

export function AssistantMessage<TContent extends TMessageContent = never>({
    content,
    actions,
    extraInfo,
    timestamp,
    id,
    messageRendererRegistry,
    transformOptions,
    shouldParseIncompleteMarkdown,
    showActionsOnHover,
    showTimestamp,
    userRating,
    className,
    qa,
    onActionPopup,
}: AssistantMessageProps<TContent>) {
    const registry = useMemo<MessageRendererRegistry>(() => {
        const defaultRegistry = createDefaultMessageRegistry(
            transformOptions,
            shouldParseIncompleteMarkdown,
        );
        if (messageRendererRegistry) {
            return mergeMessageRendererRegistries(defaultRegistry, messageRendererRegistry);
        }

        return defaultRegistry;
    }, [messageRendererRegistry, transformOptions, shouldParseIncompleteMarkdown]);

    const parts = normalizeContent<TContent>(content);

    if (parts.length === 0) {
        return null;
    }

    const renderPart = (part: TMessageContentUnion<TContent>, partIndex: number) => {
        const PartComponent = getMessageRenderer(registry, part.type);

        if (!PartComponent) {
            return null;
        }

        const key = part.id || `${id || 'message'}-part-${partIndex}`;

        return <PartComponent key={key} part={part} />;
    };

    return (
        <BaseMessage
            role="assistant"
            actions={actions}
            extraInfo={extraInfo}
            showActionsOnHover={showActionsOnHover}
            showTimestamp={showTimestamp}
            timestamp={timestamp}
            userRating={userRating}
            className={b(null, className)}
            qa={qa}
            onActionPopup={onActionPopup}
        >
            <div className={b('content')}>
                {parts.map((part, index) => renderPart(part, index))}
            </div>
        </BaseMessage>
    );
}
