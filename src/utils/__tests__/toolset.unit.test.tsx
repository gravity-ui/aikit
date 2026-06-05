/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import {act, render} from '@testing-library/react';

import type {TChatMessage, TextMessageContent} from '../../types/messages';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    type Toolset,
    type ToolsetResultEvent,
    applyToolResult,
    createToolset,
    createToolsetRenderer,
    defineTool,
    toolsetToOpenAIDefinitions,
} from '../toolset';

type DemoArgs = {value: string};
type DemoResult = {ok: boolean};

const okSchema = {
    validate: (input: unknown): ToolSchemaResult<DemoArgs> => {
        if (input && typeof input === 'object' && typeof (input as DemoArgs).value === 'string') {
            return {success: true, data: input as DemoArgs};
        }
        return {success: false, error: {message: 'invalid demo args'}};
    },
};

function DemoComponent(_props: ToolComponentProps<DemoArgs, DemoResult>) {
    return <div data-testid="demo">{_props.args.value}</div>;
}

function makeDemoTool<const TName extends string>(name: TName = 'demo.tool' as TName) {
    return defineTool({
        name,
        description: 'demo',
        parameters: {type: 'object'},
        schema: okSchema,
        component: DemoComponent,
    });
}

describe('defineTool', () => {
    it('passes through name/description/parameters', () => {
        const tool = makeDemoTool('demo.x');
        expect(tool.name).toBe('demo.x');
        expect(tool.description).toBe('demo');
        expect(tool.parameters).toEqual({type: 'object'});
    });

    it('exposes the user component identity-equal as Renderer', () => {
        const tool = defineTool({
            name: 'demo',
            description: '',
            parameters: {},
            schema: okSchema,
            component: DemoComponent,
        });
        expect(tool.Renderer).toBe(DemoComponent);
    });

    it('default execute echoes the result when user execute is omitted', async () => {
        const tool = defineTool({
            name: 'demo',
            description: '',
            parameters: {},
            schema: okSchema,
            component: DemoComponent,
        });
        const out = await tool.execute({
            args: {value: 'x'},
            result: {ok: true},
            toolCallId: 'c1',
        });
        expect(out).toEqual({ok: true});
    });
});

describe('createToolset', () => {
    it('keys output by definition.name', () => {
        const a = makeDemoTool('a');
        const b = makeDemoTool('b');
        const set = createToolset(a, b);
        expect(set).toEqual({a, b});
    });

    it('throws on duplicate names', () => {
        const a = makeDemoTool('dup');
        const b = makeDemoTool('dup');
        expect(() => createToolset(a, b)).toThrow(/duplicate tool name "dup"/);
    });

    it('returns an empty object for no tools', () => {
        expect(createToolset()).toEqual({});
    });

    it('preserves literal tool names in the return type', () => {
        const set = createToolset(makeDemoTool('alpha'), makeDemoTool('beta'));
        // Compile-time assertion: `set.alpha` and `set.beta` are typed; an
        // unknown key is rejected.
        const alpha = set.alpha;
        const beta = set.beta;
        // @ts-expect-error - 'gamma' is not in the toolset key union
        const gamma = set.gamma;
        expect(alpha.name).toBe('alpha');
        expect(beta.name).toBe('beta');
        expect(gamma).toBeUndefined();
    });
});

describe('toolsetToOpenAIDefinitions', () => {
    it('maps each tool to {type, function: {name, description, parameters}}', () => {
        const toolset = createToolset(makeDemoTool('a'), makeDemoTool('b'));
        expect(toolsetToOpenAIDefinitions(toolset)).toEqual([
            {
                type: 'function',
                function: {name: 'a', description: 'demo', parameters: {type: 'object'}},
            },
            {
                type: 'function',
                function: {name: 'b', description: 'demo', parameters: {type: 'object'}},
            },
        ]);
    });

    it('returns an empty array for an empty toolset', () => {
        expect(toolsetToOpenAIDefinitions({})).toEqual([]);
    });
});

