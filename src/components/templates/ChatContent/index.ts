'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {ChatContent as ChatContentCore} from './ChatContent';

export const ChatContent = withDefaultMarkdown(ChatContentCore);

export type {ChatContentProps, ChatContentView} from './ChatContent';
