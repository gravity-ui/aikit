import {type ModelItem} from '../types/models';

export type TAssistantModelLocale = 'ru' | 'en';

export const DEFAULT_AGENT_ASSISTANT_MODEL_ID = 'default';

export enum AssistantModelsUiStatus {
    Disabled = 'disabled',
    Loading = 'loading',
    Ready = 'ready',
    Missing = 'missing',
    Empty = 'empty',
    Error = 'error',
}

export type TAssistantModelGroup = {
    internal: ModelItem[];
    external: ModelItem[];
};

export type TAssistantModelsUiState = {
    status: AssistantModelsUiStatus;
    selectedModelId?: string;
};

export function formatParameterCount(value: number | null | undefined): string | null {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return null;
    }

    const billions = value / 1_000_000_000;

    if (billions >= 1) {
        return `${formatCompactNumber(billions)}B`;
    }

    const millions = value / 1_000_000;

    if (millions >= 1) {
        return `${formatCompactNumber(millions)}M`;
    }

    return String(value);
}

function formatCompactNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(1)));
}

export function getAssistantModelParameterCount(model: ModelItem): number | null | undefined {
    return model.architecture.parameter_count;
}

function pickNonEmptyString(...values: Array<string | null | undefined>): string | undefined {
    for (const value of values) {
        const trimmed = value?.trim();

        if (trimmed) {
            return trimmed;
        }
    }

    return undefined;
}

export function getAssistantModelShortDescription(
    model: ModelItem,
    locale: TAssistantModelLocale,
): string | undefined {
    if (locale === 'ru') {
        return pickNonEmptyString(model.description_ru, model.description);
    }

    return pickNonEmptyString(model.description);
}

export function getAssistantModelOverviewDescription(
    model: ModelItem,
    locale: TAssistantModelLocale,
): string | undefined {
    if (locale === 'ru') {
        return pickNonEmptyString(
            model.description_full_ru,
            model.description_full,
            model.description_ru,
            model.description,
        );
    }

    return pickNonEmptyString(model.description_full, model.description);
}

export function formatTokenCount(value: number, locale: TAssistantModelLocale): string {
    return new Intl.NumberFormat(locale).format(value);
}

export function getAssistantModelDeveloper(model: ModelItem): string | undefined {
    const developer = model.developer?.trim();

    return developer ? developer : undefined;
}

export function isSelectableAssistantModel(model: ModelItem): boolean {
    return !model.disabled_by;
}

export function isAssistantModelNameStruckThrough(model: Pick<ModelItem, 'disabled_by'>): boolean {
    return model.disabled_by === 'provider' || model.disabled_by === 'admin';
}

export function isAssistantModelLockedByTariffOrProvider(
    model: Pick<ModelItem, 'disabled_by'>,
): boolean {
    return model.disabled_by === 'tariff' || model.disabled_by === 'provider';
}

export function formatAssistantModelClientDisplayName(
    model: Pick<ModelItem, 'name' | 'disabled_by'>,
): string {
    return model.name;
}

export function filterSelectableAssistantModels(models: ModelItem[]): ModelItem[] {
    return models.filter(isSelectableAssistantModel);
}

export function groupAssistantModels(models: ModelItem[]): TAssistantModelGroup {
    const internal: ModelItem[] = [];
    const external: ModelItem[] = [];

    for (const model of models) {
        if (model.external) {
            external.push(model);
        } else {
            internal.push(model);
        }
    }

    return {internal, external};
}

export function findAssistantModelBySavedId(
    savedModelId: string | undefined,
    models: ModelItem[],
): ModelItem | undefined {
    if (!savedModelId || models.length === 0) {
        return undefined;
    }

    const candidate = resolveChatAssistantModelId({savedModelId});

    const directMatch = models.find((model) => model.id === candidate);

    if (directMatch) {
        return directMatch;
    }

    return models.find(
        (model) => resolveChatAssistantModelId({savedModelId: model.id}) === candidate,
    );
}

