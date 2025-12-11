import React from 'react';

import {Button, Text} from '@gravity-ui/uikit';

import type {ToolFooterProps} from '../../../types';
import {isActionConfig} from '../../../utils/actionUtils';
import {block} from '../../../utils/cn';
import {Loader, Shimmer} from '../../atoms';
import {ButtonGroup} from '../ButtonGroup';

import './ToolFooter.scss';

const b = block('tool-footer');

export function ToolFooter({actions, content, showLoader = true, className, qa}: ToolFooterProps) {
    return (
        <div className={b('', className)} data-qa={qa}>
            <div className={b('left')}>
                {showLoader && <Loader view="loading" size="xs" />}
                {content && (
                    <Shimmer>
                        <Text>{content}</Text>
                    </Shimmer>
                )}
            </div>
            <ButtonGroup>
                {actions.map((action, index) => {
                    if (!isActionConfig(action)) {
                        return <React.Fragment key={index}>{action}</React.Fragment>;
                    }

                    return (
                        <Button view={action.view} key={index} onClick={action.onClick} size="s">
                            {action.label}
                        </Button>
                    );
                })}
            </ButtonGroup>
        </div>
    );
}
