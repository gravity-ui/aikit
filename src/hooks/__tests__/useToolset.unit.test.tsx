/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import {act, renderHook} from '@testing-library/react';

import type {TChatMessage, TextMessageContent} from '../../types/messages';
import {
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

const DemoComponent = ({args}: {args: DemoArgs}) => <div>{args.value}</div>;

const demoToolset = createToolset(
    defineTool<DemoArgs, DemoResult>({
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

describe('useToolset', () => {
    it('defers onAfterResult to a microtask', async () => {
        let stored: TChatMessage<ToolPartContent>[] = buildMessages();
        const setMessages: React.Dispatch<React.SetStateAction<TChatMessage<ToolPartContent>[]>> = (
            updater,
        ) => {
            stored =
                typeof updater === 'function'
                    ? (
                          updater as (
                              prev: TChatMessage<ToolPartContent>[],
                          ) => TChatMessage<ToolPartContent>[]
                      )(stored)
                    : updater;
        };

        const onAfterResult = jest.fn();
        const {result} = renderHook(() =>
            useToolset({toolset: demoToolset, setMessages, onAfterResult}),
        );

        result.current.handleToolResult({
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'success',
            result: {ok: true},
        });

        expect(onAfterResult).not.toHaveBeenCalled();
        await act(async () => {
            await Promise.resolve();
        });
        expect(onAfterResult).toHaveBeenCalledTimes(1);
    });

    it('uses the latest onAfterResult ref across renders', async () => {
        let stored: TChatMessage<ToolPartContent>[] = buildMessages();
        const setMessages: React.Dispatch<React.SetStateAction<TChatMessage<ToolPartContent>[]>> = (
            updater,
        ) => {
            stored =
                typeof updater === 'function'
                    ? (
                          updater as (
                              prev: TChatMessage<ToolPartContent>[],
                          ) => TChatMessage<ToolPartContent>[]
                      )(stored)
                    : updater;
        };

        const first = jest.fn();
        const second = jest.fn();
        const {result, rerender} = renderHook(
            ({cb}: {cb: jest.Mock}) =>
                useToolset({toolset: demoToolset, setMessages, onAfterResult: cb}),
            {initialProps: {cb: first}},
        );

        rerender({cb: second});

        result.current.handleToolResult({
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'success',
            result: {ok: true},
        });
        await act(async () => {
            await Promise.resolve();
        });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('memoizes the registry across renders when inputs are stable', () => {
        let stored: TChatMessage<ToolPartContent>[] = buildMessages();
        const setMessages: React.Dispatch<React.SetStateAction<TChatMessage<ToolPartContent>[]>> = (
            updater,
        ) => {
            stored =
                typeof updater === 'function'
                    ? (
                          updater as (
                              prev: TChatMessage<ToolPartContent>[],
                          ) => TChatMessage<ToolPartContent>[]
                      )(stored)
                    : updater;
        };

        const {result, rerender} = renderHook(() =>
            useToolset({toolset: demoToolset, setMessages}),
        );
        const first = result.current.messageRendererRegistry;
        rerender();
        expect(result.current.messageRendererRegistry).toBe(first);
    });

    it('does not invoke onAfterResult when toolCallId is unknown', async () => {
        let stored: TChatMessage<ToolPartContent>[] = buildMessages();
        const setMessages: React.Dispatch<React.SetStateAction<TChatMessage<ToolPartContent>[]>> = (
            updater,
        ) => {
            stored =
                typeof updater === 'function'
                    ? (
                          updater as (
                              prev: TChatMessage<ToolPartContent>[],
                          ) => TChatMessage<ToolPartContent>[]
                      )(stored)
                    : updater;
        };

        const onAfterResult = jest.fn();
        const {result} = renderHook(() =>
            useToolset({toolset: demoToolset, setMessages, onAfterResult}),
        );

        result.current.handleToolResult({
            toolCallId: 'never-existed',
            toolName: 'demo',
            status: 'success',
            result: {ok: true},
        });
        await act(async () => {
            await Promise.resolve();
        });
        expect(onAfterResult).not.toHaveBeenCalled();
    });
});
