import {type ModelItem} from '../types/models';

export enum AssistantModelAvailabilityKind {
    Active = 'active',
    DisabledByAdmin = 'admin',
    UnavailableOnTariff = 'tariff',
    UnavailableAtProvider = 'provider',
    AvailableOnRequest = 'request',
}

export type TAssistantModelAvailabilityIconName = 'check' | 'ban' | 'lock' | 'cloud-slash';

export type TAssistantModelAvailabilityVisual = {
    labelTheme: 'success' | 'clear' | 'warning';
    iconName: TAssistantModelAvailabilityIconName;
};

export type TOrgModelStatusKey =
    | 'active'
    | 'disabled-by-admin'
    | 'unavailable-on-tariff'
    | 'unavailable-at-provider'
    | 'available-on-request';

export function getAssistantModelAvailabilityKindFromDisabledBy(
    disabledBy?: ModelItem['disabled_by'],
): AssistantModelAvailabilityKind | null {
    if (!disabledBy) {
        return null;
    }

    switch (disabledBy) {
        case 'admin':
            return AssistantModelAvailabilityKind.DisabledByAdmin;
        case 'tariff':
            return AssistantModelAvailabilityKind.UnavailableOnTariff;
        case 'provider':
            return AssistantModelAvailabilityKind.UnavailableAtProvider;
        case 'request':
            return AssistantModelAvailabilityKind.AvailableOnRequest;
        default:
            return null;
    }
}

export function getAssistantModelAvailabilityKindFromOrgModelStatus(
    status: TOrgModelStatusKey,
): AssistantModelAvailabilityKind {
    switch (status) {
        case 'active':
            return AssistantModelAvailabilityKind.Active;
        case 'disabled-by-admin':
            return AssistantModelAvailabilityKind.DisabledByAdmin;
        case 'unavailable-on-tariff':
            return AssistantModelAvailabilityKind.UnavailableOnTariff;
        case 'available-on-request':
            return AssistantModelAvailabilityKind.AvailableOnRequest;
        case 'unavailable-at-provider':
        default:
            return AssistantModelAvailabilityKind.UnavailableAtProvider;
    }
}

export function getAssistantModelAvailabilityVisual(
    kind: AssistantModelAvailabilityKind,
): TAssistantModelAvailabilityVisual {
    switch (kind) {
        case AssistantModelAvailabilityKind.Active:
            return {labelTheme: 'success', iconName: 'check'};
        case AssistantModelAvailabilityKind.DisabledByAdmin:
            return {labelTheme: 'clear', iconName: 'ban'};
        case AssistantModelAvailabilityKind.UnavailableOnTariff:
        case AssistantModelAvailabilityKind.AvailableOnRequest:
            return {labelTheme: 'clear', iconName: 'lock'};
        case AssistantModelAvailabilityKind.UnavailableAtProvider:
        default:
            return {labelTheme: 'warning', iconName: 'cloud-slash'};
    }
}
