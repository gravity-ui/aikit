'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {ActivityList as ActivityListCore} from './ActivityList';

export const ActivityList = withDefaultMarkdown(ActivityListCore);

export type {ActivityListProps, ActivityStep, ActivityStepStatus, ActivityStepType} from './types';
export {thinkingMessageToStep, groupThinkingMessages} from './utils';
export type {ThinkingGroupEntry, GroupThinkingMessagesOptions} from './utils';
