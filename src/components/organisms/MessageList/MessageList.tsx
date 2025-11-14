import type {TMessage} from '../../../types/messages';
import {isAssistantMessage, isUserMessage} from '../../../utils';
import {block} from '../../../utils/cn';
import {type MessageRendererRegistry} from '../../../utils/messageTypeRegistry';
import {AssistantMessage} from '../AssistantMessage';
import {UserMessage} from '../UserMessage';

import './MessageList.scss';

const b = block('message-list');

export type MessageListProps = {
    messages: TMessage[];
    messageRendererRegistry?: MessageRendererRegistry;
    showActionsOnHover?: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    className?: string;
    qa?: string;
};

export function MessageList({
    messages,
    messageRendererRegistry,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    className,
    qa,
}: MessageListProps) {
    const renderMessage = (message: TMessage, index: number) => {
        if (isUserMessage(message)) {
            return (
                <UserMessage
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={message.actions}
                    timestamp={message.timestamp}
                    format={message.format}
                    avatarUrl={message.avatarUrl}
                    showActionsOnHover={showActionsOnHover}
                    showTimestamp={showTimestamp}
                    showAvatar={showAvatar}
                />
            );
        }

        if (isAssistantMessage(message)) {
            return (
                <AssistantMessage
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={message.actions}
                    timestamp={message.timestamp}
                    id={message.id}
                    messageRendererRegistry={messageRendererRegistry}
                    showActionsOnHover={showActionsOnHover}
                    showTimestamp={showTimestamp}
                />
            );
        }

        return null;
    };

    return (
        <div className={b(null, className)} data-qa={qa}>
            {messages.map(renderMessage)}
        </div>
    );
}
