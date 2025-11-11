import {useCallback, useMemo, useState} from 'react';

import {ChevronDown, ChevronUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {ToolFooterAction, ToolHeaderAction, ToolMessageProps, ToolStatus} from '../types/tool';

function getDefaultFooterActions(
    status: ToolStatus | undefined,
    footerActions: ToolFooterAction[] | undefined,
    onAccept?: () => void,
    onReject?: () => void,
): ToolFooterAction[] {
    if (footerActions !== undefined) {
        return footerActions;
    }

    switch (status) {
        case 'waitingConfirmation':
            return [
                {
                    label: 'Reject',
                    onClick: onReject,
                    view: 'outlined',
                },
                {
                    label: 'Accept',
                    onClick: onAccept,
                    view: 'action',
                },
            ];
        case 'waitingSubmission':
            return [
                {
                    label: 'Cancel',
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
            return 'Awaiting confirmation';
        case 'waitingSubmission':
            return 'Awaiting form submission';
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

export function useToolMessage(options: ToolMessageProps) {
    const {
        footerActions,
        headerActions = [],
        bodyContent,
        status,
        footerContent,
        expandable = Boolean(bodyContent),
        initialExpanded,
        onAccept,
        onReject,
    } = options;

    const [isExpanded, setIsExpanded] = useState(
        getDefaultInitialExpanded(status, initialExpanded),
    );

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const expandCollapseAction = useMemo((): ToolHeaderAction | null => {
        if (!expandable) {
            return null;
        }

        return {
            label: isExpanded ? 'Collapse' : 'Expand',
            onClick: toggleExpanded,
            icon: <Icon data={isExpanded ? ChevronUp : ChevronDown} size={16} />,
        };
    }, [expandable, bodyContent, isExpanded, toggleExpanded]);

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
