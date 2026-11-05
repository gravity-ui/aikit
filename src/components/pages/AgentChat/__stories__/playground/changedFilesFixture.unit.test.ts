import type {TAssistantMessage} from '../../../../../types';

import {developerChanges, getDeveloperChanges, getMessageChanges} from './changedFilesFixture';

function run(statuses: Array<'success' | 'loading'>, responseState = 'running'): TAssistantMessage {
    return {
        id: 'run',
        role: 'assistant',
        metadata: {responseState, activityState: 'completed'},
        content: statuses.map((status, index) => ({
            id: `run-tool-${index + 5}`,
            type: 'tool',
            data: {toolName: 'Edit', status},
        })),
    };
}

it('shows only completed edits while a response runs, including after activity completion', () => {
    expect(getDeveloperChanges([run(['loading'])], 'streaming')).toBeUndefined();
    const result = getDeveloperChanges([run(['success', 'loading'])], 'streaming');
    expect(result?.files).toEqual([developerChanges.files[0]]);
    expect([result?.added, result?.deleted]).toEqual([28, 0]);
});
it('moves data from the active pill to its message-local card at response completion', () => {
    const message = run(['success', 'success', 'success', 'success'], 'completed');
    expect(getDeveloperChanges([message], 'ready')).toBeUndefined();
    expect(getMessageChanges(message)?.files).toEqual(developerChanges.files);
    expect(getDeveloperChanges([message], 'submitted')).toBeUndefined();
    expect(
        getDeveloperChanges([message, {id: 'next', role: 'user', content: 'Next'}], 'ready'),
    ).toBeUndefined();
    expect(getMessageChanges(message)?.added).toBe(98);
});
it.each(['cancelled', 'error'])(
    'retains actual partial changes after %s without an active pill',
    (responseState) => {
        const message = run(['success', 'success', 'loading'], responseState);
        expect(getDeveloperChanges([message], 'ready')).toBeUndefined();
        expect(getMessageChanges(message)?.files).toEqual(developerChanges.files.slice(0, 2));
    },
);
it('applies fixture undo to its own run and clears on reset', () => {
    const message = run(['success'], 'completed');
    message.metadata = {...message.metadata, changesUndone: true};
    expect(getMessageChanges(message)).toBeUndefined();
    expect(getDeveloperChanges([], 'ready')).toBeUndefined();
    expect(getMessageChanges(run(['success'], 'completed'))?.files).toHaveLength(1);
});
