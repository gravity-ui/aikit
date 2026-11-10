import {Magnifier} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {composeStories} from '@storybook/react';

import {ActivityList, type ActivityListProps} from '..';
import {ThinkingMessageGroup} from '../../ThinkingMessageGroup';
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

export function IconModesExample({
    iconMode,
    status = 'thinking',
    activeStepLabel,
    withIcon = true,
    legacy = false,
}: Pick<ActivityListProps, 'iconMode' | 'status' | 'activeStepLabel'> & {
    withIcon?: boolean;
    legacy?: boolean;
}) {
    const Component = legacy ? ThinkingMessageGroup : ActivityList;
    return (
        <Component
            defaultExpanded
            format="markdown"
            iconMode={iconMode}
            activeStepLabel={activeStepLabel}
            status={status}
            stepTypes={
                withIcon
                    ? {
                          search: {
                              icon: (
                                  <span data-qa="operation-icon">
                                      <Icon data={Magnifier} size={16} />
                                  </span>
                              ),
                          },
                      }
                    : undefined
            }
            steps={[
                {
                    id: 'search',
                    type: 'search',
                    title: 'Stored step title',
                    content: '**Stored details**',
                    status,
                },
            ]}
        />
    );
}
