import {composeStories} from '@storybook/react';

import {AssistantMessage} from '..';
import * as DefaultAssistantMessageStories from '../__stories__/AssistantMessage.stories';

export const AssistantMessageStories = composeStories(DefaultAssistantMessageStories);

export function CustomThinkingRendererExample() {
    return (
        <AssistantMessage
            thinkingMessageView="grouped"
            messageRendererRegistry={{thinking: {component: () => <div>Custom thinking</div>}}}
            content={[{type: 'thinking', data: {content: 'reasoning', status: 'thinking'}}]}
        />
    );
}
