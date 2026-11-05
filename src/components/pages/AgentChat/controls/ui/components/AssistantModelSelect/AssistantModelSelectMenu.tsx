import React, {useMemo} from 'react';

import {ActionTooltip, Select, type SelectProps} from '@gravity-ui/uikit';

import {cn as cn} from '../../../adapters';
import {
    formatAssistantModelClientDisplayName,
    getAssistantModelShortDescription,
    groupAssistantModels,
    isAssistantModelNameStruckThrough,
    isDefaultAssistantModel,
    isSelectableAssistantModel,
} from '../../../shared/agent/assistantModels';
import {type ModelItem} from '../../../shared/types/models';
import {getUserLocale} from '../../lib/i18n/getLang';
import {getAssistantModelIcon} from '../../lib/utils/getAssistantModelIcon';
import {i18n as i18nAvailability} from '../AssistantModelAvailabilityIcon/i18n';
import {AssistantModelAvailabilityIcon} from '../AssistantModelAvailabilityIcon/index';
import {AssistantModelTierIcon} from '../AssistantModelTierIcon/index';
import {SelectPopup} from '../SelectPopup/index';

import {i18n} from './i18n';

import './AssistantModelSelect.ported.scss';
const css = {
    switcher: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcher',
    switcherWidthMax:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcherWidthMax',
    switcherLoading:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcherLoading',
    switcherOutlined:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcherOutlined',
    label: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-label',
    switcherLabel:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcherLabel',
    switcherBrandIcon:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-switcherBrandIcon',
    popup: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-popup',
    popupContent:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-popupContent',
    itemRow: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-itemRow',
    itemTitleUnavailable:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-itemTitleUnavailable',
    brandIcon: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-brandIcon',
    brandIconUnavailable:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-brandIconUnavailable',
    itemEndContent:
        'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-itemEndContent',
    modelInfo: 'agent-ui-components-AssistantModelSelect-AssistantModelSelect-module-css-modelInfo',
};

export interface AssistantModelSelectMenuProps {
    models: ModelItem[];
    selectedModelId?: string;
    onSelect: (modelId: string) => void;
    onTariffLockedSelect?: (modelId: string) => void;
    onRequestLockedSelect?: (modelId: string) => void;
    tariffLockedTooltip?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    renderControl?: SelectProps<ModelItem>['renderControl'];
    width?: 'auto' | 'max';
    disabled?: boolean;
}

export function AssistantModelSelectMenu({
    models,
    selectedModelId,
    onSelect,
    onTariffLockedSelect,
    onRequestLockedSelect,
    tariffLockedTooltip,
    header,
    footer,
    open,
    onOpenChange,
    renderControl = () => <span />,
    width = 'auto',
    disabled,
}: AssistantModelSelectMenuProps) {
    const options = useMemo(() => {
        const grouped = groupAssistantModels(models);
        const groups = [
            {label: i18n('internal_models'), models: grouped.internal},
            {label: i18n('external_models'), models: grouped.external},
        ]
            .filter((group) => group.models.length > 0)
            .map((group) => ({
                label: group.label,
                options: group.models.map((model) => ({
                    value: model.id,
                    content: formatAssistantModelClientDisplayName(model),
                    disabled:
                        !isSelectableAssistantModel(model) &&
                        !(model.disabled_by === 'tariff' && onTariffLockedSelect) &&
                        !(model.disabled_by === 'request' && onRequestLockedSelect),
                    data: model,
                })),
            }));

        return groups.length === 1 ? groups[0].options : groups;
    }, [models, onTariffLockedSelect, onRequestLockedSelect]);

    return (
        <Select<ModelItem>
            size="m"
            width={width}
            disabled={disabled}
            open={open}
            onOpenChange={onOpenChange}
            value={selectedModelId ? [selectedModelId] : []}
            options={options}
            onUpdate={([modelId]) => {
                const model = models.find((item) => item.id === modelId);
                if (model?.disabled_by === 'tariff' && onTariffLockedSelect) {
                    onOpenChange(false);
                    onTariffLockedSelect(modelId);
                    return;
                }
                if (model?.disabled_by === 'request' && onRequestLockedSelect) {
                    onOpenChange(false);
                    onRequestLockedSelect(modelId);
                    return;
                }
                if (model && isSelectableAssistantModel(model)) {
                    onSelect(modelId);
                }
            }}
            renderControl={renderControl}
            popupWidth={width === 'max' ? 'fit' : 296}
            popupClassName={css.popup}
            popupPlacement={['bottom-start', 'top-start']}
            getOptionHeight={() => 32}
            renderPopup={({renderList}) => (
                <SelectPopup className={css.popupContent}>
                    {header}
                    <SelectPopup.List>{renderList()}</SelectPopup.List>
                    {footer}
                </SelectPopup>
            )}
            renderOption={({data: model}) => {
                if (!model) {
                    return <React.Fragment />;
                }
                const selectable = isSelectableAssistantModel(model);
                const tariffLocked = model.disabled_by === 'tariff';
                const canOpenSubscriptions = tariffLocked && Boolean(onTariffLockedSelect);
                const canRequestAccess =
                    model.disabled_by === 'request' && Boolean(onRequestLockedSelect);
                const hasAccessAction = canOpenSubscriptions || canRequestAccess;
                const requestTooltip =
                    model.disabled_by === 'request'
                        ? i18nAvailability('available_on_request')
                        : undefined;
                const availabilityTooltip = tariffLocked ? tariffLockedTooltip : requestTooltip;

                return (
                    <SelectPopup.ListItem
                        className={css.itemRow}
                        disabled={!selectable && !hasAccessAction}
                        interactive={hasAccessAction}
                    >
                        <ActionTooltip
                            title={formatAssistantModelClientDisplayName(model)}
                            description={
                                availabilityTooltip ??
                                getAssistantModelShortDescription(model, getUserLocale())
                            }
                            openDelay={700}
                            placement="top"
                        >
                            <div className={css.modelInfo}>
                                <SelectPopup.ListItem.StartIcon
                                    {...getAssistantModelIcon(model)}
                                    className={cn(css.brandIcon, {
                                        [css.brandIconUnavailable]: !selectable && !tariffLocked,
                                    })}
                                />
                                <SelectPopup.ListItem.Content>
                                    <SelectPopup.ListItem.Title
                                        className={cn({
                                            [css.itemTitleUnavailable]:
                                                isAssistantModelNameStruckThrough(model),
                                        })}
                                    >
                                        {formatAssistantModelClientDisplayName(model)}
                                    </SelectPopup.ListItem.Title>
                                </SelectPopup.ListItem.Content>
                            </div>
                        </ActionTooltip>
                        <SelectPopup.ListItem.EndContent className={css.itemEndContent}>
                            {model.disabled_by ? (
                                <AssistantModelAvailabilityIcon
                                    disabledBy={model.disabled_by}
                                    view="icon"
                                    tooltip={availabilityTooltip}
                                />
                            ) : null}
                            {!model.disabled_by && !isDefaultAssistantModel(model.id) ? (
                                <AssistantModelTierIcon
                                    tier={model.tier}
                                    view="icon"
                                    qa="assistant-model-billing-multiplier"
                                />
                            ) : null}
                        </SelectPopup.ListItem.EndContent>
                    </SelectPopup.ListItem>
                );
            }}
        />
    );
}
