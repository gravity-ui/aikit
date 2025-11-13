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
            <div className={b('content')}>
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
        </div>
    );
}
