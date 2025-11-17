import {useMemo} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {
    BaseMessageProps,
    TAssistantMessage,
    TMessageMetadata,
    TMessagePart,
    TMessagePartUnion,
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
    'actions' | 'timestamp' | 'showActionsOnHover' | 'showTimestamp'
>;
type AssistantMessagePick<TPart extends TMessagePart> = Pick<
    TAssistantMessage<TMessageMetadata, TPart>,
    'id' | 'content'
>;

export type AssistantMessageProps<TPart extends TMessagePart = never> = BaseMessagePick &
    AssistantMessagePick<TPart> & {
        messageRendererRegistry?: MessageRendererRegistry;
        transformOptions?: OptionsType;
        className?: string;
        qa?: string;
    };

const b = block('assistant-message');

export function AssistantMessage<TPart extends TMessagePart = never>({
    content,
    actions,
    timestamp,
    id,
    messageRendererRegistry,
    transformOptions,
    showActionsOnHover,
    showTimestamp,
    className,
    qa,
}: AssistantMessageProps<TPart>) {
    const registry = useMemo<MessageRendererRegistry>(() => {
        const defaultRegistry = createDefaultMessageRegistry(transformOptions);
        if (messageRendererRegistry) {
            return mergeMessageRendererRegistries(defaultRegistry, messageRendererRegistry);
        }

        return defaultRegistry;
    }, [messageRendererRegistry, transformOptions]);

    const parts = normalizeContent<TPart>(content);

    if (parts.length === 0) {
        return null;
    }

    const renderPart = (part: TMessagePartUnion<TPart>, partIndex: number) => {
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
            showActionsOnHover={showActionsOnHover}
            showTimestamp={showTimestamp}
            timestamp={timestamp}
            className={b(null, className)}
            qa={qa}
        >
            <div className={b('content')}>
                {parts.map((part, index) => renderPart(part, index))}
            </div>
        </BaseMessage>
    );
}
