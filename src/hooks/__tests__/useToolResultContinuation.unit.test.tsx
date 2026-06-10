import {renderHook} from '@testing-library/react';

import type {TChatMessage} from '../../types/messages';
import type {TToolStatus} from '../../types/tool';
import type {ToolPartContent} from '../../utils/toolset';
import {findNewlySettledTools, useToolResultContinuation} from '../useToolResultContinuation';

const buildToolMessages = (
    status: TToolStatus,
    overrides: Partial<{toolCallId: string; toolName: string; result: unknown}> = {},
): TChatMessage<ToolPartContent>[] => [
    {
        id: 'msg-1',
        role: 'assistant',
        content: [
            {
                type: 'tool',
                id: 'tool-1',
                data: {
                    toolName: overrides.toolName ?? 'demo',
                    toolCallId: overrides.toolCallId ?? 'call-1',
                    status,
                    result: overrides.result,
                },
            } as ToolPartContent,
        ],
    },
];

const buildSingleToolMessage = (status: TToolStatus): TChatMessage<ToolPartContent>[] => [
    {
        id: 'msg-1',
        role: 'assistant',
        content: {
            type: 'tool',
            id: 'tool-1',
            data: {
                toolName: 'demo',
                toolCallId: 'call-1',
                status,
            },
        } as ToolPartContent,
    },
];

describe('findNewlySettledTools', () => {
    it('returns one event for pending → success', () => {
        const events = findNewlySettledTools(
            buildToolMessages('waitingConfirmation'),
            buildToolMessages('success', {result: {ok: true}}),
        );
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'success',
        });
    });

    it('returns an event for each transition status (error, cancelled)', () => {
        expect(
            findNewlySettledTools(
                buildToolMessages('waitingConfirmation'),
                buildToolMessages('error'),
            ),
        ).toHaveLength(1);
        expect(
            findNewlySettledTools(
                buildToolMessages('waitingSubmission'),
                buildToolMessages('cancelled'),
            ),
        ).toHaveLength(1);
        expect(
            findNewlySettledTools(buildToolMessages('loading'), buildToolMessages('success')),
        ).toHaveLength(1);
    });

    it('returns empty when both snapshots are terminal (replay)', () => {
        expect(
            findNewlySettledTools(buildToolMessages('success'), buildToolMessages('success')),
        ).toHaveLength(0);
    });

    it('returns empty when the tool first appears already terminal', () => {
        expect(findNewlySettledTools([], buildToolMessages('success'))).toHaveLength(0);
    });

    it('handles a single tool content part', () => {
        expect(
            findNewlySettledTools(
                buildSingleToolMessage('waitingConfirmation'),
                buildSingleToolMessage('success'),
            ),
        ).toHaveLength(1);
    });

    it('returns empty while the tool is still pending', () => {
        expect(
            findNewlySettledTools(
                buildToolMessages('waitingConfirmation'),
                buildToolMessages('waitingSubmission'),
            ),
        ).toHaveLength(0);
    });

    it('handles multiple tools transitioning in the same step', () => {
        const prev: TChatMessage<ToolPartContent>[] = [
            ...buildToolMessages('waitingConfirmation'),
            {
                id: 'msg-2',
                role: 'assistant',
                content: [
                    {
                        type: 'tool',
                        id: 'tool-2',
                        data: {
                            toolName: 'demo',
                            toolCallId: 'call-2',
                            status: 'waitingConfirmation',
                        },
                    } as ToolPartContent,
                ],
            },
        ];
        const next = prev.map((msg) => {
            if (msg.role !== 'assistant' || !Array.isArray(msg.content)) return msg;
            return {
                ...msg,
                content: msg.content.map((part) =>
                    part.type === 'tool'
                        ? {
                              ...part,
                              data: {
                                  ...(part as ToolPartContent).data,
                                  status: 'success' as TToolStatus,
                                  result: {ok: true},
                              },
                          }
                        : part,
                ),
            } as TChatMessage<ToolPartContent>;
        });
        const events = findNewlySettledTools(prev, next);
        expect(events.map((e) => e.toolCallId).sort()).toEqual(['call-1', 'call-2']);
    });
});

describe('useToolResultContinuation', () => {
    type HookProps = {
        messages: TChatMessage<ToolPartContent>[];
        onSettled: jest.Mock;
    };

    const renderContinuation = (initial: HookProps) =>
        renderHook(
            ({messages, onSettled}: HookProps) => useToolResultContinuation({messages, onSettled}),
            {initialProps: initial},
        );

    it('does not fire on the initial render with a pending tool', () => {
        const onSettled = jest.fn();
        renderContinuation({
            messages: buildToolMessages('waitingConfirmation'),
            onSettled,
        });
        expect(onSettled).not.toHaveBeenCalled();
    });

    it('fires after a newly added pending tool later settles', () => {
        const onSettled = jest.fn();
        const {rerender} = renderContinuation({messages: [], onSettled});

        rerender({messages: buildToolMessages('waitingConfirmation'), onSettled});
        expect(onSettled).not.toHaveBeenCalled();

        rerender({messages: buildToolMessages('success'), onSettled});
        expect(onSettled).toHaveBeenCalledTimes(1);
    });

    it('fires once when a tool transitions from pending to success', () => {
        const onSettled = jest.fn();
        const {rerender} = renderContinuation({
            messages: buildToolMessages('waitingConfirmation'),
            onSettled,
        });
        rerender({
            messages: buildToolMessages('success', {result: {ok: true}}),
            onSettled,
        });
        expect(onSettled).toHaveBeenCalledTimes(1);
        expect(onSettled).toHaveBeenCalledWith(
            expect.objectContaining({toolCallId: 'call-1', status: 'success'}),
        );
    });

    it('does not fire for tools that are already terminal on first render', () => {
        const onSettled = jest.fn();
        const {rerender} = renderContinuation({
            messages: buildToolMessages('success'),
            onSettled,
        });
        rerender({messages: buildToolMessages('success'), onSettled});
        rerender({messages: [...buildToolMessages('success')], onSettled});
        expect(onSettled).not.toHaveBeenCalled();
    });

    it('uses the latest onSettled across renders', () => {
        const first = jest.fn();
        const second = jest.fn();
        const {rerender} = renderContinuation({
            messages: buildToolMessages('waitingConfirmation'),
            onSettled: first,
        });
        rerender({
            messages: buildToolMessages('waitingConfirmation'),
            onSettled: second,
        });
        rerender({
            messages: buildToolMessages('success', {result: {ok: true}}),
            onSettled: second,
        });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('does not fire again when messages re-render with the same terminal state', () => {
        const onSettled = jest.fn();
        const {rerender} = renderContinuation({
            messages: buildToolMessages('waitingConfirmation'),
            onSettled,
        });
        rerender({messages: buildToolMessages('success'), onSettled});
        expect(onSettled).toHaveBeenCalledTimes(1);
        // New array, same terminal status — no second fire.
        rerender({messages: [...buildToolMessages('success')], onSettled});
        expect(onSettled).toHaveBeenCalledTimes(1);
    });
});
