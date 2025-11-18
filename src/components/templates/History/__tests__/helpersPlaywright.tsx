import {composeStories} from '@storybook/react';

import * as DefaultHistoryStories from '../__stories__/History.stories';

export const HistoryStories = composeStories(DefaultHistoryStories);
