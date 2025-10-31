import {CircleCheck, CircleInfo, CircleXmark} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './ToolIndicator.scss';

export type ToolIndicatorProps = {
    status?: 'success' | 'error' | 'info';
    className?: string;
    qa?: string;
};

const b = block('tool-indicator');

export const ToolIndicator = (props: ToolIndicatorProps) => {
    const {status = 'info', className, qa} = props;

    const commonProps = {
        qa,
        size: 16,
    };

    switch (status) {
        case 'success':
            return <Icon {...commonProps} data={CircleCheck} className={b('success', className)} />;
        case 'error':
            return <Icon {...commonProps} data={CircleXmark} className={b('error', className)} />;
        case 'info':
            return <Icon {...commonProps} data={CircleInfo} className={b('info', className)} />;
        default:
            return null;
    }
};
