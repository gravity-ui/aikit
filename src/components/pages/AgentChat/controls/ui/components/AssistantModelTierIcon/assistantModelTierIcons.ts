import {ModelTier} from '../../../shared/types/models';

export function getAssistantModelTierFillLevel(tier: ModelTier): 1 | 2 | 3 | undefined {
    switch (tier) {
        case ModelTier.Economy:
            return 1;
        case ModelTier.Comfort:
            return 2;
        case ModelTier.Max:
            return 3;
        case ModelTier.Default:
        default:
            return undefined;
    }
}
