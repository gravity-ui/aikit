import React, {useCallback, useState} from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';

import {cn} from '../../../classNames';
import type {AgentModelOption} from '../../../../types';
import {getAssistantModelIcon} from '../../lib/utils/getAssistantModelIcon';

import {AssistantModelSelectMenu} from './AssistantModelSelectMenu';

import './AssistantModelSelect.ported.scss';

const css = {
    switcher: 'g-aikit-agent-model-select__switcher',
    switcherWidthMax: 'g-aikit-agent-model-select__switcherWidthMax',
    switcherLoading: 'g-aikit-agent-model-select__switcherLoading',
    switcherOutlined: 'g-aikit-agent-model-select__switcherOutlined',
    label: 'g-aikit-agent-model-select__label',
    switcherLabel: 'g-aikit-agent-model-select__switcherLabel',
    switcherBrandIcon: 'g-aikit-agent-model-select__switcherBrandIcon',
    popup: 'g-aikit-agent-model-select__popup',
    popupContent: 'g-aikit-agent-model-select__popupContent',
    itemRow: 'g-aikit-agent-model-select__itemRow',
    itemTitleUnavailable: 'g-aikit-agent-model-select__itemTitleUnavailable',
    brandIcon: 'g-aikit-agent-model-select__brandIcon',
    brandIconUnavailable: 'g-aikit-agent-model-select__brandIconUnavailable',
    itemEndContent: 'g-aikit-agent-model-select__itemEndContent',
    modelInfo: 'g-aikit-agent-model-select__modelInfo',
};

export interface AssistantModelSelectProps {
    models: AgentModelOption[];
    selectedModelId?: string;
    selectedModelLabel: string;
    onSelect: (modelId: string) => void;
    disabled?: boolean;
    loading?: boolean;
    size?: 's' | 'm' | 'l' | 'xl';
    width?: 'auto' | 'max';
    view?: 'normal' | 'outlined';
    qa?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    onOpen?: () => void;
}

export function AssistantModelSelect({
    models,
    selectedModelId,
    selectedModelLabel,
    onSelect,
    disabled = false,
    loading = false,
    size = 's',
    width = 'auto',
    view = 'normal',
    qa = 'assistant-model-selector',
    header,
    footer,
    onOpen,
}: AssistantModelSelectProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = internalOpen;

    const handleOpenToggle = useCallback(
        (nextOpen: boolean) => {
            if (disabled || loading || models.length === 0) {
                return;
            }

            setInternalOpen(nextOpen);
            if (nextOpen) {
                onOpen?.();
            }
        },
        [disabled, loading, models.length, onOpen],
    );

    const handleSelectModel = useCallback(
        (modelId: string) => {
            onSelect(modelId);
            handleOpenToggle(false);
        },
        [handleOpenToggle, onSelect],
    );

    const selectedModel = models.find((model) => model.id === selectedModelId);

    const switcher = (
        <Button
            view={view}
            size={size}
            width={width}
            className={cn(
                css.switcher,
                loading && css.switcherLoading,
                width === 'max' && css.switcherWidthMax,
                view === 'outlined' && css.switcherOutlined,
            )}
            qa={qa}
            disabled={disabled || models.length === 0}
            loading={loading}
            selected={open}
            aria-haspopup="listbox"
            aria-expanded={open}
        >
            {!loading && (
                <span className={css.switcherLabel}>
                    {selectedModel ? (
                        <span className={css.switcherBrandIcon} aria-hidden="true">
                            <Icon {...getAssistantModelIcon(selectedModel)} />
                        </span>
                    ) : null}
                    <span className={css.label}>{selectedModelLabel}</span>
                </span>
            )}
            {!loading && <Icon data={ChevronDown} size={view === 'outlined' ? 16 : 14} />}
        </Button>
    );

    if (disabled || loading || models.length === 0) {
        return switcher;
    }

    return (
        <AssistantModelSelectMenu
            models={models}
            selectedModelId={selectedModelId}
            onSelect={handleSelectModel}
            header={header}
            footer={footer}
            open={open}
            onOpenChange={handleOpenToggle}
            width={width}
            renderControl={({ref, triggerProps}) =>
                React.cloneElement(switcher, {
                    ...triggerProps,
                    ref: ref as React.Ref<HTMLButtonElement>,
                })
            }
        />
    );
}
