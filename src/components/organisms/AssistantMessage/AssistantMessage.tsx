import {useMemo} from 'react';

import type {AssistantMessage as AssistantMessageType, MessagePart} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {
    type MessageRendererRegistry,
    getMessageRenderer,
    mergeMessageRendererRegistries,
} from '../../../utils/messageTypeRegistry';
import {normalizeContent} from '../../../utils/messageUtils';
import type {BaseMessageProps} from '../../molecules/BaseMessage';
import {BaseMessage} from '../../molecules/BaseMessage';

import {defaultMessageRendererRegistry} from './defaultMessageTypeRegistry';

import './AssistantMessage.scss';

export type AssistantMessageProps = Pick<
    BaseMessageProps,
    'actions' | 'timestamp' | 'showActionsOnHover' | 'showTimestamp'
> &
    Pick<AssistantMessageType, 'id' | 'content'> & {
        messageRendererRegistry?: MessageRendererRegistry;
        className?: string;
        qa?: string;
    };

const b = block('assistant-message');

export function AssistantMessage({
    content,
    actions,
    timestamp,
    id,
    messageRendererRegistry,
    showActionsOnHover,
    showTimestamp,
    className,
    qa,
}: AssistantMessageProps) {
    const registry = useMemo(() => {
        return messageRendererRegistry
            ? mergeMessageRendererRegistries(
                  defaultMessageRendererRegistry,
                  messageRendererRegistry,
              )
            : defaultMessageRendererRegistry;
    }, [messageRendererRegistry]);

    const parts = normalizeContent(content);

    if (parts.length === 0) {
        return null;
    }

    const renderPart = (part: MessagePart, partIndex: number) => {
        const PartComponent = getMessageRenderer(registry, part.type);

        if (!PartComponent) {
            return null;
        }

        const key = part.id || `${id || 'message'}-part-${partIndex}`;

        return <PartComponent key={key} part={part} />;
    };

    return (
        <BaseMessage
            variant="assistant"
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
