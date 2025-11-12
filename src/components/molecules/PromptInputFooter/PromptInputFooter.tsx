import {ReactNode} from 'react';

import {Microphone, Paperclip, Sliders} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {ButtonButtonProps} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {SubmitButton, SubmitButtonProps} from '../../atoms/SubmitButton';
import {ButtonGroup} from '../ButtonGroup';

import {i18n} from './i18n';

import './PromptInputFooter.scss';

const b = block('prompt-input-footer');

/**
 * Props for the PromptInputFooter component
 */
export type PromptInputFooterProps = {
    /** Submit button props */
    submitButton: SubmitButtonProps;
    /** Show settings icon */
    showSettings?: boolean;
    /** Settings icon click handler */
    onSettingsClick?: () => void;
    /** Show attachment icon */
    showAttachment?: boolean;
    /** Attachment icon click handler */
    onAttachmentClick?: () => void;
    /** Show microphone icon */
    showMicrophone?: boolean;
    /** Microphone icon click handler */
    onMicrophoneClick?: () => void;
    /** Custom content to replace the default footer (SubmitButton will still be rendered) */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** Button size */
    buttonSize?: ButtonButtonProps['size'];
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputFooter component displays the footer section with action icons
 * and submit button
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputFooter(props: PromptInputFooterProps) {
    const {
        submitButton,
        showSettings = false,
        onSettingsClick,
        showAttachment = false,
        onAttachmentClick,
        showMicrophone = false,
        onMicrophoneClick,
        children,
        className,
        buttonSize = 'm',
        qa,
    } = props;

    // Render custom content with submit button
    if (children) {
        return (
            <div className={b(null, className)} data-qa={qa}>
                <div className={b('content')}>{children}</div>
                <div className={b('submit')}>
                    <SubmitButton {...submitButton} size={buttonSize} />
                </div>
            </div>
        );
    }

    // Render default footer
    return (
        <div className={b(null, className)} data-qa={qa}>
            <ButtonGroup>
                {showSettings && (
                    <ActionButton
                        view="flat"
                        size={buttonSize}
                        onClick={onSettingsClick}
                        className={b('action-button')}
                        tooltipTitle={i18n('tooltip-settings')}
                    >
                        <Icon data={Sliders} size={16} />
                    </ActionButton>
                )}
            </ButtonGroup>
            <ButtonGroup>
                {showAttachment && (
                    <ActionButton
                        view="flat"
                        size={buttonSize}
                        onClick={onAttachmentClick}
                        className={b('action-button')}
                        tooltipTitle={i18n('tooltip-attachment')}
                    >
                        <Icon data={Paperclip} size={16} />
                    </ActionButton>
                )}
                {showMicrophone && (
                    <ActionButton
                        view="flat"
                        size={buttonSize}
                        onClick={onMicrophoneClick}
                        className={b('action-button')}
                        tooltipTitle={i18n('tooltip-microphone')}
                    >
                        <Icon data={Microphone} size={16} />
                    </ActionButton>
                )}
                <SubmitButton {...submitButton} size={buttonSize} />
            </ButtonGroup>
        </div>
    );
}
