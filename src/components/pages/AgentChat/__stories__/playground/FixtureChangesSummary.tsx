import {useState} from 'react';

import {Dialog} from '@gravity-ui/uikit';

import {
    ChangedFilesSummary,
    type ChangedFilesSummaryProps,
} from '../../../../molecules/ChangedFilesSummary';

import {developerChanges} from './changedFilesFixture';
import {developerSteps} from './developerFlow';

/** Local file/source preview for the simulation; the host owns actual navigation. */
export function FixtureChangesSummary(
    props: Omit<ChangedFilesSummaryProps, 'onFileClick' | 'onViewChanges'>,
) {
    const [preview, setPreview] = useState(false);
    const [selectedId, setSelectedId] = useState<string>();
    const open = (id: string) => {
        setSelectedId(id);
        setPreview(true);
    };
    const files = props.files.filter((file) => file.id === selectedId);
    return (
        <>
            <ChangedFilesSummary {...props} onFileClick={(file) => open(file.id)} />
            <Dialog open={preview} onOpenChange={setPreview} aria-label="Fixture changes">
                <Dialog.Header caption={files[0]?.path ?? 'File changes'} />
                <Dialog.Body>
                    <p>
                        Local fixture preview. Undo reverts only this response's simulated change
                        summary; no Git or filesystem operation runs.
                    </p>
                    <div style={{maxHeight: '60vh', overflow: 'auto'}}>
                        {files.map((file) => (
                            <section key={file.id}>
                                <h4>{file.path}</h4>
                                {
                                    developerSteps[
                                        5 +
                                            developerChanges.files.findIndex(
                                                (item) => item.id === file.id,
                                            )
                                    ].body
                                }
                            </section>
                        ))}
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setPreview(false)}
                    textButtonCancel="Close"
                />
            </Dialog>
        </>
    );
}
