import React, {useCallback, useRef, useState} from 'react';

import {ArrowUpToLine} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';

import './FileDropZone.scss';

const b = block('file-drop-zone');

export type FileDropZoneProps = {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    onAdd: (files: File[]) => void;
    label?: string;
    hint?: string;
    className?: string;
};

/**
 * FileDropZone provides a drag-and-drop area plus a hidden file input for picking files.
 * Uses native HTML5 DnD — no external dependencies.
 */
export const FileDropZone = ({
    accept,
    multiple = true,
    disabled = false,
    onAdd,
    label,
    hint,
    className,
}: FileDropZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) return;
            const files = Array.from(fileList);
            onAdd(files);
        },
        [onAdd],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
        },
        [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled) return;
            handleFiles(e.dataTransfer.files);
        },
        [disabled, handleFiles],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFiles(e.target.files);
            // Reset input so the same file can be picked again
            e.target.value = '';
        },
        [handleFiles],
    );

    const handleClick = useCallback(() => {
        if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        },
        [handleClick],
    );

    return (
        <div
            className={b({dragging: isDragging, disabled}, className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className={b('input')}
                tabIndex={-1}
                aria-hidden
            />
            <Icon data={ArrowUpToLine} size={24} className={b('icon')} />
            <Text variant="body-2" className={b('label')}>
                {label ?? i18n('label')}
            </Text>
            {hint && (
                <Text variant="body-1" className={b('hint')}>
                    {hint}
                </Text>
            )}
        </div>
    );
};
