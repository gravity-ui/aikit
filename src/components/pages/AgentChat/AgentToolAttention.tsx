import type {ToolMessageProps} from '../../../types/tool';
import {ToolMessage} from '../../organisms/ToolMessage';

/** Keep confirmation visible using the standard tool confirmation surface. */
/** @experimental May change or be removed in minor releases. */
export function AgentToolAttention(props: ToolMessageProps) {
    return (
        <ToolMessage
            {...props}
            className={['agent-chat__confirmation', props.className].filter(Boolean).join(' ')}
            view="default"
            footerActionSize="m"
            initialExpanded
            expandable={false}
            headerContent={
                props.headerContent ? (
                    <span className="agent-chat__confirmation-context">{props.headerContent}</span>
                ) : undefined
            }
            footerContent={undefined}
        />
    );
}
