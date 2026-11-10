import type {TChatMessage} from '../../../../../types';

import {stopRunMessages} from './stopRunMessages';

it('stores a settled cancellation instead of a still-running saved conversation', () => {
    const messages: TChatMessage[] = [
        {
            id: 'assistant',
            role: 'assistant',
            metadata: {activityState: 'running', activityStartedAt: 100, activityPausedAt: 400},
            content: [
                {
                    id: 'tool',
                    type: 'tool',
                    data: {toolName: 'Commit', status: 'waitingConfirmation'},
                },
            ],
        },
    ];
    const result = stopRunMessages(messages, 900, 200);
    expect(result[0].metadata).toEqual({
        activityState: 'stopped',
        responseState: 'cancelled',
        activityStartedAt: 100,
        activityFinishedAt: 900,
        activityPausedAt: undefined,
        activityPausedDuration: 200,
    });
    if (!Array.isArray(result[0].content)) {
        throw new Error('Expected parts');
    }
    const part = result[0].content[0];
    if (part.type !== 'tool') {
        throw new Error('Expected tool');
    }
    expect(part.data.status).toBe('cancelled');
    expect(messages[0].metadata?.activityState).toBe('running');
});

it('preserves settled history and its recorded duration', () => {
    const message: TChatMessage = {
        id: 'assistant',
        role: 'assistant',
        content: 'Done',
        metadata: {activityState: 'completed', activityFinishedAt: 500},
    };
    expect(stopRunMessages([message], 10000, 200)[0]).toBe(message);
});

it('settles cancellation during the final answer without extending recorded activity duration', () => {
    const message: TChatMessage = {
        id: 'assistant',
        role: 'assistant',
        content: 'Partial final answer',
        metadata: {
            activityState: 'completed',
            activityFinishedAt: 500,
            activityPausedDuration: 20,
            responseState: 'running',
        },
    };
    const result = stopRunMessages([message], 900, 100);
    expect(result[0].metadata?.responseState).toBe('cancelled');
    expect(result[0].metadata?.activityFinishedAt).toBe(500);
    expect(result[0].metadata?.activityPausedDuration).toBe(20);
});
