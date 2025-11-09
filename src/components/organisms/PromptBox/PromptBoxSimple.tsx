import {block} from '../../../utils/cn';
import {PromptInputBody} from '../../molecules/PromptInputBody';
import {PromptInputFooter} from '../../molecules/PromptInputFooter';

import {PromptBoxBodyProps, PromptBoxFooterProps} from './types';
import {UsePromptBoxReturn} from './usePromptBox';

const b = block('prompt-box');

/**
 * Props for the PromptBoxSimple component
 */
export type PromptBoxSimpleProps = {
    /** Hook return value with state and handlers */
    hookState: UsePromptBoxReturn;
    /** Body/textarea-related props */
    bodyProps?: PromptBoxBodyProps;
    /** Footer-related props */
    footerProps?: PromptBoxFooterProps;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptBoxSimple component - simple view with just body and footer
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptBoxSimple(props: PromptBoxSimpleProps) {
    const {hookState, bodyProps = {}, footerProps = {}, className, qa} = props;

    const {
        placeholder = 'Plan, code, build and test anything',
        minRows = 1,
        maxRows = 15,
        autoFocus = false,
    } = bodyProps;

    const {
        bottomContent,
        showAttachment = false,
        onAttachmentClick,
        showMicrophone = false,
        onMicrophoneClick,
    } = footerProps;

    const {value, submitButtonState, handleChange, handleKeyDown, handleSubmit} = hookState;

    return (
        <div className={b({view: 'simple'}, className)} data-qa={qa}>
            <PromptInputBody
                value={value}
                placeholder={placeholder}
                minRows={minRows}
                maxRows={maxRows}
                autoFocus={autoFocus}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <PromptInputFooter
                submitButton={{
                    onClick: handleSubmit,
                    state: submitButtonState,
                }}
                showAttachment={showAttachment}
                onAttachmentClick={onAttachmentClick}
                showMicrophone={showMicrophone}
                onMicrophoneClick={onMicrophoneClick}
                buttonSize="l"
            >
                {bottomContent}
            </PromptInputFooter>
        </div>
    );
}
