import type {OptionsType} from '@diplodoc/transform/lib/typings';

import {ChatStatus} from '../../../types';
import type {TMessage} from '../../../types/messages';
import {isAssistantMessage, isUserMessage} from '../../../utils';
import {block} from '../../../utils/cn';
import {type MessageRendererRegistry} from '../../../utils/messageTypeRegistry';
import {AlertProps} from '../../atoms/Alert';
import {Loader} from '../../atoms/Loader';
import {AssistantMessage} from '../AssistantMessage';
import {UserMessage} from '../UserMessage';

import {ErrorAlert} from './ErrorAlert';

import './MessageList.scss';

const b = block('message-list');

export type MessageListProps = {
    messages: TMessage[];
    status?: ChatStatus;
    errorMessage?: AlertProps;
    onRetry?: () => void;
    messageRendererRegistry?: MessageRendererRegistry;
    transformOptions?: OptionsType;
    showActionsOnHover?: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    className?: string;
    qa?: string;
};

export function MessageList({
    messages,
    messageRendererRegistry,
    transformOptions,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    className,
    qa,
    status,
    errorMessage,
    onRetry,
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
                    transformOptions={transformOptions}
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
                    transformOptions={transformOptions}
                    showActionsOnHover={showActionsOnHover}
                    showTimestamp={showTimestamp}
                />
            );
        }

        return null;
    };

    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('messages', className)} data-qa={qa}>
                {messages.map(renderMessage)}
            </div>
            {status === 'submitted' && <Loader />}
            {status === 'error' && <ErrorAlert onRetry={onRetry} errorMessage={errorMessage} />}
        </div>
    );
}
