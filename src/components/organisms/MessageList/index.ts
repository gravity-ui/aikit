'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {MessageList as MessageListCore} from './MessageList';

export const MessageList = withDefaultMarkdown(MessageListCore) as typeof MessageListCore;

export {MessageListQa} from './MessageList';
export type {MessageListProps, MessageListActionPopupConfig, MdxProps} from './MessageList';
