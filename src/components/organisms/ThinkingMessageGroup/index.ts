'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {ThinkingMessageGroup as ThinkingMessageGroupCore} from './ThinkingMessageGroup';

export const ThinkingMessageGroup = withDefaultMarkdown(ThinkingMessageGroupCore);

export type {
    ThinkingMessageGroupProps,
    ThinkingStep,
    ThinkingStepStatus,
    ThinkingStepType,
} from './types';
export {thinkingMessageToStep, groupThinkingMessages} from './utils';
export type {ThinkingGroupEntry, GroupThinkingMessagesOptions} from './utils';
