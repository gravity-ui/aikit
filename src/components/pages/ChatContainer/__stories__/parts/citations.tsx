import {type ComponentProps, useState} from 'react';

import {withPortal} from '@diplodoc/mdx-extension';

import {ChatContainer} from '../..';
import type {TChatMessage} from '../../../../../types';
import {InlineCitation, type InlineCitationSource} from '../../../../atoms/InlineCitation';
import {useMdxContext} from '../../../../atoms/MarkdownRenderer';

import {type Story, defaultDecorators} from './shared';

interface CitationContext {
    citations: Record<string, InlineCitationSource[]>;
}

function Citation({id}: {id?: string}) {
    const context = useMdxContext<CitationContext>();
    return <InlineCitation sources={id ? (context?.citations[id] ?? []) : []} />;
}

const mdxOptions = {components: {Citation: withPortal(Citation)}};

const citationsByMessage: Record<string, CitationContext['citations']> = {
    'assistant-components': {
        documentation: [
            {
                id: 'aikit',
                title: 'AIKit: components for AI assistant chats',
                url: 'https://github.com/gravity-ui/aikit',
                description: 'Reusable chat components built with Gravity UI.',
                quote: 'Gravity UI base kit for building AI assistant chats.',
            },
            {
                id: 'gravity',
                title: 'Gravity UI design system',
                url: 'https://gravity-ui.com',
                description: 'The design system used by AIKit components.',
            },
        ],
    },
    'assistant-markdown': {
        documentation: [
            {
                id: 'diplodoc',
                title: 'Diplodoc MDX extension',
                url: 'https://github.com/diplodoc-platform/mdx-extension',
                description: 'Embed interactive React components in Markdown content.',
                quote: 'Portal support for advanced component mounting with withPortal.',
            },
        ],
    },
};

const initialMessages: TChatMessage[] = [
    {id: 'user-components', role: 'user', content: 'What can I use to build an AI assistant chat?'},
    {
        id: 'assistant-components',
        role: 'assistant',
        content:
            'Use **AIKit** for message rendering, prompt input, and chat history. It builds on the Gravity UI design system <Citation id="documentation" />.\n\nOpen the citation to browse both sources and read the excerpt.',
    },
    {id: 'user-markdown', role: 'user', content: 'Can I embed interactive citations in Markdown?'},
    {
        id: 'assistant-markdown',
        role: 'assistant',
        content:
            'Yes. Register a citation component through **mdxProps** and resolve sources using **getMdxContext(message)** <Citation id="documentation" />.\n\nThis citation uses the same marker as the previous answer, but resolves a different source from its own message.',
    },
];

function ChatWithInlineCitations(args: ComponentProps<typeof ChatContainer>) {
    const [messages, setMessages] = useState(initialMessages);
    return (
        <ChatContainer
            {...args}
            messages={messages}
            mdxProps={{
                mdxOptions,
                getMdxContext: (message) => {
                    const sourceMessageId = message.metadata?.citationMessageId;
                    return {
                        citations:
                            citationsByMessage[
                                typeof sourceMessageId === 'string'
                                    ? sourceMessageId
                                    : (message.id ?? '')
                            ] ?? {},
                    };
                },
            }}
            onSendMessage={async ({content}) => {
                setMessages((current) => [
                    ...current,
                    {id: `user-${current.length}`, role: 'user', content},
                    {
                        ...initialMessages[1],
                        id: `assistant-${current.length}`,
                        metadata: {citationMessageId: 'assistant-components'},
                    },
                ]);
            }}
        />
    );
}

export const WithInlineCitations: Story = {
    args: {showHistory: false, showNewChat: false},
    render: (args) => <ChatWithInlineCitations {...args} />,
    decorators: defaultDecorators,
};
