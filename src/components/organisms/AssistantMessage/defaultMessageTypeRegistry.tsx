import type {HTMLAttributes} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

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
import {MarkdownRenderer, type MarkdownRendererMdxOptions} from '../../atoms/MarkdownRenderer';
import {ThinkingMessage} from '../ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

export function createDefaultMessageRegistry(
    transformOptions?: OptionsType,
    shouldParseIncompleteMarkdown?: boolean,
    openMarkdownLinksInNewTab?: boolean,
    mdxOptions?: MarkdownRendererMdxOptions,
    mdxContext?: unknown,
    markdownExtraProps?: HTMLAttributes<HTMLDivElement>,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<TextMessageContent>(
        registry,
        'text',
        {
            component: ({part}) => (
                <MarkdownRenderer
                    content={part.data.text}
                    transformOptions={transformOptions}
                    shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
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
