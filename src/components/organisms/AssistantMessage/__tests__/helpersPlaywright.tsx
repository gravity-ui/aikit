import {useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import {composeStories} from '@storybook/react';

import {AssistantMessage} from '..';
import type {ThinkingMessageContent} from '../../../../types/messages';
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

export function StreamingGroupedThinkingExample() {
    const [parts, setParts] = useState<ThinkingMessageContent[]>([
        {
            id: 'analyze',
            type: 'thinking',
            data: {title: 'Analyzing the request', content: 'Initial details', status: 'thinking'},
        },
    ]);
    const [completed, setCompleted] = useState(false);

    return (
        <div>
            <Button
                onClick={() =>
                    setParts((current) =>
                        current.map((part) => ({
                            ...part,
                            data: {
                                ...part.data,
                                content: `${part.data.content}. Received another text fragment.`,
                            },
                        })),
                    )
                }
            >
                Add text fragment
            </Button>
            <Button
                onClick={() =>
                    setParts((current) => [
                        ...current.map((part) => ({
                            ...part,
                            data: {...part.data, status: 'thought' as const},
                        })),
                        {
                            id: 'search',
                            type: 'thinking',
                            data: {
                                title: 'Searching the documentation',
                                content: 'Checking relevant sources',
                                status: 'thinking',
                            },
                        },
                    ])
                }
            >
                Add next step
            </Button>
            <Button
                onClick={() => {
                    setParts((current) =>
                        current.map((part) => ({...part, data: {...part.data, status: 'thought'}})),
                    );
                    setCompleted(true);
                }}
            >
                Complete response
            </Button>
            <AssistantMessageStories.WithGroupedThinking
                content={
                    completed
                        ? [
                              ...parts,
                              {
                                  id: 'answer',
                                  type: 'text',
                                  data: {text: 'The final answer is ready.'},
                              },
                          ]
                        : parts
                }
            />
        </div>
    );
}
