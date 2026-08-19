import {useState} from 'react';

import {composeStories} from '@storybook/react';

import type {MarkdownCodeBlockActionsConfig, MarkdownRendererMdxOptions} from '../MarkdownRenderer';
import {MarkdownRenderer} from '../MarkdownRenderer';
import * as DefaultMarkdownRendererStories from '../__stories__/MarkdownRenderer.stories';

export const MarkdownRendererStories = composeStories(DefaultMarkdownRendererStories);

const firstStreamingContent = '```SQL\nSELECT 1;\n```';
const secondStreamingContent = `${firstStreamingContent}\n\n~~~yQl\nSELECT 2;\n~~~`;

const streamingCodeBlockActions: MarkdownCodeBlockActionsConfig = {
    visibility: 'always',
    render: ({code, index, language}) => (
        <span data-qa={`streaming-code-action-${index}`}>{`${language}: ${code}`}</span>
    ),
};

const mdxCodeBlockActions: MarkdownCodeBlockActionsConfig = {
    visibility: 'always',
    render: ({code, language}) => <span data-qa="mdx-code-action">{`${language}: ${code}`}</span>,
};

const mdxOptions: MarkdownRendererMdxOptions = {
    components: {
        Badge: () => <span data-qa="mdx-badge">Badge</span>,
    },
    tagNames: ['Badge'],
};

export function StreamingCodeBlockActionsHarness() {
    const [content, setContent] = useState(firstStreamingContent);

    return (
        <div>
            <button type="button" onClick={() => setContent(secondStreamingContent)}>
                Append code block
            </button>
            <MarkdownRenderer content={content} codeBlockActions={streamingCodeBlockActions} />
        </div>
    );
}

export function MdxCodeBlockActionsHarness() {
    return (
        <MarkdownRenderer
            content={'<Badge />\n\n```TypeScript\nconst answer = 42;\n```'}
            mdxOptions={mdxOptions}
            codeBlockActions={mdxCodeBlockActions}
        />
    );
}
