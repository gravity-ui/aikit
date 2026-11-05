import {Sparkles} from '@gravity-ui/icons';
import type {IconProps} from '@gravity-ui/uikit';

import type {ModelItem} from '../../../shared/types/models';

export function getAssistantModelIcon(_model: ModelItem): Pick<IconProps, 'data' | 'size'> {
    return {data: Sparkles, size: 16};
}
