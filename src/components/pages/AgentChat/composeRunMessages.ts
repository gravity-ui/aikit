import type {TChatMessage, TMessageContent} from '../../../types';
import type {RunActivityProps} from '../../organisms/RunActivity';

/** @experimental May change or be removed in minor releases. */
export type AgentRunContent = TMessageContent<'agent-run', RunActivityProps>;
/** @experimental May change or be removed in minor releases. */
export type AgentChatRun = {messageId: string; activity: RunActivityProps};

/** The adapter supplies final content separately; no part is classified heuristically. */
export function composeRunMessages(
    messages: TChatMessage<AgentRunContent>[],
    runs: readonly AgentChatRun[],
): TChatMessage<AgentRunContent>[] {
    return messages.map((message) => {
        const run = runs.find((item) => item.messageId === message.id);
        if (!run || message.role !== 'assistant') {
            return message;
        }
        let finalContent;
        if (typeof message.content === 'string') {
            finalContent = [
                {id: `${message.id}-answer`, type: 'text' as const, data: {text: message.content}},
            ];
        } else {
            finalContent = Array.isArray(message.content) ? message.content : [message.content];
        }
        return {
            ...message,
            content: [
                {id: run.activity.id, type: 'agent-run', data: run.activity},
                ...finalContent,
            ],
        };
    });
}
