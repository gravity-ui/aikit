/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import {act, renderHook} from '@testing-library/react';

import type {TChatMessage, TextMessageContent} from '../../types/messages';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    createToolset,
    defineTool,
} from '../../utils/toolset';
import {useToolset} from '../useToolset';

type DemoArgs = {value: string};
type DemoResult = {ok: boolean};

const okSchema = {
    validate: (input: unknown): ToolSchemaResult<DemoArgs> => ({
        success: true,
        data: input as DemoArgs,
    }),
};

const DemoComponent = (props: ToolComponentProps<DemoArgs, DemoResult>) => (
    <div>{props.args.value}</div>
);

const demoToolset = createToolset(
    defineTool({
        name: 'demo',
        description: '',
        parameters: {},
        schema: okSchema,
        component: DemoComponent,
    }),
);

const buildMessages = (): TChatMessage<ToolPartContent>[] => [
    {
        id: 'msg-1',
        role: 'assistant',
        content: [
            {type: 'text', data: {text: 'hi'}} as TextMessageContent,
            {
                type: 'tool',
                id: 'tool-1',
                data: {
                    toolName: 'demo',
                    toolCallId: 'call-1',
                    status: 'waitingConfirmation',
                },
            } as ToolPartContent,
        ],
    },
];

const makeSetMessages = (initial: TChatMessage<ToolPartContent>[]) => {
    const ref: {current: TChatMessage<ToolPartContent>[]} = {current: initial};
    const setMessages: React.Dispatch<React.SetStateAction<TChatMessage<ToolPartContent>[]>> = (
        updater,
    ) => {
        ref.current =
            typeof updater === 'function'
                ? (
                      updater as (
                          prev: TChatMessage<ToolPartContent>[],
                      ) => TChatMessage<ToolPartContent>[]
                  )(ref.current)
                : updater;
    };
    return {ref, setMessages};
};

describe('useToolset', () => {
    it('merges a tool result into the matching tool part', () => {
        const {ref, setMessages} = makeSetMessages(buildMessages());
        const {result} = renderHook(() => useToolset({toolset: demoToolset, setMessages}));

        act(() => {
            result.current.handleToolResult({
                toolCallId: 'call-1',
                toolName: 'demo',
                status: 'success',
                result: {ok: true},
            });
        });

        const toolPart = (ref.current[0].content as ToolPartContent[])[1];
        expect(toolPart.data.status).toBe('success');
        expect(toolPart.data.result).toEqual({ok: true});
    });

    it('keeps the messages array reference when toolCallId is unknown', () => {
        const {ref, setMessages} = makeSetMessages(buildMessages());
        const original = ref.current;
        const {result} = renderHook(() => useToolset({toolset: demoToolset, setMessages}));

        act(() => {
            result.current.handleToolResult({
                toolCallId: 'never-existed',
                toolName: 'demo',
                status: 'success',
                result: {ok: true},
            });
        });

        expect(ref.current).toBe(original);
    });

    it('memoizes the registry across renders when inputs are stable', () => {
        const {setMessages} = makeSetMessages(buildMessages());
        const {result, rerender} = renderHook(() =>
            useToolset({toolset: demoToolset, setMessages}),
        );
        const first = result.current.messageRendererRegistry;
        rerender();
        expect(result.current.messageRendererRegistry).toBe(first);
    });
});
