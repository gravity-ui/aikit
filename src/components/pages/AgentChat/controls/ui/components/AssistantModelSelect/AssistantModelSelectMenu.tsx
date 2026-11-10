import type {ReactNode} from 'react';
import {useMemo} from 'react';

import {
    ActionTooltip,
    Select,
    type SelectOption,
    type SelectOptions,
    type SelectProps,
} from '@gravity-ui/uikit';

import type {AgentModelOption} from '../../../../types';
import {getAssistantModelIcon} from '../../lib/utils/getAssistantModelIcon';
import {SelectPopup} from '../SelectPopup';

import './AssistantModelSelect.ported.scss';

export interface AssistantModelSelectMenuProps {
    models: AgentModelOption[];
    selectedModelId?: string;
    onSelect: (modelId: string) => void;
    header?: ReactNode;
    footer?: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    renderControl?: SelectProps<AgentModelOption>['renderControl'];
    width?: 'auto' | 'max';
    disabled?: boolean;
}

export function AssistantModelSelectMenu({
    models,
    selectedModelId,
    onSelect,
    header,
    footer,
    open,
    onOpenChange,
    renderControl,
    width = 'auto',
    disabled,
}: AssistantModelSelectMenuProps) {
    const options = useMemo(() => {
        const groups = new Map<
            string,
            {label: string; options: SelectOption<AgentModelOption>[]}
        >();
        for (const model of models) {
            const label = model.group ?? '';
            let group = groups.get(label);
            if (!group) {
                group = {label, options: []};
                groups.set(label, group);
            }
            group.options.push({
                value: model.id,
                content: model.name,
                disabled: model.disabled,
                data: model,
            });
        }
        const result: SelectOptions<AgentModelOption> = [];
        for (const group of groups.values()) {
            if (group.label) {
                result.push(group);
            } else {
                result.push(...group.options);
            }
        }
        return result;
    }, [models]);
    return (
        <Select<AgentModelOption>
            size="m"
            width={width}
            disabled={disabled}
            open={open}
            onOpenChange={onOpenChange}
            value={selectedModelId ? [selectedModelId] : []}
            options={options}
            onUpdate={([id]) => {
                const model = models.find((item) => item.id === id);
                if (model && !model.disabled) {
                    onSelect(model.id);
                }
            }}
            renderControl={renderControl}
            popupWidth={width === 'max' ? 'fit' : 296}
            popupClassName="g-aikit-agent-model-select__popup"
            popupPlacement={['bottom-start', 'top-start']}
            getOptionHeight={() => 32}
            renderPopup={({renderList}) => (
                <SelectPopup className="g-aikit-agent-model-select__popupContent">
                    {header}
                    <SelectPopup.List>{renderList()}</SelectPopup.List>
                    {footer}
                </SelectPopup>
            )}
            renderOption={({data: model}) => {
                if (!model) {
                    return <></>;
                }
                return (
                    <SelectPopup.ListItem
                        className="g-aikit-agent-model-select__itemRow"
                        disabled={model.disabled}
                    >
                        <ActionTooltip
                            title={model.name}
                            description={model.description}
                            openDelay={700}
                            placement="top"
                        >
                            <div className="g-aikit-agent-model-select__modelInfo">
                                <SelectPopup.ListItem.StartIcon
                                    {...getAssistantModelIcon(model)}
                                    className="g-aikit-agent-model-select__brandIcon"
                                />
                                <SelectPopup.ListItem.Content>
                                    <SelectPopup.ListItem.Title>
                                        {model.name}
                                    </SelectPopup.ListItem.Title>
                                </SelectPopup.ListItem.Content>
                            </div>
                        </ActionTooltip>
                        <SelectPopup.ListItem.EndContent className="g-aikit-agent-model-select__itemEndContent">
                            {model.endContent}
                        </SelectPopup.ListItem.EndContent>
                    </SelectPopup.ListItem>
                );
            }}
        />
    );
}
