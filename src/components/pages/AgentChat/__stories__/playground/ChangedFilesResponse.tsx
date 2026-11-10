import {Button} from '@gravity-ui/uikit';

import type {TAssistantMessage} from '../../../../../types';
import {useChatLayoutChange} from '../../../../templates/ChatContentV2';

import {FixtureChangesSummary} from './FixtureChangesSummary';
import {getMessageChanges, getResponseState} from './changedFilesFixture';

/** Host-owned simulation controls. Undo only changes this run's local fixture baseline. */
export function ChangedFilesResponse({
    message,
    onUndo,
    onRestore,
}: {
    message: TAssistantMessage;
    onUndo: () => void;
    onRestore: () => void;
}) {
    const preserve = useChatLayoutChange();
    const state = getResponseState(message);
    if (state === 'running' || !state) {
        return null;
    }
    if (message.metadata?.changesUndone) {
        return (
            <div role="status">
                Simulated changes reverted.{' '}
                <Button onClick={() => preserve(onRestore)}>Restore fixture changes</Button>
            </div>
        );
    }
    // The fixture adapter supplies ordinary parts; custom run content is presentation-only.
    const changes = getMessageChanges(message);
    if (!changes) {
        return null;
    }
    const countLabel = `${changes.files.length} ${changes.files.length === 1 ? 'file' : 'files'}`;
    let label = `${countLabel} changed`;
    if (state === 'cancelled') {
        label = `${countLabel} changed before cancellation`;
    }
    if (state === 'error') {
        label = `${countLabel} changed before interruption`;
    }
    return (
        <FixtureChangesSummary
            view="card"
            files={changes.files}
            label={label}
            onUndo={() => preserve(onUndo)}
        />
    );
}
