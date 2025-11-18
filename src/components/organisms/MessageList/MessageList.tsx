import type {OptionsType} from '@diplodoc/transform/lib/typings';
import type {IconData} from '@gravity-ui/uikit';

import {useSmartScroll} from '../../../hooks';
import {ChatStatus} from '../../../types';
import type {
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    TMessageMetadata,
    TUserMessage,
} from '../../../types/messages';
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

export type DefaultMessageAction<TMessage> = {
    type: string;
    onClick: (message: TMessage) => void;
    icon?: IconData;
};

export type MessageListProps<TContent extends TMessageContent = never> = {
    messages: TChatMessage<TContent, TMessageMetadata>[];
    status?: ChatStatus;
    errorMessage?: AlertProps;
    onRetry?: () => void;
    messageRendererRegistry?: MessageRendererRegistry;
    transformOptions?: OptionsType;
    showActionsOnHover?: boolean;
    showTimestamp?: boolean;
    showAvatar?: boolean;
    userActions?: DefaultMessageAction<TUserMessage<TMessageMetadata>>[];
    assistantActions?: DefaultMessageAction<TAssistantMessage<TContent, TMessageMetadata>>[];
    className?: string;
    qa?: string;
};

export function MessageList<TContent extends TMessageContent = never>({
    messages,
    messageRendererRegistry,
    transformOptions,
    showActionsOnHover,
    showTimestamp,
    showAvatar,
    userActions,
    assistantActions,
    className,
    qa,
    status,
    errorMessage,
    onRetry,
}: MessageListProps<TContent>) {
    const isStreaming = status === 'streaming';
    const messagesCount = messages.length;

    const {containerRef, endRef} = useSmartScroll<HTMLDivElement>(isStreaming, messagesCount);

    const renderMessage = (message: TChatMessage<TContent, TMessageMetadata>, index: number) => {
        if (isUserMessage<TMessageMetadata, TContent>(message)) {
            let actions;
            if (message.actions) {
                actions = message.actions;
            } else if (userActions) {
                actions = userActions.map((action) => ({
                    ...action,
                    onClick: () => action.onClick(message),
                }));
            }

            return (
                <UserMessage
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={actions}
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

        if (isAssistantMessage<TMessageMetadata, TContent>(message)) {
            const showActions = message.status === 'complete';
            let actions;
            if (showActions) {
                if (message.actions) {
                    actions = message.actions;
                } else if (assistantActions) {
                    actions = assistantActions.map((action) => ({
                        ...action,
                        onClick: () => action.onClick(message),
                    }));
                }
            }

            return (
                <AssistantMessage<TContent>
                    key={message.id || `message-${index}`}
                    content={message.content}
                    actions={actions}
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
        <div ref={containerRef} className={b(null, className)} data-qa={qa}>
            <div className={b('messages', className)} data-qa={qa}>
                {messages.map(renderMessage)}
            </div>
            {status === 'submitted' && <Loader />}
            {status === 'error' && <ErrorAlert onRetry={onRetry} errorMessage={errorMessage} />}
            <div ref={endRef} />
        </div>
    );
}
