import {Sparkles} from '@gravity-ui/icons';
import type {IconProps} from '@gravity-ui/uikit';

import type {AgentModelOption} from '../../../../types';

export function getAssistantModelIcon(model: AgentModelOption): Pick<IconProps, 'data' | 'size'> {
    return {data: model.icon ?? Sparkles, size: 16};
}
