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
    } = headerProps;

    const {
        placeholder = 'Plan, code, build and test anything',
        minRows = 1,
        maxRows = 15,
        autoFocus = false,
    } = bodyProps;

    const {
        bottomContent,
        showSettings = false,
        onSettingsClick,
        showAttachment = false,
        onAttachmentClick,
        showMicrophone = false,
        onMicrophoneClick,
        submitButtonTooltipSend,
        submitButtonTooltipCancel,
        submitButtonCancelableText,
        submitButtonQa,
    } = footerProps;

    const {value, submitButtonState, handleChange, handleKeyDown, handleSubmit} = hookState;

    const shouldShowHeader = topContent || contextItems.length > 0 || showContextIndicator;
    const shouldShowFooter = true;

    return (
        <div className={b({view: 'full'}, className)} data-qa={qa}>
            {shouldShowHeader && (
                <PromptInputHeader
                    contextItems={contextItems}
                    showContextIndicator={showContextIndicator}
                    contextIndicatorProps={contextIndicatorProps}
                >
                    {topContent}
                </PromptInputHeader>
            )}

            <PromptInputBody
                value={value}
                placeholder={placeholder}
                minRows={minRows}
                maxRows={maxRows}
                autoFocus={autoFocus}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />

            {shouldShowFooter && (
                <PromptInputFooter
                    submitButton={{
                        onClick: handleSubmit,
                        state: submitButtonState,
                        tooltipSend: submitButtonTooltipSend,
                        tooltipCancel: submitButtonTooltipCancel,
                        cancelableText: submitButtonCancelableText,
                        qa: submitButtonQa || 'submit-button-full',
                    }}
                    showSettings={showSettings}
                    onSettingsClick={onSettingsClick}
                    showAttachment={showAttachment}
                    onAttachmentClick={onAttachmentClick}
                    showMicrophone={showMicrophone}
                    onMicrophoneClick={onMicrophoneClick}
                >
                    {bottomContent}
                </PromptInputFooter>
            )}
        </div>
    );
}
