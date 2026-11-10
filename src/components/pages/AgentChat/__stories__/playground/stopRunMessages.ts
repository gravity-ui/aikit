import type {TChatMessage} from '../../../../../types';

/** Settle the local simulation before a host stores or switches a conversation. */
export function stopRunMessages(
    messages: TChatMessage[],
    finishedAt: number,
    pausedDuration: number,
): TChatMessage[] {
    return messages.map((message) => {
        if (
            message.role !== 'assistant' ||
            (message.metadata?.activityState !== 'running' &&
                message.metadata?.responseState !== 'running')
        ) {
            return message;
        }
        return {
            ...message,
            metadata: {
                ...message.metadata,
                activityState:
                    message.metadata?.activityState === 'running'
                        ? 'stopped'
                        : message.metadata?.activityState,
                responseState: 'cancelled',
                activityFinishedAt:
                    message.metadata?.activityState === 'running'
                        ? finishedAt
                        : message.metadata?.activityFinishedAt,
                activityPausedAt: undefined,
                activityPausedDuration:
                    message.metadata?.activityState === 'running'
                        ? pausedDuration
                        : message.metadata?.activityPausedDuration,
            },
            content: Array.isArray(message.content)
                ? message.content.map((part) => {
                      if (
                          part.type === 'tool' &&
                          ['loading', 'waitingConfirmation', 'waitingSubmission'].includes(
                              part.data.status ?? '',
                          )
                      ) {
                          return {...part, data: {...part.data, status: 'cancelled' as const}};
                      }
                      if (part.type === 'thinking' && part.data.status === 'thinking') {
                          return {
                              ...part,
                              data: {...part.data, status: 'thought' as const, title: 'Stopped'},
                          };
                      }
                      return part;
                  })
                : message.content,
        };
    });
}
