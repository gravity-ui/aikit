import {Text} from '@gravity-ui/uikit';

import type {ToolStatus as ToolStatusType} from '../../../types/tool';
import {block} from '../../../utils/cn';
import {ToolIndicator} from '../../atoms';

import {i18n} from './i18n';

import './ToolStatus.scss';

const b = block('tool-status');

export type ToolStatusProps = {
    status?: ToolStatusType;
    className?: string;
    qa?: string;
};

function getIndicatorStatus(
    status: ToolStatusType | undefined,
): 'success' | 'error' | 'loading' | undefined {
    if (status === 'success' || status === 'error' || status === 'loading') {
        return status;
    }
    return undefined;
}

export function ToolStatus(props: ToolStatusProps) {
    const {status, className, qa} = props;
    const indicatorStatus = getIndicatorStatus(status);

    if (status === 'cancelled') {
        return (
            <Text color="secondary" className={b('', className)} data-qa={qa}>
                {i18n('status-cancelled')}
            </Text>
        );
    }

    if (indicatorStatus) {
        return <ToolIndicator status={indicatorStatus} className={className} qa={qa} />;
    }

    return null;
}
