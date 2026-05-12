import type {ReactNode} from 'react';

import type {UseFileUploadStoreOptions} from '../../../hooks/useFileUploadStore';
import type {FileAttachment} from '../../../types';
import type {ContextItemConfig} from '../PromptInputHeader';

/** File metadata returned by the upload handler for the input context store. */
export type InputContextMeta = {
    id: string;
    name: string;
    mimeType?: string;
};

/** Request-body fields contributed by the file queue for a single send. */
export type PerSendFileParams = {
    fileIds?: string[];
    fileAttachments: FileAttachment[];
    fileNames: string[];
};

/** Payload derived from queued files for a single send (images + file references). */
export type PrepareFilesForSendResult = {
    base64Images: string[];
    perSendFileParams: PerSendFileParams;
};

/** React context value: header chips, attachment slot, and send preparation helpers. */
export type InputContextValue = {
    contextItems: ContextItemConfig[];
    attachmentContent: ReactNode;
    prepareFilesForSend: (inputAttachments?: File[]) => Promise<PrepareFilesForSendResult>;
    reset: () => void;
};

export type InputContextProviderProps = {
    children: ReactNode;
    /** Options for `useFileUploadStore`. The consumer fully owns the upload pipeline. */
    fileUpload: UseFileUploadStoreOptions<InputContextMeta>;
    /** Title of the file attachment dialog. Defaults to a localized "Attach files". */
    fileDialogTitle?: string;
};
