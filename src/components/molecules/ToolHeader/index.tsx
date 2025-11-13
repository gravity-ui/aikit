import {Text} from '@gravity-ui/uikit';

import type {ToolHeaderProps, ToolStatus} from '../../../types/tool';
import {block} from '../../../utils/cn';
import {ActionButton, ToolIndicator} from '../../atoms';
import {ButtonGroup} from '../ButtonGroup';

import './ToolHeader.scss';

const b = block('tool-header');

function getIndicatorStatus(
    status: ToolStatus | undefined,
): 'success' | 'error' | 'loading' | undefined {
    if (status === 'success' || status === 'error' || status === 'loading') {
        return status;
    }
    return undefined;
}

export function ToolHeader(props: ToolHeaderProps) {
    const {toolIcon, toolName, content, actions, status, className, qa} = props;
    const hasActions = actions && actions.length > 0;
    const indicatorStatus = getIndicatorStatus(status);

    return (
        <div className={b('', className)} data-qa={qa}>
            <div className={b('left')}>
                {toolIcon}
                <Text>{toolName}</Text>
                {content}
            </div>
            <div className={b('right')}>
                {hasActions && (
                    <ButtonGroup>
                        {actions.map((action, index) => (
                            <ActionButton
                                tooltipTitle={action.label}
                                view="flat-secondary"
                                key={index}
                                size="s"
                                {...action}
                            >
                                {action.icon}
                            </ActionButton>
                        ))}
                    </ButtonGroup>
                )}
                {indicatorStatus && <ToolIndicator status={indicatorStatus} />}
            </div>
        </div>
    );
}
