import type {TChatMessage} from '../../../types';

import {type AgentChatRun, composeRunMessages} from './composeRunMessages';

it('retains explicit final content, run identity, ordered tool data and callbacks without mutation', () => {
    const onAccept = jest.fn();
    const input = {path: 'src/products.ts'};
    const output = {payload: {hash: 'abc123'}};
    const runs: AgentChatRun[] = [
        {
            messageId: 'assistant',
            activity: {
                id: 'run',
                state: 'needs-input',
                durationMs: 10000,
                steps: [
                    {
                        id: 'call',
                        kind: 'tool',
                        toolCallId: 'call',
                        input,
                        output,
                        props: {toolName: 'Commit', onAccept},
                    },
                ],
            },
        },
    ];
    const messages: TChatMessage[] = [
        {id: 'user', role: 'user', content: 'Fix it'},
        {
            id: 'assistant',
            role: 'assistant',
            content: [{id: 'answer', type: 'text', data: {text: 'Explicit answer'}}],
        },
    ];
    const result = composeRunMessages(messages, runs);
    expect(result[0]).toBe(messages[0]);
    const content = result[1].content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content)) {
        throw new Error('Expected parts');
    }
    expect(content[0]).toEqual({id: 'run', type: 'agent-run', data: runs[0].activity});
    expect(content[0].data).toBe(runs[0].activity);
    expect(content[1]).toBe((messages[1].content as unknown[])[0]);
    expect(messages[1].content).toHaveLength(1);
});

it('does not infer an activity or final boundary from text or tool completion', () => {
    const messages: TChatMessage[] = [
        {
            id: 'assistant',
            role: 'assistant',
            content: [
                {id: 'tool', type: 'tool', data: {toolName: 'Read', status: 'success'}},
                {id: 'commentary', type: 'text', data: {text: 'Still investigating'}},
            ],
        },
    ];
    expect(composeRunMessages(messages, [])[0]).toBe(messages[0]);
});
