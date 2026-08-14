import {useState} from 'react';

import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import type {TChatMessage, TextMessageContent} from '../../../../../types/messages';
import {
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../../utils/messageTypeRegistry';
import type {MarkdownCodeBlockActionsConfig} from '../../../../atoms/MarkdownRenderer';

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

const virtualizedMessages: TChatMessage[] = [
    {
        id: 'virtualized-assistant',
        role: 'assistant',
        content: '```sql\nSELECT 5;\n```',
    },
];

const customRendererMessages: TChatMessage[] = [
    {
        id: 'custom-renderer-assistant',
        role: 'assistant',
        content: '```sql\nSELECT 6;\n```',
    },
];

function MarkdownCodeAction({code}: {code: string}) {
    const [opened, setOpened] = useState(false);

    return (
        <button type="button" data-qa="markdown-code-action" onClick={() => setOpened(true)}>
            {opened ? `Opened ${code}` : `Open ${code}`}
        </button>
    );
}

const codeBlockActions: MarkdownCodeBlockActionsConfig = {
    render: ({code}) => <MarkdownCodeAction code={code} />,
    visibility: 'always',
};

const getMarkdownCodeBlockActions = () => codeBlockActions;

const customTextRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<TextMessageContent>(customTextRendererRegistry, 'text', {
    component: () => <div data-qa="custom-text-renderer">Custom text renderer</div>,
});

export const WithMarkdownCodeBlockActions: StoryObj<MessageListProps> = {
    render: (args) => (
        <div style={{display: 'grid', gap: '24px'}}>
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    qa="markdown-actions-default"
                    messages={messages}
                    getMarkdownCodeBlockActions={getMarkdownCodeBlockActions}
                />
            </ContentWrapper>
            <ContentWrapper width="480px" height="240px" display="flex">
                <MessageList
                    {...args}
                    qa="markdown-actions-virtualized"
                    messages={virtualizedMessages}
                    getMarkdownCodeBlockActions={getMarkdownCodeBlockActions}
                    virtualized
                />
            </ContentWrapper>
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    qa="markdown-actions-custom-renderer"
                    messages={customRendererMessages}
                    messageRendererRegistry={customTextRendererRegistry}
                    getMarkdownCodeBlockActions={getMarkdownCodeBlockActions}
                />
            </ContentWrapper>
        </div>
    ),
};
