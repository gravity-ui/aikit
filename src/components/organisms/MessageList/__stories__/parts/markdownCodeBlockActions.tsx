import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import type {TChatMessage} from '../../../../../types/messages';

const messages: TChatMessage[] = [
    {
        id: 'user-markdown',
        role: 'user',
        content: '```sql\nSELECT 1;\n```',
        format: 'markdown',
    },
    {
        id: 'assistant-text',
        role: 'assistant',
        content: '```yql\nSELECT 2;\n```',
    },
    {
        id: 'assistant-thinking',
        role: 'assistant',
        content: {
            type: 'thinking',
            data: {content: '```sql\nSELECT 3;\n```', status: 'thought'},
        },
    },
    {
        id: 'assistant-tool',
        role: 'assistant',
        content: {
            type: 'tool',
            data: {toolName: 'example', bodyContent: '```sql\nSELECT 4;\n```'},
        },
    },
];

export const WithMarkdownCodeBlockActions: StoryObj<MessageListProps> = {
    render: (args) => (
        <ContentWrapper width="480px">
            <MessageList
                {...args}
                messages={messages}
                getMarkdownCodeBlockActions={(message) => ({
                    render: () => (
                        <button type="button" data-qa={`markdown-code-action-${message.id}`}>
                            Open {message.id}
                        </button>
                    ),
                })}
            />
        </ContentWrapper>
    ),
};
