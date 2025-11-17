import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {TextMessagePart, ToolMessagePart} from '../../../types/messages';
import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../utils/messageTypeRegistry';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {ToolMessage} from '../ToolMessage';

export function createDefaultMessageRegistry(
    transformOptions?: OptionsType,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<TextMessagePart>(registry, 'text', {
        component: ({part}) => (
            <MarkdownRenderer content={part.data.text} transformOptions={transformOptions} />
        ),
    });

    registerMessageRenderer<ToolMessagePart>(registry, 'tool', {
        component: ({part}) => <ToolMessage {...part.data} />,
    });

    return registry;
}
