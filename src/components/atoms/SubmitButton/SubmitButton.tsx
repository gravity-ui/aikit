import {ArrowUp, Stop} from '@gravity-ui/icons';
import {Button, Icon, Spin} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './SubmitButton.scss';

const b = block('submit-button');

export type SubmitButtonSize = 's' | 'm' | 'l';
export type SubmitButtonState = 'enabled' | 'disabled' | 'loading' | 'cancelable';

export interface SubmitButtonProps {
    /**
     * Data submission handler
     */
    onSend: () => Promise<void>;
    /**
     * Cancellation handler
     */
    onCancel: () => Promise<void>;
    /**
     * Button state
     */
    state?: SubmitButtonState;
    /**
     * Additional CSS class
     */
    className?: string;
    /**
     * Button size
     */
    size?: SubmitButtonSize;
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
    onSend,
    onCancel,
    state = 'enabled',
    className,
    size = 'm',
    qa,
}: SubmitButtonProps) {
    const isCancelable = state === 'cancelable';
    const isLoading = state === 'loading';
    const isDisabled = state === 'disabled';
    const iconData = isCancelable ? Stop : ArrowUp;
    let onClick;

    if (isCancelable) {
        onClick = onCancel;
    } else if (state === 'enabled') {
        onClick = onSend;
    }

    return (
        <Button
            view="action"
            size={size}
            color="brand"
            disabled={isDisabled}
            onClick={onClick}
            className={b({size, loading: isLoading, cancelable: isCancelable}, className)}
            qa={qa}
        >
            {isLoading ? (
                <div className={b('loader')}>
                    <Spin className={b('spinner')} size="xs" />
                </div>
            ) : (
                <Icon size={16} data={iconData} />
            )}
        </Button>
    );
}
