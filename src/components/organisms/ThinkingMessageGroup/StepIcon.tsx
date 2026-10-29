import type {ReactNode} from 'react';

import {Ban, CircleXmark, Pause} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import type {ThinkingStepStatus} from './types';

const b = block('thinking-message-group');

const statusIcons = {
    error: CircleXmark,
    cancelled: Ban,
    paused: Pause,
};

export function StepIcon({
    status,
    operationIcon,
}: {
    status: ThinkingStepStatus;
    operationIcon?: ReactNode;
}) {
    if (status === 'thinking' || status === 'thought') {
        return operationIcon || <span className={b('step-dot')} />;
    }

    return <Icon data={statusIcons[status]} size={16} />;
}
