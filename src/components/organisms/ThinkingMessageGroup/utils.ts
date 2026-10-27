import type {ThinkingMessageContentData} from '../../../types/messages';

import type {ThinkingStep} from './types';

/** Convert one legacy message to one step; content arrays remain paragraphs. */
export function thinkingMessageToStep(id: string, data: ThinkingMessageContentData): ThinkingStep {
    return {
        id,
        type: 'reasoning',
        title: data.title,
        content: data.content,
        status: data.status,
        enabledCopy: data.enabledCopy,
        onCopyClick: data.onCopyClick,
    };
}

export type ThinkingGroupEntry<T> =
    | {type: 'item'; item: T; index: number}
    | {
          type: 'thinking-group';
          id: string;
          groupKey: string | undefined;
          items: T[];
          steps: ThinkingStep[];
      };

export interface GroupThinkingMessagesOptions<T> {
    /** Return undefined for text, tools, users, or any other grouping boundary. */
    getStep: (item: T, index: number) => ThinkingStep | undefined;
    /** Explicit response/run scope. Undefined keeps this item in its own group. */
    getGroupKey: (item: T, index: number) => string | undefined;
}

/** Group adjacent thinking items in one explicit scope without changing source data. */
export function groupThinkingMessages<T>(
    items: readonly T[],
    {getStep, getGroupKey}: GroupThinkingMessagesOptions<T>,
): ThinkingGroupEntry<T>[] {
    const result: ThinkingGroupEntry<T>[] = [];
    items.forEach((item, index) => {
        const step = getStep(item, index);
        if (!step) {
            result.push({type: 'item', item, index});
            return;
        }
        const groupKey = getGroupKey(item, index);
        const previous = result[result.length - 1];
        if (
            groupKey !== undefined &&
            previous?.type === 'thinking-group' &&
            previous.groupKey === groupKey
        ) {
            previous.items.push(item);
            previous.steps.push(step);
        } else {
            result.push({
                type: 'thinking-group',
                id: JSON.stringify([groupKey ?? null, step.id]),
                groupKey,
                items: [item],
                steps: [step],
            });
        }
    });
    return result;
}
