import {useCallback, useMemo, useState} from 'react';

import {ChevronDown, ChevronUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {i18n} from '../components/organisms/ToolMessage/i18n';
import type {Action} from '../types/common';
import type {ToolMessageProps, ToolStatus} from '../types/tool';

import {useAutoCollapseOnCancelled} from './useAutoCollapseOnCancelled';
import {useAutoCollapseOnSuccess} from './useAutoCollapseOnSuccess';

function getDefaultFooterActions(
    status: ToolStatus | undefined,
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
                    label: i18n('action-reject'),
                    onClick: onReject,
                    view: 'outlined',
                },
                {
                    label: i18n('action-accept'),
                    onClick: onAccept,
                    view: 'action',
                },
            ];
        case 'waitingSubmission':
            return [
                {
                    label: i18n('action-cancel'),
                    onClick: onReject,
                    view: 'outlined',
                },
            ];
        default:
            return [];
    }
}

function getDefaultFooterMessage(
    status: ToolStatus | undefined,
    footerContent: React.ReactNode | undefined,
): React.ReactNode | undefined {
    if (footerContent) {
        return footerContent;
    }

    switch (status) {
        case 'waitingConfirmation':
            return i18n('status-waiting-confirmation');
        case 'waitingSubmission':
            return i18n('status-waiting-submission');
        default:
            return undefined;
    }
}

function getShowLoader(status: ToolStatus | undefined): boolean {
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

function isWaitingTool(status: ToolStatus | undefined): boolean {
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

function getDefaultInitialExpanded(
    status: ToolStatus | undefined,
    initialExpanded: boolean | undefined,
): boolean {
    if (initialExpanded !== undefined) {
        return initialExpanded;
    }
    return status === 'waitingConfirmation' || status === 'waitingSubmission';
}

const defaultHeaderActions: Action[] = [];

export function useToolMessage(options: ToolMessageProps) {
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
            label: isExpanded ? i18n('action-collapse') : i18n('action-expand'),
            onClick: toggleExpanded,
            icon: <Icon data={isExpanded ? ChevronUp : ChevronDown} size={16} />,
        };
    }, [expandable, isExpanded, toggleExpanded]);

    const finalHeaderActions = useMemo(() => {
        return expandCollapseAction ? [...headerActions, expandCollapseAction] : headerActions;
    }, [headerActions, expandCollapseAction]);

    const finalFooterActions = useMemo(() => {
        return getDefaultFooterActions(status, footerActions, onAccept, onReject);
    }, [status, footerActions, onAccept, onReject]);

    const finalFooterMessage = getDefaultFooterMessage(status, footerContent);

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
