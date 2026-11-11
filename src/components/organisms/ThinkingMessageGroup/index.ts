'use client';

import {ActivityList} from '../ActivityList';

/** @deprecated Use ActivityList instead. */
export const ThinkingMessageGroup = ActivityList;

export type {
    ThinkingMessageGroupProps,
    ThinkingStep,
    ThinkingStepStatus,
    ThinkingStepType,
} from './types';
export {thinkingMessageToStep, groupThinkingMessages} from '../ActivityList';
export type {ThinkingGroupEntry, GroupThinkingMessagesOptions} from '../ActivityList';
