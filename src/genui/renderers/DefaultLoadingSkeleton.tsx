import {Loader} from '../../components/atoms/Loader';
import {block} from '../../utils/cn';
import type {GenUILoadingProps} from '../types';

import './DefaultLoadingSkeleton.scss';

const b = block('genui-loading-skeleton');

/**
 * Default placeholder shown while `tool-call.status === 'input-streaming'`.
 * Tools can opt into their own `loading` slot via `GenUITool.loading`.
 */
export function DefaultLoadingSkeleton({context}: GenUILoadingProps) {
    return (
        <div className={b()} data-qa={`genui-loading-${context.toolName}`}>
            <Loader view="streaming" size="s" />
            <span className={b('label')}>{context.toolName}</span>
        </div>
    );
}
