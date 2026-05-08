import {CircleCheck, CircleXmark, Xmark} from '@gravity-ui/icons';
import {Icon, Spin} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {FileIcon} from '../../atoms/FileIcon';

import {i18n} from './i18n';

import './FileItem.scss';

const b = block('file-item');

export type FileItemStatus = 'loading' | 'success' | 'error';

export type FileItemProps = {
    name: string;
    size?: number;
    status?: FileItemStatus;
    mimeType?: string;
    /** Image preview URL (blob URL or data URL). Shown instead of file icon when provided. */
    previewUrl?: string;
    disabled?: boolean;
    onRemove?: () => void;
    className?: string;
};

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileItem displays a single file row with icon, name, optional size, status indicator, and remove button.
 */
export const FileItem = ({
    name,
    size,
    status,
    mimeType,
    previewUrl,
    disabled,
    onRemove,
    className,
}: FileItemProps) => {
    return (
        <div className={b({status, disabled}, className)}>
            <div className={b('icon')}>
                {previewUrl ? (
                    <img src={previewUrl} alt={name} className={b('preview')} />
                ) : (
                    <FileIcon mimeType={mimeType} fileName={name} size="m" />
                )}
            </div>
            <div className={b('info')}>
                <span className={b('name')} title={name}>
                    {name}
                </span>
                {size !== undefined && <span className={b('size')}>{formatSize(size)}</span>}
            </div>
            <div className={b('status')}>
                {status === 'loading' && <Spin size="xs" />}
                {status === 'success' && (
                    <Icon
                        data={CircleCheck}
                        size={16}
                        className={b('status-icon', {success: true})}
                    />
                )}
                {status === 'error' && (
                    <Icon
                        data={CircleXmark}
                        size={16}
                        className={b('status-icon', {error: true})}
                    />
                )}
            </div>
            {onRemove && (
                <button
                    type="button"
                    className={b('remove')}
                    onClick={onRemove}
                    disabled={disabled}
                    aria-label={i18n('remove-button-label')}
                >
                    <Icon data={Xmark} size={12} />
                </button>
            )}
        </div>
    );
};
