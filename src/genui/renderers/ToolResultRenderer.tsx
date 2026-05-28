import type {ToolResultMessageContent} from '../../types/messages';
import type {MessageContentComponentProps, MessageRenderer} from '../../utils/messageTypeRegistry';

/**
 * Default `tool-result` renderer. Phase 1 keeps results invisible: rendering
 * happens through the matching `tool-call` part (via `previousResult`), so the
 * result part itself is a no-op.
 *
 * Consumers who need to surface raw results can register their own renderer
 * for `tool-result` after this one.
 */
export function createToolResultRenderer(): MessageRenderer<ToolResultMessageContent> {
    return {
        component: ToolResultPart,
    };
}

function ToolResultPart(
    _props: MessageContentComponentProps<ToolResultMessageContent>,
): JSX.Element | null {
    return null;
}
