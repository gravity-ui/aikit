'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {AIStudioChat as AIStudioChatCore} from './AIStudioChat';

export const AIStudioChat = withDefaultMarkdown(AIStudioChatCore);

export type {AIStudioChatProps} from './types';
