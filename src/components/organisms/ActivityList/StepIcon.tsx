import type {ReactNode} from 'react';

import {Ban, Check, CircleXmark, Clock, Pause} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import type {ActivityListProps, ActivityStepStatus} from './types';

const b = block('thinking-message-group');

const statusIcons = {
    thinking: Clock,
    thought: Check,
    error: CircleXmark,
    cancelled: Ban,
    paused: Pause,
};

export function StepIcon({
    status,
    operationIcon,
    iconMode = 'status',
}: {
    status: ActivityStepStatus;
    operationIcon?: ReactNode;
    iconMode?: ActivityListProps['iconMode'];
}) {
    if (iconMode === 'none') return null;

    if (iconMode === 'type' && (status === 'thinking' || status === 'thought')) {
        return operationIcon || <span className={b('step-dot')} />;
    }

    return <Icon data={statusIcons[status]} size={16} />;
}
