import {block} from '../../../utils/cn';
import {PromptInputBody} from '../../molecules/PromptInputBody';
import {PromptInputFooter} from '../../molecules/PromptInputFooter';
import {PromptInputHeader} from '../../molecules/PromptInputHeader';

import {PromptInputBodyConfig, PromptInputFooterConfig, PromptInputHeaderConfig} from './types';
import {UsePromptInputReturn} from './usePromptInput';

const b = block('prompt-input');

/**
 * Props for the PromptInputFull component
 */
export type PromptInputFullProps = {
    /** Hook return value with state and handlers */
    hookState: UsePromptInputReturn;
    /** Header-related props */
    headerProps?: PromptInputHeaderConfig;
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
 * PromptInputFull component - full view with header, body, and footer
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputFull(props: PromptInputFullProps) {
    const {hookState, headerProps = {}, bodyProps = {}, footerProps = {}, className, qa} = props;

    const {
        topContent,
        contextItems = [],
        showContextIndicator = false,
        contextIndicatorProps,
        qa: headerQa,
    } = headerProps;

    const {
        placeholder = 'Plan, code, build and test anything',
        size: bodySize,
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
        showSettings = false,
        onSettingsClick,
        attachmentContent,
        showAttachment,
        onAttachmentClick,
        showMicrophone = false,
        onMicrophoneClick,
        submitButtonTooltipSend,
        submitButtonTooltipCancel,
        submitButtonCancelableText,
        submitButtonQa,
        qa: footerQa,
    } = footerProps;

    const {value, submitButtonState, handleChange, handleKeyDown, handleSubmit} = hookState;

    const shouldShowHeader = topContent || contextItems.length > 0 || showContextIndicator;

    return (
        <div className={b({view: 'full'}, className)} data-qa={qa}>
            {shouldShowHeader &&
                (topContent ? (
                    <PromptInputHeader qa={headerQa}>{topContent}</PromptInputHeader>
                ) : (
                    <PromptInputHeader
                        contextItems={contextItems}
                        showContextIndicator={showContextIndicator}
                        contextIndicatorProps={contextIndicatorProps}
                        qa={headerQa}
                    />
                ))}

            <PromptInputBody
                value={value}
                placeholder={placeholder}
                size={bodySize}
                minRows={minRows}
                maxRows={maxRows}
                autoFocus={autoFocus}
                ref={inputRef}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputClassName={b('textarea')}
                qa={bodyQa}
            />

            <PromptInputFooter
                qa={footerQa}
                className={footerClassName}
                contentClassName={contentClassName}
                buttonSize={buttonSize}
                submitButton={{
                    ...submitButtonProps,
                    onClick: handleSubmit,
                    state: submitButtonState,
                    tooltipSend: submitButtonProps?.tooltipSend ?? submitButtonTooltipSend,
                    tooltipCancel: submitButtonProps?.tooltipCancel ?? submitButtonTooltipCancel,
                    cancelableText: submitButtonProps?.cancelableText ?? submitButtonCancelableText,
                    qa: submitButtonProps?.qa ?? submitButtonQa ?? 'submit-button-full',
                }}
                showSettings={showSettings}
                onSettingsClick={onSettingsClick}
                showAttachment={showAttachment}
                onAttachmentClick={onAttachmentClick}
                attachmentContent={attachmentContent}
                showMicrophone={showMicrophone}
                onMicrophoneClick={onMicrophoneClick}
            >
                {bottomContent}
            </PromptInputFooter>
        </div>
    );
}
