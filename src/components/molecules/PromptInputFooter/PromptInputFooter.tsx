import {ReactNode} from 'react';

import {Microphone, Paperclip, Sliders} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {ButtonButtonProps} from '@gravity-ui/uikit';

import {getControlIconSize, useMobileControlSize} from '../../../hooks/useMobileControlSize';
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
    /**
     * Replaces the built-in attachment icon button with a custom node (e.g. AttachmentPicker).
     * When set, `showAttachment` and `onAttachmentClick` are ignored.
     */
    attachmentContent?: ReactNode;
    /** Show microphone icon */
    showMicrophone?: boolean;
    /** Microphone icon click handler */
    onMicrophoneClick?: () => void;
    /** Custom content to replace the default footer (SubmitButton will still be rendered) */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** Additional CSS class for the custom content wrapper */
    contentClassName?: string;
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
        attachmentContent,
        showMicrophone = false,
        onMicrophoneClick,
        children,
        className,
        contentClassName,
        buttonSize: buttonSizeProp,
        qa,
    } = props;

    const buttonSize = useMobileControlSize(buttonSizeProp, 'm', 'xl');
    const iconSize = getControlIconSize(buttonSize);

    // Render custom content with submit button
    if (children) {
        return (
            <div className={b(null, className)} data-qa={qa}>
                <div className={b('content', contentClassName)}>{children}</div>
                <div className={b('submit')}>
                    <SubmitButton {...submitButton} size={buttonSize} />
                </div>
            </div>
        );
    }

    const renderAttachment = () => {
        if (attachmentContent) return attachmentContent;
        if (!showAttachment) return null;
        return (
            <ActionButton
                view="flat"
                size={buttonSize}
                onClick={onAttachmentClick}
                className={b('action-button')}
                tooltipTitle={i18n('tooltip-attachment')}
            >
                <Icon data={Paperclip} size={iconSize} />
            </ActionButton>
        );
    };

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
                        <Icon data={Sliders} size={iconSize} />
                    </ActionButton>
                )}
            </ButtonGroup>
            <ButtonGroup>
                {renderAttachment()}
                {showMicrophone && (
                    <ActionButton
                        view="flat"
                        size={buttonSize}
                        onClick={onMicrophoneClick}
                        className={b('action-button')}
                        tooltipTitle={i18n('tooltip-microphone')}
                    >
                        <Icon data={Microphone} size={iconSize} />
                    </ActionButton>
                )}
                <SubmitButton {...submitButton} size={buttonSize} />
            </ButtonGroup>
        </div>
    );
}
