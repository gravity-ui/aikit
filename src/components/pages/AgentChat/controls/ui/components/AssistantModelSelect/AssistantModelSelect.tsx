import React, {useCallback, useState} from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';

import {cn as cn} from '../../../adapters';
import {type ModelItem} from '../../../shared/types/models';
import {getAssistantModelIcon} from '../../lib/utils/getAssistantModelIcon';

import {AssistantModelSelectMenu} from './AssistantModelSelectMenu';

import './AssistantModelSelect.ported.scss';
const useDevice = () => ({isMobile: false});

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

export interface AssistantModelSelectProps {
    models: ModelItem[];
    selectedModelId?: string;
    selectedModelLabel: string;
    onSelect: (modelId: string) => void;
    onTariffLockedSelect?: (modelId: string) => void;
    onRequestLockedSelect?: (modelId: string) => void;
    tariffLockedTooltip?: string;
    disabled?: boolean;
    loading?: boolean;
    size?: 's' | 'm' | 'l' | 'xl';
    width?: 'auto' | 'max';
    view?: 'normal' | 'outlined';
    qa?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    onOpen?: () => void;
    mobileMenuOpen?: boolean;
    onMobileMenuOpenChange?: (open: boolean) => void;
}

export function AssistantModelSelect({
    models,
    selectedModelId,
    selectedModelLabel,
    onSelect,
    onTariffLockedSelect,
    onRequestLockedSelect,
    tariffLockedTooltip,
    disabled = false,
    loading = false,
    size = 's',
    width = 'auto',
    view = 'normal',
    qa = 'assistant-model-selector',
    header,
    footer,
    onOpen,
    mobileMenuOpen,
    onMobileMenuOpenChange,
}: AssistantModelSelectProps) {
    const {isMobile} = useDevice();
    const usesExternalMobileMenu = isMobile && onMobileMenuOpenChange !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const open = usesExternalMobileMenu ? Boolean(mobileMenuOpen) : internalOpen;

    const handleOpenToggle = useCallback(
        (nextOpen: boolean) => {
            if (disabled || loading || models.length === 0) {
                return;
            }

            if (usesExternalMobileMenu) {
                onMobileMenuOpenChange(nextOpen);
            } else {
                setInternalOpen(nextOpen);
            }

            if (nextOpen && !usesExternalMobileMenu) {
                onOpen?.();
            }
        },
        [disabled, loading, models.length, onMobileMenuOpenChange, onOpen, usesExternalMobileMenu],
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
            onClick={isMobile ? () => handleOpenToggle(!open) : undefined}
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

    if (usesExternalMobileMenu) {
        return switcher;
    }

    return (
        <AssistantModelSelectMenu
            models={models}
            selectedModelId={selectedModelId}
            onSelect={handleSelectModel}
            onTariffLockedSelect={onTariffLockedSelect}
            onRequestLockedSelect={onRequestLockedSelect}
            tariffLockedTooltip={tariffLockedTooltip}
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
