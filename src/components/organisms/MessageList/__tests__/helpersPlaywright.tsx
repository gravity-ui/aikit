import {composeStories} from '@storybook/react';

import * as DefaultMessageListStories from '../__stories__/MessageList.stories';

export const MessageListStories = composeStories(DefaultMessageListStories);
