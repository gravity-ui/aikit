import {ModelTier} from '../../../shared/types/models';

import {getAssistantModelTierFillLevel} from './assistantModelTierIcons';
import {i18n} from './i18n';

export function getAssistantModelTierLabel(tier: ModelTier): string {
    switch (tier) {
        case ModelTier.Economy:
            return i18n('tier_label_economy');
        case ModelTier.Comfort:
            return i18n('tier_label_comfort');
        case ModelTier.Max:
            return i18n('tier_label_max');
        case ModelTier.Default:
        default:
            return i18n('tier_label_default');
    }
}

export function getAssistantModelTierTooltip(tier: ModelTier): string {
    switch (tier) {
        case ModelTier.Economy:
            return i18n('tier_tooltip_economy');
        case ModelTier.Comfort:
            return i18n('tier_tooltip_comfort');
        case ModelTier.Max:
            return i18n('tier_tooltip_max');
        case ModelTier.Default:
        default:
            return i18n('tier_tooltip_default');
    }
}

export {getAssistantModelTierFillLevel};