describe('applyToolResult', () => {
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

    it('returns the same array reference when nothing matches', () => {
        const messages = buildMessages();
        const result = applyToolResult(messages, {
            toolCallId: 'missing',
            toolName: 'demo',
            status: 'success',
            result: {ok: true},
        });
        expect(result).toBe(messages);
    });

    it('writes result and status=success on match', () => {
        const messages = buildMessages();
        const result = applyToolResult(messages, {
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'success',
            result: {ok: true},
        });
        expect(result).not.toBe(messages);
        const parts = result[0]!.role === 'assistant' ? result[0]!.content : null;
        expect(Array.isArray(parts)).toBe(true);
        const toolPart = (parts as ToolPartContent[])[1];
        expect(toolPart.data.status).toBe('success');
        expect(toolPart.data.result).toEqual({ok: true});
    });

    it('honors status=error and writes error.message into bodyContent', () => {
        const messages = buildMessages();
        const result = applyToolResult(messages, {
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'error',
            result: undefined,
            error: {message: 'boom'},
        });
        const parts = (result[0] as {content: ToolPartContent[]}).content;
        expect(parts[1].data.status).toBe('error');
        expect(parts[1].data.bodyContent).toBe('boom');
        expect(parts[1].data.expandable).toBe(true);
        expect(parts[1].data.initialExpanded).toBe(true);
    });

    it('honors status=cancelled', () => {
        const messages = buildMessages();
        const result = applyToolResult(messages, {
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'cancelled',
            result: undefined,
        });
        const parts = (result[0] as {content: ToolPartContent[]}).content;
        expect(parts[1].data.status).toBe('cancelled');
    });

    it('defaults missing status to success for backward compat', () => {
        const messages = buildMessages();
        // Older callers may not have a `status` field on the event payload.
        const event = {
            toolCallId: 'call-1',
            toolName: 'demo',
            result: {ok: 1},
        } as unknown as ToolsetResultEvent;
        const result = applyToolResult(messages, event);
        const parts = (result[0] as {content: ToolPartContent[]}).content;
        expect(parts[1].data.status).toBe('success');
    });

    it('preserves non-tool parts and other tool parts', () => {
        const messages: TChatMessage<ToolPartContent>[] = [
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
        const result = applyToolResult(messages, {
            toolCallId: 'call-1',
            toolName: 'demo',
            status: 'success',
            result: 'done',
        });
        const parts = (result[0] as {content: ToolPartContent[]}).content;
        expect((parts[0] as unknown as TextMessageContent).data.text).toBe('hi');
        expect(parts[1].data.status).toBe('success');
        expect(parts[2].data.status).toBe('waitingConfirmation');
    });
});

describe('createToolsetRenderer', () => {
    const callTool = async (
        toolset: Toolset,
        toolPart: ToolPartContent,
        onToolResult = jest.fn(),
    ) => {
        const registry = createToolsetRenderer(toolset, {onToolResult});
        const ToolRenderer = registry.tool!.component;
        const utils = render(<ToolRenderer part={toolPart} />);
        return {registry, onToolResult, utils};
    };

    it('does NOT mutate the input registry', () => {
        const input = {};
        const out = createToolsetRenderer({}, {onToolResult: jest.fn(), registry: input});
        expect(input).toEqual({});
        expect(out).not.toBe(input);
        expect(out.tool).toBeDefined();
    });

    it('renders the i18n unknown-tool fallback when toolName is missing', async () => {
        const {utils} = await callTool({}, {
            type: 'tool',
            data: {toolName: 'ghost', toolCallId: 'c'},
        } as ToolPartContent);
        expect(utils.container.textContent).toContain('ghost');
    });

    it('renders the user-provided validation message', async () => {
        const tool = makeDemoTool('demo.tool');
        const toolset = createToolset(tool);
        const {utils} = await callTool(toolset, {
            type: 'tool',
            data: {toolName: 'demo.tool', toolCallId: 'c', args: {}},
        } as ToolPartContent);
        expect(utils.container.textContent).toContain('invalid demo args');
    });

    it('catches synchronous throws inside execute() as error outcome', async () => {
        const onToolResult = jest.fn();
        const tool = defineTool({
            name: 'probe',
            description: '',
            parameters: {},
            schema: okSchema,
            component: ({submitResult}: ToolComponentProps<DemoArgs, DemoResult>) => {
                React.useEffect(() => {
                    submitResult({ok: true});
                }, [submitResult]);
                return null;
            },
            execute: () => {
                throw new Error('sync boom');
            },
        });
        const registry = createToolsetRenderer(createToolset(tool), {onToolResult});
        const Renderer = registry.tool!.component;
        await act(async () => {
            render(
                <Renderer
                    part={
                        {
                            type: 'tool',
                            data: {toolName: 'probe', toolCallId: 'c', args: {value: 'x'}},
                        } as ToolPartContent
                    }
                />,
            );
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(onToolResult).toHaveBeenCalledTimes(1);
        const event = onToolResult.mock.calls[0]![0] as ToolsetResultEvent;
        expect(event.status).toBe('error');
        expect(event.error?.message).toBe('sync boom');
    });

    it('catches async rejections inside execute() as error outcome', async () => {
        const onToolResult = jest.fn();
        const tool = defineTool({
            name: 'probe',
            description: '',
            parameters: {},
            schema: okSchema,
            component: ({submitResult}: ToolComponentProps<DemoArgs, DemoResult>) => {
                React.useEffect(() => {
                    submitResult({ok: true});
                }, [submitResult]);
                return null;
            },
            execute: () => Promise.reject(new Error('async boom')),
        });
        const registry = createToolsetRenderer(createToolset(tool), {onToolResult});
        const Renderer = registry.tool!.component;
        await act(async () => {
            render(
                <Renderer
                    part={
                        {
                            type: 'tool',
                            data: {toolName: 'probe', toolCallId: 'c', args: {value: 'x'}},
                        } as ToolPartContent
                    }
                />,
            );
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(onToolResult).toHaveBeenCalledTimes(1);
        const event = onToolResult.mock.calls[0]![0] as ToolsetResultEvent;
        expect(event.status).toBe('error');
        expect(event.error?.message).toBe('async boom');
    });

    it('forwards an explicit error outcome from execute()', async () => {
        const onToolResult = jest.fn();
        const tool = defineTool({
            name: 'probe',
            description: '',
            parameters: {},
            schema: okSchema,
            component: ({submitResult}: ToolComponentProps<DemoArgs, DemoResult>) => {
                React.useEffect(() => {
                    submitResult({ok: true});
                }, [submitResult]);
                return null;
            },
            execute: () => ({status: 'error', error: {message: 'rejected'}}),
        });
        const registry = createToolsetRenderer(createToolset(tool), {onToolResult});
        const Renderer = registry.tool!.component;
        await act(async () => {
            render(
                <Renderer
                    part={
                        {
                            type: 'tool',
                            data: {toolName: 'probe', toolCallId: 'c', args: {value: 'x'}},
                        } as ToolPartContent
                    }
                />,
            );
            await Promise.resolve();
            await Promise.resolve();
        });
        const event = onToolResult.mock.calls[0]![0] as ToolsetResultEvent;
        expect(event.status).toBe('error');
        expect(event.error?.message).toBe('rejected');
    });

    it('wraps a bare result as a success outcome', async () => {
        const onToolResult = jest.fn();
        const tool = defineTool({
            name: 'probe',
            description: '',
            parameters: {},
            schema: okSchema,
            component: ({submitResult}: ToolComponentProps<DemoArgs, DemoResult>) => {
                React.useEffect(() => {
                    submitResult({ok: true});
                }, [submitResult]);
                return null;
            },
            execute: () => ({ok: true}),
        });
        const registry = createToolsetRenderer(createToolset(tool), {onToolResult});
        const Renderer = registry.tool!.component;
        await act(async () => {
            render(
                <Renderer
                    part={
                        {
                            type: 'tool',
                            data: {toolName: 'probe', toolCallId: 'c', args: {value: 'x'}},
                        } as ToolPartContent
                    }
                />,
            );
            await Promise.resolve();
            await Promise.resolve();
        });
        const event = onToolResult.mock.calls[0]![0] as ToolsetResultEvent;
        expect(event.status).toBe('success');
        expect(event.result).toEqual({ok: true});
    });
});
