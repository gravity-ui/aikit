import {Text} from '@gravity-ui/uikit';

import type {ToolHeaderProps} from '../../../types/tool';
import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms';
import {ButtonGroup} from '../ButtonGroup';
import {ToolStatus} from '../ToolStatus';

import './ToolHeader.scss';

const b = block('tool-header');

export function ToolHeader(props: ToolHeaderProps) {
    const {toolIcon, toolName, content, actions, status, className, qa} = props;
    const hasActions = actions && actions.length > 0;

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
                <ToolStatus status={status} />
            </div>
        </div>
    );
}
