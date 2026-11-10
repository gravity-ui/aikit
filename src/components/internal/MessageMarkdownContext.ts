import {createContext} from 'react';

import type {ThinkingMessageProps} from './ThinkingMessage/ThinkingMessageView';

export type MessageMarkdownOptions = Pick<
    ThinkingMessageProps,
    | 'transformOptions'
    | 'mermaidOptions'
    | 'openMarkdownLinksInNewTab'
    | 'mdxOptions'
    | 'mdxContext'
    | 'markdownExtraProps'
>;

export const MessageMarkdownContext = createContext<MessageMarkdownOptions | undefined>(undefined);
