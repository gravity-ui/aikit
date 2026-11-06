'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {AssistantMessage as AssistantMessageCore} from './AssistantMessage';

export const AssistantMessage = withDefaultMarkdown(
    AssistantMessageCore,
) as typeof AssistantMessageCore;

export type {AssistantMessageProps} from './AssistantMessage';
