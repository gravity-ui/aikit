'use client';

import {withDefaultMarkdown} from '../../../markdown/withDefaultMarkdown';

import {ChatContainer as ChatContainerCore} from './ChatContainer';

export const ChatContainer = withDefaultMarkdown(ChatContainerCore);

export type {
    ChatContainerProps,
    ChatExportConfig,
    ChatExportResult,
    ChatContainerQa,
    ChatContainerTexts,
    WelcomeConfig,
    MessageListConfig,
    MascotConfig,
} from './types';

export type {
    ChatScreenDefinition,
    ChatScreenContext,
    ChatScreenChangeDetails,
    ChatScreenChangeReason,
    ChatScreenLeaveIntent,
    ChatScreenNavigationProps,
} from './screenTypes';
