import {composeStories} from '@storybook/react';

import {ThinkingMessageGroup} from '..';
import * as stories from '../__stories__/ThinkingMessageGroup.stories';
export const ThinkingMessageGroupStories = composeStories(stories);

export function EmptySummaryExample() {
    return (
        <ThinkingMessageGroup
            steps={[{id: 'one', type: 'reasoning', status: 'thought'}]}
            renderSummary={() => false}
        />
    );
}
