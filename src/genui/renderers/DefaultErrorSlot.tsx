import {block} from '../../utils/cn';
import type {GenUIErrorProps} from '../types';

import './DefaultErrorSlot.scss';

const b = block('genui-error-slot');

/**
 * Default error rendering used when a tool does not supply its own `error` slot.
 * Renders a compact inline block — components keep ownership of richer error UIs.
 */
export function DefaultErrorSlot({error, context}: GenUIErrorProps) {
    return (
        <div
            className={b({code: error.code})}
            data-qa={`genui-error-${context.toolName}`}
            role="alert"
        >
            <span className={b('title')}>
                {context.toolName} · {error.code}
            </span>
            <span className={b('message')}>{error.message}</span>
        </div>
    );
}
