import {composeStories} from '@storybook/react';

import * as InlineCitationStories from '../__stories__/InlineCitation.stories';

export const CitationStories = composeStories(InlineCitationStories);
