import {useCallback} from 'react';

import {ArrowUp, Stop} from '@gravity-ui/icons';
import {ButtonButtonProps, Icon, Spin} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../ActionButton';

import {i18n} from './i18n';

import './SubmitButton.scss';

const b = block('submit-button');

export type SubmitButtonState = 'enabled' | 'disabled' | 'loading' | 'cancelable';

export interface SubmitButtonProps {
    /**
     * Click handler
     */
    onClick: () => Promise<void>;
    /**
     * Button state
     */
    state: SubmitButtonState;
    /**
     * Additional CSS class
     */
    className?: string;
    /**
     * Button size
     */
    size?: ButtonButtonProps['size'];
    /**
     * Custom tooltip for enabled state
     */
    tooltipSend?: string;
    /**
     * Custom tooltip for cancelable state
     */
    tooltipCancel?: string;
    /**
     * QA/test identifier
     */
    qa?: string;
}

/**
 * Submit button component with state management through props
 *
 * States:
 * - disabled: disabled button state
 * - enabled: enabled button state
 * - loading: loading state
 * - cancelable: cancellation state (during loading)
 *
 * @returns Submit button component
 */
export function SubmitButton({
    onClick,
    state,
    className,
    size = 'm',
    tooltipSend,
    tooltipCancel,
    qa,
}: SubmitButtonProps) {
    const isCancelable = state === 'cancelable';
    const isLoading = state === 'loading';
    const isDisabled = state === 'disabled';
    const iconData = isCancelable ? Stop : ArrowUp;
    const handleClick = useCallback(async () => {
        if (['enabled', 'cancelable'].includes(state)) {
            return onClick();
        }

        return Promise.resolve();
    }, [state, onClick]);

    // Get tooltip based on state
    const getTooltipTitle = (): string | undefined => {
        switch (state) {
            case 'enabled':
                return tooltipSend || i18n('tooltip-send');
            case 'cancelable':
                return tooltipCancel || i18n('tooltip-cancel');
            case 'disabled':
            case 'loading':
                return undefined;
            default:
                return undefined;
        }
    };

    return (
        <ActionButton
            view="action"
            size={size}
            color="brand"
            disabled={isDisabled}
            onClick={handleClick}
            className={b({size, loading: isLoading, cancelable: isCancelable}, className)}
            qa={qa}
            tooltipTitle={getTooltipTitle()}
        >
            {isLoading ? (
                <div className={b('loader')}>
                    <Spin className={b('spinner')} size="xs" />
                </div>
            ) : (
                <Icon size={16} data={iconData} />
            )}
        </ActionButton>
    );
}
