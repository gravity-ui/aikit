import {StoryFn} from '@storybook/react-webpack5';

import {Showcase} from '../../../../../demo/Showcase';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';

export const defaultDecorators = [
    (StoryComponent: StoryFn) => (
        <Showcase>
            <StoryComponent />
        </Showcase>
    ),
];

export const userMessage: TUserMessage = {
    id: '1',
    role: 'user',
    timestamp: '2024-01-01T00:00:00Z',
    content: 'Hello, how are you?',
};

export const assistantMessage: TAssistantMessage = {
    id: '2',
    role: 'assistant',
    timestamp: '2024-01-01T00:00:01Z',
    content: 'Hi! I am doing well, thank you for asking.',
};
