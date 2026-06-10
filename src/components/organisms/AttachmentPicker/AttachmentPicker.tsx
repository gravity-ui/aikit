import {useState} from 'react';

import {Paperclip} from '@gravity-ui/icons';
import {DropdownMenu, Icon} from '@gravity-ui/uikit';
import type {ButtonButtonProps} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {ActionButton} from '../../atoms/ActionButton';
import {FileUploadDialog, FileUploadDialogProps} from '../FileUploadDialog';

import {i18n} from './i18n';

import './AttachmentPicker.scss';

const b = block('attachment-picker');

export type AttachmentPickerProps = {
    /**
     * When true, clicking the button opens the upload dialog directly.
     * When false, a dropdown menu appears with "Upload file" and "Select from storage" options.
     */
    uploadOnly?: boolean;
    disabled?: boolean;
    /** Props forwarded to FileUploadDialog (open/onClose are managed internally) */
    fileDialogProps: Omit<FileUploadDialogProps, 'open' | 'onClose'>;
    /** Called when "Select from storage" is chosen (uploadOnly=false only) */
    onSelectFromStorage?: () => void;
    /** Button size */
    buttonSize?: ButtonButtonProps['size'];
    uploadLabel?: string;
    selectFromStorageLabel?: string;
    className?: string;
};

/**
 * AttachmentPicker renders a paperclip button that either opens a file upload dialog
 * directly (uploadOnly) or shows a dropdown with upload / select-from-storage options.
 */
export const AttachmentPicker = ({
    uploadOnly = true,
    disabled = false,
    fileDialogProps,
    onSelectFromStorage,
    buttonSize = 'm',
    uploadLabel = i18n('upload-label'),
    selectFromStorageLabel = i18n('select-from-storage-label'),
    className,
}: AttachmentPickerProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleUploadClick = () => setDialogOpen(true);

    const button = (
        <div className={b('button-wrapper')}>
            <ActionButton
                view="flat"
                size={buttonSize}
                onClick={uploadOnly ? handleUploadClick : undefined}
                disabled={disabled}
                className={b('button')}
            >
                <Icon data={Paperclip} size={16} />
            </ActionButton>
        </div>
    );

    return (
        <div className={b(null, className)}>
            {uploadOnly ? (
                button
            ) : (
                <DropdownMenu
                    disabled={disabled}
                    items={[
                        {
                            text: uploadLabel,
                            action: handleUploadClick,
                        },
                        {
                            text: selectFromStorageLabel,
                            action: () => onSelectFromStorage?.(),
                        },
                    ]}
                    renderSwitcher={(props) => (
                        <div className={b('button-wrapper')}>
                            <ActionButton
                                view="flat"
                                size={buttonSize}
                                disabled={disabled}
                                className={b('button')}
                                {...props}
                            >
                                <Icon data={Paperclip} size={16} />
                            </ActionButton>
                        </div>
                    )}
                />
            )}

            <FileUploadDialog
                {...fileDialogProps}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCancel={() => {
                    fileDialogProps.onCancel?.();
                    setDialogOpen(false);
                }}
            />
        </div>
    );
};
