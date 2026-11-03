import {useCallback, useMemo, useState} from 'react';

import {ChevronDown, ChevronUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {i18n} from '../components/organisms/ToolMessage/i18n';
import type {Action} from '../types/common';
import type {TToolStatus, ToolMessageProps} from '../types/tool';

import {useAutoCollapseOnCancelled} from './useAutoCollapseOnCancelled';
import {useAutoCollapseOnSuccess} from './useAutoCollapseOnSuccess';

function getDefaultFooterActions(
    t: ReturnType<typeof i18n.useTranslation>['t'],
    status: TToolStatus | undefined,
    footerActions: Action[] | undefined,
    onAccept?: () => void,
    onReject?: () => void,
): Action[] {
    if (footerActions !== undefined) {
        return footerActions;
    }

    switch (status) {
        case 'waitingConfirmation':
            return [
                {
                    label: t('action-reject'),
                    onClick: onReject,
                    view: 'outlined',
                },
                {
                    label: t('action-accept'),
                    onClick: onAccept,
                    view: 'action',
                },
            ];
        case 'waitingSubmission':
            return [
                {
                    label: t('action-cancel'),
                    onClick: onReject,
                    view: 'outlined',
                },
            ];
        default:
            return [];
    }
}

function getDefaultFooterMessage(
    t: ReturnType<typeof i18n.useTranslation>['t'],
    status: TToolStatus | undefined,
    footerContent: React.ReactNode | undefined,
): React.ReactNode | undefined {
    if (footerContent) {
        return footerContent;
    }

    switch (status) {
        case 'waitingConfirmation':
            return t('status-waiting-confirmation');
        case 'waitingSubmission':
            return t('status-waiting-submission');
        default:
            return undefined;
    }
}

function getShowLoader(status: TToolStatus | undefined): boolean {
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

function isWaitingTool(status: TToolStatus | undefined): boolean {
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

function getDefaultInitialExpanded(
    status: TToolStatus | undefined,
    initialExpanded: boolean | undefined,
): boolean {
    if (initialExpanded !== undefined) {
        return initialExpanded;
    }
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

const defaultHeaderActions: Action[] = [];

export function useToolMessage(options: ToolMessageProps) {
    const {t} = i18n.useTranslation();
    const {
        footerActions,
        headerActions = defaultHeaderActions,
        bodyContent,
        status,
        footerContent,
        expandable = Boolean(bodyContent),
        initialExpanded,
        autoCollapseOnSuccess,
        autoCollapseOnCancelled,
        onAccept,
        onReject,
    } = options;

    const [isExpanded, setIsExpanded] = useState(
        getDefaultInitialExpanded(status, initialExpanded),
    );

    useAutoCollapseOnSuccess({enabled: Boolean(autoCollapseOnSuccess), status, setIsExpanded});
    useAutoCollapseOnCancelled({enabled: Boolean(autoCollapseOnCancelled), status, setIsExpanded});

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const expandCollapseAction = useMemo((): Action | null => {
        if (!expandable) {
            return null;
        }

        return {
            label: isExpanded ? t('action-collapse') : t('action-expand'),
            onClick: toggleExpanded,
            icon: <Icon data={isExpanded ? ChevronUp : ChevronDown} size={16} />,
        };
    }, [expandable, isExpanded, toggleExpanded, t]);

    const finalHeaderActions = useMemo(() => {
        return expandCollapseAction ? [...headerActions, expandCollapseAction] : headerActions;
    }, [headerActions, expandCollapseAction]);

    const finalFooterActions = useMemo(() => {
        return getDefaultFooterActions(t, status, footerActions, onAccept, onReject);
    }, [status, footerActions, onAccept, onReject, t]);

    const finalFooterMessage = getDefaultFooterMessage(t, status, footerContent);

    const showLoader = getShowLoader(status);

    const isWaiting = isWaitingTool(status);

    return {
        isExpanded,
        toggleExpanded,
        headerActions: finalHeaderActions,
        footerActions: finalFooterActions,
        footerContent: finalFooterMessage,
        showLoader,
        isWaiting,
    };
}
