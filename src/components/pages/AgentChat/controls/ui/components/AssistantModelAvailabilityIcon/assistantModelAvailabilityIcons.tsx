import {Ban, Check, CloudSlash, Lock} from '@gravity-ui/icons';

import {
    type TAssistantModelAvailabilityIconName,
    type TAssistantModelAvailabilityVisual,
} from '../../../shared/agent/assistantModelAvailability';

const AVAILABILITY_ICON_BY_NAME: Record<TAssistantModelAvailabilityIconName, typeof Check> = {
    check: Check,
    ban: Ban,
    lock: Lock,
    'cloud-slash': CloudSlash,
};

export function getAssistantModelAvailabilityIconData(
    visual: TAssistantModelAvailabilityVisual,
): typeof Check {
    return AVAILABILITY_ICON_BY_NAME[visual.iconName];
}
