import type {HTMLAttributes} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import {MarkdownContent} from '../../../markdown/MarkdownProvider';
import {type MarkdownRendererMdxOptions, type MermaidOptions} from '../../../markdown/types';
import type {
    TextMessageContent,
    ThinkingMessageContent,
    ToolMessageContent,
} from '../../../types/messages';
import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../utils/messageTypeRegistry';
import {ThinkingMessage} from '../ThinkingMessage/ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

export function createDefaultMessageRegistry(
    transformOptions?: OptionsType,
    shouldParseIncompleteMarkdown?: boolean,
    openMarkdownLinksInNewTab?: boolean,
    mdxOptions?: MarkdownRendererMdxOptions,
    mdxContext?: Record<string, unknown>,
    markdownExtraProps?: HTMLAttributes<HTMLDivElement>,
    mermaidOptions?: MermaidOptions,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<TextMessageContent>(
        registry,
        'text',
        {
            component: ({part}) => (
                <MarkdownContent
                    content={part.data.text}
                    transformOptions={transformOptions}
                    shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                    mermaidOptions={mermaidOptions}
                    openLinksInNewTab={openMarkdownLinksInNewTab}
                    mdxOptions={mdxOptions}
                    mdxContext={mdxContext}
                    extraProps={markdownExtraProps}
                />
            ),
        },
        {
            isDefault: true,
        },
    );

    registerMessageRenderer<ToolMessageContent>(
        registry,
        'tool',
        {
            component: ({part}) => <ToolMessage {...part.data} />,
        },
        {
            isDefault: true,
        },
    );

    registerMessageRenderer<ThinkingMessageContent>(
        registry,
        'thinking',
        {
            component: ({part}) => (
                <ThinkingMessage
                    {...part.data}
                    mermaidOptions={mermaidOptions}
                    openMarkdownLinksInNewTab={openMarkdownLinksInNewTab}
                    mdxOptions={mdxOptions}
                    mdxContext={mdxContext}
                    markdownExtraProps={markdownExtraProps}
                />
            ),
        },
        {
            isDefault: true,
        },
    );

    return registry;
}
