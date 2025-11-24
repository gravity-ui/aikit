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
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {ThinkingMessage} from '../ThinkingMessage';
import {ToolMessage} from '../ToolMessage';

export function createDefaultMessageRegistry(
    transformOptions?: OptionsType,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<TextMessageContent>(registry, 'text', {
        component: ({part}) => (
            <MarkdownRenderer content={part.data.text} transformOptions={transformOptions} />
        ),
    });

    registerMessageRenderer<ToolMessageContent>(registry, 'tool', {
        component: ({part}) => <ToolMessage {...part.data} />,
    });

    registerMessageRenderer<ThinkingMessageContent>(registry, 'thinking', {
        component: ({part}) => <ThinkingMessage {...part.data} />,
    });

    return registry;
}