export function resolveSelectedAssistantModelId(
    savedModelId: string | undefined,
    models: ModelItem[],
): string | undefined {
    if (models.length === 0) {
        return undefined;
    }

    if (savedModelId !== undefined) {
        return findAssistantModelBySavedId(savedModelId, models)?.id;
    }

    const candidate = resolveChatAssistantModelId({savedModelId});

    if (models.some((model) => model.id === candidate)) {
        return candidate;
    }

    return findAssistantModelBySavedId(candidate, models)?.id;
}

export function resolveAssistantModelSelectorModelId(params: {
    savedModelId?: string;
    selectableModels: ModelItem[];
    catalogModels: ModelItem[];
}): string | undefined {
    const {savedModelId, selectableModels, catalogModels} = params;

    const selectedFromSelectable = resolveSelectedAssistantModelId(savedModelId, selectableModels);

    if (selectedFromSelectable) {
        return selectedFromSelectable;
    }

    const savedInCatalog = findAssistantModelBySavedId(savedModelId, catalogModels);

    if (savedInCatalog && !isSelectableAssistantModel(savedInCatalog)) {
        return (
            resolveSelectedAssistantModelId(undefined, selectableModels) ?? selectableModels[0]?.id
        );
    }

    return undefined;
}

export function resolveChatRequestAssistantModelId(params: {
    savedModelId?: string;
    selectableModels: ModelItem[];
    catalogModels: ModelItem[];
}): string | undefined {
    const effectiveModelId = resolveAssistantModelSelectorModelId(params);

    if (effectiveModelId) {
        return resolveChatAssistantModelId({savedModelId: effectiveModelId});
    }

    if (
        params.savedModelId !== undefined &&
        !findAssistantModelBySavedId(params.savedModelId, params.catalogModels)
    ) {
        return resolveChatAssistantModelId({savedModelId: params.savedModelId});
    }

    return undefined;
}

export function getAssistantModelLabel(
    modelId: string,
    models: ModelItem[],
    defaultLabel: string,
): string {
    const model = models.find((item) => item.id === modelId);

    if (!model) {
        return defaultLabel;
    }

    return formatAssistantModelClientDisplayName(model);
}

export function getAssistantModelsUiState(params: {
    isFeatureEnabled: boolean;
    isSelectorEnabled: boolean;
    isCatalogLoading: boolean;
    isCatalogLoaded: boolean;
    hasCatalogError: boolean;
    models: ModelItem[];
    catalogModels?: ModelItem[];
    savedModelId?: string;
}): TAssistantModelsUiState {
    const {
        isFeatureEnabled,
        isSelectorEnabled,
        isCatalogLoading,
        isCatalogLoaded,
        hasCatalogError,
        models,
        catalogModels = models,
        savedModelId,
    } = params;

    if (!isFeatureEnabled || !isSelectorEnabled) {
        return {status: AssistantModelsUiStatus.Disabled};
    }

    if (hasCatalogError) {
        return {status: AssistantModelsUiStatus.Error};
    }

    if (!isCatalogLoaded || isCatalogLoading) {
        return {status: AssistantModelsUiStatus.Loading};
    }

    if (models.length === 0) {
        return {status: AssistantModelsUiStatus.Empty};
    }

    const selectedModelId = resolveAssistantModelSelectorModelId({
        savedModelId,
        selectableModels: models,
        catalogModels,
    });

    if (!selectedModelId) {
        return {status: AssistantModelsUiStatus.Missing};
    }

    return {
        status: AssistantModelsUiStatus.Ready,
        selectedModelId,
    };
}

export function isDefaultAssistantModel(modelId: string): boolean {
    return (
        resolveChatAssistantModelId({savedModelId: modelId}) === DEFAULT_AGENT_ASSISTANT_MODEL_ID
    );
}

export function resolveChatAssistantModelId(params: {savedModelId?: string}): string {
    const {savedModelId} = params;

    return savedModelId ?? DEFAULT_AGENT_ASSISTANT_MODEL_ID;
}
