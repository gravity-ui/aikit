import {composeStories} from '@storybook/react';

import * as DefaultUserMessageStories from '../__stories__/UserMessage.stories';

export const UserMessageStories = composeStories(DefaultUserMessageStories);
