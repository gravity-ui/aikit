import type {ToolCallMessageContent} from '../../types/messages';
import {block} from '../../utils/cn';

import './UnknownToolFallback.scss';

const b = block('genui-unknown-tool');

export type UnknownToolFallbackProps = {
    part: ToolCallMessageContent;
};

/**
 * Renders when a `tool-call` arrives for a tool that is not in the registry.
 *
 * Defensive default: the model has emitted *something* — we show the tool name
 * and (in dev) a small dump of args so the missing registration is obvious.
 */
export function UnknownToolFallback({part}: UnknownToolFallbackProps) {
    const {toolName, args, partialArgsText} = part.data;
    const argsPreview =
        typeof args === 'undefined' ? partialArgsText || '' : JSON.stringify(args, null, 2);

    return (
        <div className={b()} data-qa={`genui-unknown-tool-${toolName}`} role="alert">
            <span className={b('title')}>Unknown tool: {toolName}</span>
            {argsPreview && <pre className={b('args')}>{argsPreview}</pre>}
        </div>
    );
}
