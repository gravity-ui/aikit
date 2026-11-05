'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {UserMessage as UserMessageCore} from './UserMessage';

export const UserMessage = withDefaultMarkdown(UserMessageCore);

export type {UserMessageProps} from './UserMessage';
