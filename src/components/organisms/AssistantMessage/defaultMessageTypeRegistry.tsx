import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {
    CodeMessageContent,
    TextMessageContent,
    ThinkingMessageContent,
    ToolMessageContent,
} from '../../../types/messages';
import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../utils/messageTypeRegistry';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {ThinkingMessage} from '../ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

export function createDefaultMessageRegistry(
    transformOptions?: OptionsType,
    shouldParseIncompleteMarkdown?: boolean,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<TextMessageContent>(registry, 'text', {
        component: ({part}) => (
            <MarkdownRenderer
                content={part.data.text}
                transformOptions={transformOptions}
                shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
            />
        ),
    });

    registerMessageRenderer<ToolMessageContent>(registry, 'tool', {
        component: ({part}) => <ToolMessage {...part.data} />,
    });

    registerMessageRenderer<ThinkingMessageContent>(registry, 'thinking', {
        component: ({part}) => <ThinkingMessage {...part.data} />,
    });

    registerMessageRenderer<CodeMessageContent>(registry, 'code', {
        component: ({part}) => {
            const {language, text} = part.data;
            const content = `\`\`\`${language}\n${text}\n\`\`\``;

            return (
                <MarkdownRenderer
                    content={content}
                    transformOptions={transformOptions}
                    shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                />
            );
        },
    });

    return registry;
}
