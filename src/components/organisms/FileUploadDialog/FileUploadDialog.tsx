import {Dialog} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {FileDropZone} from '../../molecules/FileDropZone';
import {FileItem, FileItemProps} from '../../molecules/FileItem';

import {i18n} from './i18n';

import './FileUploadDialog.scss';

const b = block('file-upload-dialog');

export type FileUploadDialogProps = {
    open: boolean;
    onClose: () => void;
    accept?: string;
    multiple?: boolean;
    /** Called immediately when files are added (before upload starts) */
    onAdd: (files: File[]) => void;
    /** Files to display in the list */
    files: (FileItemProps & {id?: string})[];
    /** Called when the Apply button is clicked. Defaults to onClose if not provided. */
    onApply?: () => void;
    /** Called when the Cancel button is clicked. Defaults to onClose if not provided. */
    onCancel?: () => void;
    title?: string;
    dropZoneLabel?: string;
    dropZoneHint?: string;
    applyButtonText?: string;
    cancelButtonText?: string;
    disabled?: boolean;
};

/**
 * FileUploadDialog presents a drag-and-drop zone and a list of queued files.
 * It is a pure UI component — upload logic is wired externally via `useFileUploadStore`.
 */
export const FileUploadDialog = ({
    open,
    onClose,
    accept,
    multiple = true,
    onAdd,
    files,
    onApply,
    onCancel,
    title = i18n('title'),
    dropZoneLabel,
    dropZoneHint,
    applyButtonText = i18n('apply-button'),
    cancelButtonText = i18n('cancel-button'),
    disabled,
}: FileUploadDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} className={b()}>
            <Dialog.Header caption={title} />
            <Dialog.Body className={b('body')}>
                <FileDropZone
                    accept={accept}
                    multiple={multiple}
                    onAdd={onAdd}
                    label={dropZoneLabel}
                    hint={dropZoneHint}
                    disabled={disabled}
                    className={b('drop-zone')}
                />
                {files.length > 0 && (
                    <div className={b('file-list')}>
                        {files.map((fileProps) => (
                            <FileItem key={fileProps.id ?? fileProps.name} {...fileProps} />
                        ))}
                    </div>
                )}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={onApply ?? onClose}
                onClickButtonCancel={onCancel ?? onClose}
                textButtonApply={applyButtonText}
                textButtonCancel={cancelButtonText}
                propsButtonApply={{
                    disabled:
                        disabled || files.length === 0 || files.some((f) => f.status === 'loading'),
                }}
            />
        </Dialog>
    );
};
