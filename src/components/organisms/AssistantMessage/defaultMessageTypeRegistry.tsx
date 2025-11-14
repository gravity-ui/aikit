import type {TextMessagePart, ToolMessagePart} from '../../../types/messages';
import {
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../utils/messageTypeRegistry';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {ToolMessage} from '../ToolMessage';

export const defaultMessageRendererRegistry = createMessageRendererRegistry();

registerMessageRenderer<TextMessagePart>(defaultMessageRendererRegistry, 'text', {
    component: ({part}) => <MarkdownRenderer content={part.data.text} />,
});

registerMessageRenderer<ToolMessagePart>(defaultMessageRendererRegistry, 'tool', {
    component: ({part}) => <ToolMessage {...part.data} />,
});
