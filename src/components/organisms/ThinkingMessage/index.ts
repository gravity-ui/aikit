'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {ThinkingMessage as ThinkingMessageCore} from './ThinkingMessage';

export const ThinkingMessage = withDefaultMarkdown(ThinkingMessageCore);

export type {ThinkingMessageProps} from './ThinkingMessage';
