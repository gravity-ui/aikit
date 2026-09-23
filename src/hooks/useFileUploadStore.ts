import {useCallback, useRef, useState} from 'react';

export type FileUploadEntry<Meta = {id: string; name: string}> =
    | {status: 'pending'; id: string; file: File}
    | {status: 'uploading'; id: string; file: File}
    | {status: 'done'; id: string; file: File; meta: Meta}
    | {status: 'error'; id: string; file: File; error: unknown};

export type UseFileUploadStoreOptions<Meta = {id: string; name: string}> = {
    /**
     * Called for each file to perform the actual upload.
     * Should return a promise resolving to file metadata.
     * Not called when `withoutApply` is true.
     */
    upload: (file: File) => Promise<Meta>;
    /** Maximum number of files allowed */
    maxFiles?: number;
    /**
     * When true, files are queued without starting the upload.
     * `onUpload` is called instead so the consumer can drive the upload externally.
     */
    withoutApply?: boolean;
    /** Called with newly added files when `withoutApply` is true */
    onUpload?: (files: File[]) => void;
};

export type UseFileUploadStoreReturn<Meta = {id: string; name: string}> = {
    entries: FileUploadEntry<Meta>[];
    isLoading: boolean;
    addFiles: (files: File[]) => void;
    removeFile: (id: string) => void;
    reset: () => void;
    uploadedMetas: Meta[];
};

/**
 * State machine for managing the file upload lifecycle.
 * The consumer provides an `upload` function — this hook never calls any API directly.
 */
export function useFileUploadStore<Meta = {id: string; name: string}>(
    options: UseFileUploadStoreOptions<Meta>,
): UseFileUploadStoreReturn<Meta> {
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const [entries, setEntries] = useState<FileUploadEntry<Meta>[]>([]);
    const entriesRef = useRef<FileUploadEntry<Meta>[]>([]);
    const updateEntries = useCallback(
        (update: (current: FileUploadEntry<Meta>[]) => FileUploadEntry<Meta>[]) => {
            const nextEntries = update(entriesRef.current);
            entriesRef.current = nextEntries;
            setEntries(nextEntries);
        },
        [],
    );
    const idCounterRef = useRef(0);
    const nextId = useCallback((): string => {
        idCounterRef.current += 1;
        return `file-${idCounterRef.current}`;
    }, []);

    const addFiles = useCallback(
        (files: File[]) => {
            const {upload: up, withoutApply: wa, onUpload: ou, maxFiles: mf} = optionsRef.current;
            const remaining =
                mf === undefined ? files.length : Math.max(0, mf - entriesRef.current.length);
            const filesToUpload = files.slice(0, remaining).map((file) => ({
                id: nextId(),
                file,
            }));

            if (filesToUpload.length === 0) return;

            updateEntries((current) => [
                ...current,
                ...filesToUpload.map(({id, file}) => ({status: 'pending' as const, id, file})),
            ]);

            if (wa) {
                ou?.(filesToUpload.map((entry) => entry.file));
                return;
            }

            for (const {id, file} of filesToUpload) {
                updateEntries((current) =>
                    current.map((e) =>
                        e.id === id ? {status: 'uploading' as const, id, file} : e,
                    ),
                );

                up(file)
                    .then((meta) => {
                        updateEntries((current) =>
                            current.map((e) =>
                                e.id === id ? {status: 'done' as const, id, file, meta} : e,
                            ),
                        );
                    })
                    .catch((error) => {
                        updateEntries((current) =>
                            current.map((e) =>
                                e.id === id ? {status: 'error' as const, id, file, error} : e,
                            ),
                        );
                    });
            }
        },
        [nextId, updateEntries],
    );

    const removeFile = useCallback(
        (id: string) => {
            updateEntries((current) => current.filter((entry) => entry.id !== id));
        },
        [updateEntries],
    );

    const reset = useCallback(() => {
        updateEntries(() => []);
    }, [updateEntries]);

    const isLoading = entries.some((e) => e.status === 'uploading');
    const uploadedMetas = entries
        .filter((e): e is Extract<FileUploadEntry<Meta>, {status: 'done'}> => e.status === 'done')
        .map((e) => e.meta);

    return {entries, isLoading, addFiles, removeFile, reset, uploadedMetas};
}
