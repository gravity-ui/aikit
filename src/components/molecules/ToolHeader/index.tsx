import React from 'react';

import {Text} from '@gravity-ui/uikit';

import type {ToolHeaderProps} from '../../../types/tool';
import {isActionConfig} from '../../../utils/actionUtils';
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
                        {actions.map((action, index) => {
                            // Check if action is a ReactNode (not an object with properties)
                            if (!isActionConfig(action)) {
                                return <React.Fragment key={index}>{action}</React.Fragment>;
                            }

                            // TypeScript now knows that action is ActionConfig
                            return (
                                <ActionButton
                                    tooltipTitle={action.label}
                                    view={action.view || 'flat-secondary'}
                                    key={index}
                                    size="s"
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                </ActionButton>
                            );
                        })}
                    </ButtonGroup>
                )}
                <ToolStatus status={status} />
            </div>
        </div>
    );
}
