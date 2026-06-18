import type {ChatStatus} from '../../../types';
import {block} from '../../../utils/cn';
import {AlertProps} from '../../atoms/Alert';
import {Loader} from '../../atoms/Loader';
import {ActionPopup} from '../../molecules/ActionPopup';
import {RatingBlock, type RatingBlockProps} from '../../molecules/RatingBlock/RatingBlock';

import {ErrorAlert} from './ErrorAlert';
import type {MessageListActionPopupConfig} from './MessageList';
import type {PopupState} from './usePopup';

const b = block('message-list');

export interface MessageListFooterProps {
    showLoader?: boolean;
    status?: ChatStatus;
    errorMessage?: AlertProps;
    onRetry?: () => void;
    ratingBlockProps?: RatingBlockProps;
    actionPopupProps?: MessageListActionPopupConfig;
    qa?: string;
    showActionPopup: boolean;
    popupState: PopupState;
    onPopupOpenChange: (open: boolean) => void;
}

/**
 * Shared trailing content for the message list (loader, error alert, rating block and the
 * action popup), used by both the plain and virtualized list variants.
 */
export function MessageListFooter({
    showLoader,
    status,
    errorMessage,
    onRetry,
    ratingBlockProps,
    actionPopupProps,
    qa,
    showActionPopup,
    popupState,
    onPopupOpenChange,
}: MessageListFooterProps) {
    return (
        <>
            {showLoader && <Loader className={b('loader')} />}
            {status === 'error' && (
                <ErrorAlert
                    className={b('error-alert')}
                    onRetry={onRetry}
                    errorMessage={errorMessage}
                />
            )}
            {ratingBlockProps && ratingBlockProps.visible !== false && (
                <RatingBlock
                    {...ratingBlockProps}
                    className={b('rating-block', ratingBlockProps.className)}
                />
            )}
            {showActionPopup && popupState.actionConfig?.popup && (
                <ActionPopup
                    open={popupState.open}
                    onOpenChange={onPopupOpenChange}
                    anchorElement={popupState.anchorElement}
                    title={actionPopupProps?.title || popupState.title || undefined}
                    subtitle={actionPopupProps?.subtitle || popupState.subtitle || undefined}
                    placement={
                        actionPopupProps?.placement || popupState.actionConfig.popup.placement
                    }
                    className={actionPopupProps?.className}
                    qa={actionPopupProps?.qa ?? (qa ? `${qa}-action-popup` : 'action-popup')}
                >
                    {popupState.content}
                </ActionPopup>
            )}
        </>
    );
}
