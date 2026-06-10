import {useCallback, useMemo} from 'react';

import {useFileUploadStore} from '../../../hooks/useFileUploadStore';
import type {FileAttachment} from '../../../types';
import {block} from '../../../utils/cn';
import {FileIcon} from '../../atoms/FileIcon';
import {AttachmentPicker} from '../../organisms/AttachmentPicker';

import {InputContext} from './InputContext';
import {i18n} from './i18n';
import type {
    InputContextMeta,
    InputContextProviderProps,
    PerSendFileParams,
    PrepareFilesForSendResult,
} from './types';

import './InputContext.scss';

const b = block('input-context');

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

/**
 * Provides prompt input attachment state: file queue, header context chips, and `AttachmentPicker`.
 */
export function InputContextProvider({
    children,
    fileUpload,
    fileDialogTitle,
}: InputContextProviderProps) {
    const {entries, addFiles, removeFile, reset, uploadedMetas} =
        useFileUploadStore<InputContextMeta>(fileUpload);

    const prepareFilesForSend = useCallback(
        async (inputAttachments?: File[]): Promise<PrepareFilesForSendResult> => {
            const storeFiles = entries.map((e) => e.file);
            const allFiles = [...storeFiles, ...(inputAttachments ?? [])];

            const imageFiles = allFiles.filter((f) => f.type.startsWith('image/'));
            const otherFiles = allFiles.filter((f) => !f.type.startsWith('image/'));
            const base64Images = await Promise.all(imageFiles.map(fileToBase64));

            const metaByName = new Map(uploadedMetas.map((m) => [m.name, m]));
            const fileAttachments: FileAttachment[] = otherFiles.map((f) => {
                const meta = metaByName.get(f.name);
                return {
                    id: meta?.id ?? f.name,
                    name: meta?.name ?? f.name,
                    mimeType: meta?.mimeType ?? (f.type || undefined),
                };
            });
            const fileIds = fileAttachments.map((f) => f.id);

            const perSendFileParams: PerSendFileParams = {
                fileAttachments,
                fileNames: allFiles.map((f) => f.name),
                ...(fileIds.length > 0 ? {fileIds} : {}),
            };

            return {
                base64Images,
                perSendFileParams,
            };
        },
        [entries, uploadedMetas],
    );

    const attachmentContent = useMemo(
        () => (
            <AttachmentPicker
                uploadOnly
                fileDialogProps={{
                    title: fileDialogTitle ?? i18n('dialog-title'),
                    multiple: true,
                    onCancel: reset,
                    onAdd: addFiles,
                    files: entries.map((entry) => ({
                        id: entry.id,
                        name: entry.file.name,
                        size: entry.file.size,
                        mimeType: entry.file.type || undefined,
                        status: (() => {
                            if (entry.status === 'uploading') return 'loading';
                            if (entry.status === 'done') return 'success';
                            if (entry.status === 'error') return 'error';
                            return undefined;
                        })(),
                        onRemove: () => removeFile(entry.id),
                    })),
                }}
            />
        ),
        [addFiles, entries, fileDialogTitle, removeFile, reset],
    );

    const contextItems = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                content: (
                    <span className={b('chip')}>
                        <FileIcon
                            fileName={entry.file.name}
                            mimeType={entry.file.type || undefined}
                            size="s"
                        />
                        {entry.file.name}
                    </span>
                ),
                onRemove: () => removeFile(entry.id),
            })),
        [entries, removeFile],
    );

    const value = useMemo(
        () => ({
            contextItems,
            attachmentContent,
            prepareFilesForSend,
            reset,
        }),
        [attachmentContent, contextItems, prepareFilesForSend, reset],
    );

    return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}
