import {composeStories} from '@storybook/react';

import * as DefaultChatHistoryStories from '../__stories__/ChatHistory.stories';

export const ChatHistoryStories = composeStories(DefaultChatHistoryStories);
