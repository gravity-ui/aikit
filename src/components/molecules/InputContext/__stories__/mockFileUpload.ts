import type {UseFileUploadStoreOptions} from '../../../../hooks/useFileUploadStore';
import type {InputContextMeta} from '../types';

const MOCK_UPLOAD_DELAY_MS = 300;

/**
 * Demo/test upload pipeline for `InputContextProvider`. Simulates a short async upload
 * and returns metadata derived from the file itself. Do not use in production.
 */
export const mockInputContextFileUpload: UseFileUploadStoreOptions<InputContextMeta> = {
    upload: async (file) => {
        await new Promise((resolve) => {
            setTimeout(resolve, MOCK_UPLOAD_DELAY_MS);
        });
        return {id: file.name, name: file.name, mimeType: file.type || undefined};
    },
};
