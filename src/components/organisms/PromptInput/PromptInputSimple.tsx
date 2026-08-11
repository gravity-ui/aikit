import {block} from '../../../utils/cn';
import {PromptInputBody} from '../../molecules/PromptInputBody';
import {PromptInputFooter} from '../../molecules/PromptInputFooter';

import {PromptInputBodyConfig, PromptInputFooterConfig} from './types';
import {UsePromptInputReturn} from './usePromptInput';

const b = block('prompt-input');

/**
 * Props for the PromptInputSimple component
 */
export type PromptInputSimpleProps = {
    /** Hook return value with state and handlers */
    hookState: UsePromptInputReturn;
    /** Body/textarea-related props */
    bodyProps?: PromptInputBodyConfig;
    /** Footer-related props */
    footerProps?: PromptInputFooterConfig;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputSimple component - simple view with just body and footer
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputSimple(props: PromptInputSimpleProps) {
    const {hookState, bodyProps = {}, footerProps = {}, className, qa} = props;

    const {
        placeholder = 'Plan, code, build and test anything',
        minRows = 1,
        maxRows = 15,
        autoFocus = false,
        inputRef,
        qa: bodyQa,
    } = bodyProps;

    const {
        bottomContent,
        className: footerClassName,
        contentClassName,
        buttonSize,
        submitButtonProps,
        showAttachment = false,
        onAttachmentClick,
        attachmentContent,
        showMicrophone = false,
        onMicrophoneClick,
        submitButtonTooltipSend,
        submitButtonTooltipCancel,
        submitButtonCancelableText,
        submitButtonQa,
        qa: footerQa,
    } = footerProps;

    const {value, submitButtonState, handleChange, handleKeyDown, handleSubmit} = hookState;

    return (
        <div className={b({view: 'simple'}, className)} data-qa={qa}>
            <div className={b('content')}>
                <PromptInputBody
                    value={value}
                    placeholder={placeholder}
                    minRows={minRows}
                    maxRows={maxRows}
                    autoFocus={autoFocus}
                    ref={inputRef}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    qa={bodyQa}
                />
                <PromptInputFooter
                    qa={footerQa}
                    className={footerClassName}
                    contentClassName={contentClassName}
                    submitButton={{
                        ...submitButtonProps,
                        onClick: handleSubmit,
                        state: submitButtonState,
                        tooltipSend: submitButtonProps?.tooltipSend ?? submitButtonTooltipSend,
                        tooltipCancel:
                            submitButtonProps?.tooltipCancel ?? submitButtonTooltipCancel,
                        cancelableText:
                            submitButtonProps?.cancelableText ?? submitButtonCancelableText,
                        qa: submitButtonProps?.qa ?? submitButtonQa ?? 'submit-button-simple',
                    }}
                    showAttachment={showAttachment}
                    onAttachmentClick={onAttachmentClick}
                    attachmentContent={attachmentContent}
                    showMicrophone={showMicrophone}
                    onMicrophoneClick={onMicrophoneClick}
                    buttonSize={buttonSize ?? 'l'}
                >
                    {bottomContent}
                </PromptInputFooter>
            </div>
        </div>
    );
}
