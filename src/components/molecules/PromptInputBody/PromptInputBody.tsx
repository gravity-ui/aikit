import {ReactNode, forwardRef} from 'react';

import type {TextAreaProps} from '@gravity-ui/uikit';
import {TextArea} from '@gravity-ui/uikit';

import {useMobileControlSize} from '../../../hooks/useMobileControlSize';
import {block} from '../../../utils/cn';

import './PromptInputBody.scss';

const b = block('prompt-input-body');

/**
 * Props for the PromptInputBody component
 */
export type PromptInputBodyProps = {
    /** Value of the textarea */
    value?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Maximum length of input */
    maxLength?: number;
    /** Size of the textarea. Defaults to `l`, or `xl` in mobile mode */
    size?: TextAreaProps['size'];
    /** Minimum number of rows */
    minRows?: number;
    /** Maximum number of rows */
    maxRows?: number;
    /** Auto focus on mount */
    autoFocus?: boolean;
    /** Disabled state for input */
    disabledInput?: boolean;
    /** Change handler */
    onChange?: (value: string) => void;
    /** Key down handler */
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    /** Custom content to replace the default textarea */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** Additional CSS class for input element */
    inputClassName?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputBody component displays the main input area
 * with textarea or custom content
 *
 * @param props - Component props
 * @returns React component
 */
export const PromptInputBody = forwardRef<HTMLTextAreaElement, PromptInputBodyProps>(
    (props, ref) => {
        const {
            value,
            placeholder,
            maxLength,
            size,
            minRows = 1,
            maxRows = 15,
            autoFocus = false,
            disabledInput = false,
            onChange,
            onKeyDown,
            children,
            className,
            inputClassName,
            qa,
        } = props;

        const resolvedSize = useMobileControlSize(size, 'l', 'xl');

        // If custom content is provided, render it
        if (children) {
            return (
                <div className={b(null, className)} data-qa={qa}>
                    {children}
                </div>
            );
        }

        // Render default textarea
        return (
            <div className={b(null, className)} data-qa={qa}>
                <TextArea
                    controlRef={ref}
                    size={resolvedSize}
                    value={value}
                    placeholder={placeholder}
                    minRows={minRows}
                    maxRows={maxRows}
                    autoFocus={autoFocus}
                    disabled={disabledInput}
                    onUpdate={onChange}
                    onKeyDown={onKeyDown}
                    view="clear"
                    className={b('textarea')}
                    controlProps={{
                        className: b('textarea-control', inputClassName),
                        maxLength,
                    }}
                />
            </div>
        );
    },
);

PromptInputBody.displayName = 'PromptInputBody';
