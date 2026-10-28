import {composeStories} from '@storybook/react';

import {ThinkingMessageGroup} from '..';
import {AssistantMessage} from '../../AssistantMessage';
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

export function CustomThinkingRendererExample() {
    return (
        <AssistantMessage
            thinkingMessageView="grouped"
            messageRendererRegistry={{thinking: {component: () => <div>Custom thinking</div>}}}
            content={[{type: 'thinking', data: {content: 'reasoning', status: 'thinking'}}]}
        />
    );
}
