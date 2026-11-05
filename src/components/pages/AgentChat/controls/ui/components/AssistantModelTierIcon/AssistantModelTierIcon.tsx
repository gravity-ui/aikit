import {ActionTooltip, Label} from '@gravity-ui/uikit';

import {type ModelItem, ModelTier} from '../../../shared/types/models';

import {AssistantModelTierBars} from './AssistantModelTierBars';
import {getAssistantModelTierLabel, getAssistantModelTierTooltip} from './assistantModelTier';
import {getAssistantModelTierFillLevel} from './assistantModelTierIcons';

import './AssistantModelTierIcon.ported.scss';
const css = {
    root: 'agent-ui-components-AssistantModelTierIcon-AssistantModelTierIcon-module-css-root',
    icon: 'agent-ui-components-AssistantModelTierIcon-AssistantModelTierIcon-module-css-icon',
};

export interface AssistantModelTierIconProps {
    tier?: ModelItem['tier'];
    qa?: string;
    hideDefaultTier?: boolean;
    size?: 'xs' | 's';
    view?: 'label' | 'icon';
}

export function AssistantModelTierIcon({
    tier,
    qa = 'assistant-model-tier',
    hideDefaultTier = true,
    size = 's',
    view = 'label',
}: AssistantModelTierIconProps) {
    if (!tier || (hideDefaultTier && tier === ModelTier.Default)) {
        return null;
    }

    if (!getAssistantModelTierFillLevel(tier)) {
        return null;
    }

    const tooltip = getAssistantModelTierTooltip(tier);
    const ariaLabel = getAssistantModelTierLabel(tier);

    return (
        <ActionTooltip title={tooltip} openDelay={0} placement="top">
            <span aria-label={ariaLabel}>
                {view === 'icon' ? (
                    <span className={css.icon} data-qa={qa}>
                        <AssistantModelTierBars tier={tier} />
                    </span>
                ) : (
                    <Label
                        className={css.root}
                        theme="clear"
                        size={size}
                        interactive
                        qa={qa}
                        icon={<AssistantModelTierBars tier={tier} />}
                    />
                )}
            </span>
        </ActionTooltip>
    );
}
