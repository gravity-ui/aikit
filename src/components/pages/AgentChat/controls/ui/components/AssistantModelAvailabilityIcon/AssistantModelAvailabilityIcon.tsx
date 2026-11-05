const LockFill =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M8 1a4 4 0 0 1 4 4v1l.154.004A3 3 0 0 1 15 9v3a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 2.846-2.996L4 6V5a4 4 0 0 1 4-4m0 7.75a.75.75 0 0 0-.75.75v2a.75.75 0 0 0 1.5 0v-2A.75.75 0 0 0 8 8.75M8 2.5A2.5 2.5 0 0 0 5.5 5v1h5V5A2.5 2.5 0 0 0 8 2.5" clip-rule="evenodd"/></svg>';
import {ActionTooltip, Icon, Label} from '@gravity-ui/uikit';

import {
    AssistantModelAvailabilityKind,
    getAssistantModelAvailabilityKindFromDisabledBy,
    getAssistantModelAvailabilityVisual,
} from '../../../shared/agent/assistantModelAvailability';
import {type ModelItem} from '../../../shared/types/models';

import {getAssistantModelAvailabilityIconData} from './assistantModelAvailabilityIcons';
import {i18n} from './i18n';

import './AssistantModelAvailabilityIcon.ported.scss';
const css = {
    root: 'agent-ui-components-AssistantModelAvailabilityIcon-AssistantModelAvailabilityIcon-module-css-root',
    icon: 'agent-ui-components-AssistantModelAvailabilityIcon-AssistantModelAvailabilityIcon-module-css-icon',
    lock: 'agent-ui-components-AssistantModelAvailabilityIcon-AssistantModelAvailabilityIcon-module-css-lock',
};

export interface AssistantModelAvailabilityIconProps {
    disabledBy?: ModelItem['disabled_by'];
    qa?: string;
    tooltip?: string;
    view?: 'label' | 'icon';
}

function getAvailabilityTooltip(kind: AssistantModelAvailabilityKind): string {
    switch (kind) {
        case AssistantModelAvailabilityKind.DisabledByAdmin:
            return i18n('disabled_by_admin');
        case AssistantModelAvailabilityKind.UnavailableOnTariff:
            return i18n('unavailable_on_tariff_help');
        case AssistantModelAvailabilityKind.UnavailableAtProvider:
            return i18n('unavailable_at_provider_help');
        case AssistantModelAvailabilityKind.AvailableOnRequest:
            return i18n('available_on_request');
        case AssistantModelAvailabilityKind.Active:
        default:
            return '';
    }
}

export function AssistantModelAvailabilityIcon({
    disabledBy,
    qa = 'assistant-model-availability',
    view = 'label',
    tooltip: tooltipOverride,
}: AssistantModelAvailabilityIconProps) {
    const kind = getAssistantModelAvailabilityKindFromDisabledBy(disabledBy);

    if (!kind) {
        return null;
    }

    const visual = getAssistantModelAvailabilityVisual(kind);
    const tooltip = tooltipOverride ?? getAvailabilityTooltip(kind);
    const iconData = getAssistantModelAvailabilityIconData(visual);
    const isLocked = visual.iconName === 'lock';

    return (
        <ActionTooltip title={tooltip} openDelay={0} placement="top">
            <span aria-label={tooltip}>
                {view === 'icon' ? (
                    <span className={css.icon} data-qa={qa}>
                        <Icon
                            className={isLocked ? css.lock : undefined}
                            data={isLocked ? LockFill : iconData}
                            size={isLocked ? 14 : 16}
                        />
                    </span>
                ) : (
                    <Label
                        className={css.root}
                        theme={visual.labelTheme}
                        size="xs"
                        interactive
                        qa={qa}
                        icon={<Icon data={iconData} size={12} />}
                    />
                )}
            </span>
        </ActionTooltip>
    );
}
