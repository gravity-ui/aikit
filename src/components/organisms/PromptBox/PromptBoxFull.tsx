import {block} from '../../../utils/cn';
import {PromptInputBody} from '../../molecules/PromptInputBody';
import {PromptInputFooter} from '../../molecules/PromptInputFooter';
import {PromptInputHeader} from '../../molecules/PromptInputHeader';

import {PromptBoxBodyProps, PromptBoxFooterProps, PromptBoxHeaderProps} from './types';
import {UsePromptBoxReturn} from './usePromptBox';

const b = block('prompt-box');

/**
 * Props for the PromptBoxFull component
 */
export type PromptBoxFullProps = {
    /** Hook return value with state and handlers */
    hookState: UsePromptBoxReturn;
    /** Header-related props */
    headerProps?: PromptBoxHeaderProps;
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
 * PromptBoxFull component - full view with header, body, and footer
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptBoxFull(props: PromptBoxFullProps) {
    const {hookState, headerProps = {}, bodyProps = {}, footerProps = {}, className, qa} = props;

    const {topContent, showContextIndicator = false, contextIndicatorProps} = headerProps;

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
    } = footerProps;

    const {value, submitButtonState, handleChange, handleKeyDown, handleSubmit} = hookState;

    const shouldShowHeader = topContent || showContextIndicator;
    const shouldShowFooter = true;

    return (
        <div className={b({view: 'full'}, className)} data-qa={qa}>
            {shouldShowHeader && (
                <PromptInputHeader
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
