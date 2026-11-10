import type {ReactNode} from 'react';
import type {IconProps} from '@gravity-ui/uikit';

/** @experimental Presentation data for a model option. May change in minor releases. */
/** @experimental May change or be removed in minor releases. */
export interface AgentModelOption {
    id: string;
    name: string;
    description?: string;
    icon?: IconProps['data'];
    disabled?: boolean;
    group?: string;
    endContent?: ReactNode;
}
