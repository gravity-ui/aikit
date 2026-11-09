import {composeStories} from '@storybook/react';

import {ActivityList} from '..';
import * as stories from '../__stories__/ActivityList.stories';
export const ActivityListStories = composeStories(stories);

export function EmptySummaryExample() {
    return (
        <ActivityList
            steps={[{id: 'one', type: 'reasoning', status: 'thought'}]}
            renderSummary={() => false}
        />
    );
}
