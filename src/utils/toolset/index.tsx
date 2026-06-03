import type {ComponentType} from 'react';

import {ToolMessage} from '../../components/organisms/ToolMessage';
import type {
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    ToolMessageContentData,
} from '../../types/messages';
import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../messageTypeRegistry';

import {i18n} from './i18n';

export type ToolSchemaResult<TArgs> =
    | {success: true; data: TArgs}
    | {success: false; error: {message: string}};

export type ToolSchema<TArgs> = {
    validate: (input: unknown) => ToolSchemaResult<TArgs>;
};

export type ToolComponentProps<TArgs, TResult> = {
    args: TArgs;
    result?: TResult;
    submitResult: (result: TResult) => void;
};

export type ToolExecutionStatus = 'success' | 'error' | 'cancelled';

/**
 * Discriminated outcome returned by a tool's `execute` callback.
 * A tool may also return a bare `TResult`; it is then treated as
 * `{status: 'success', result}` to keep simple cases boilerplate-free.
 */
export type ToolExecutionOutcome<TResult> =
    | {status: 'success'; result: TResult}
    | {status: 'error'; result?: TResult; error?: {message: string}}
    | {status: 'cancelled'; result?: TResult};

export type ToolDefinition<TArgs, TResult> = {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    schema: ToolSchema<TArgs>;
    component: ComponentType<ToolComponentProps<TArgs, TResult>>;
    /**
     * Run after the user submits a result inside the tool component.
     * Return:
     *  - `TResult` (or a Promise of one) for a successful execution;
     *  - a `ToolExecutionOutcome<TResult>` to explicitly report `error`
     *    or `cancelled`. A thrown error is surfaced as `{status: 'error'}`.
     */
    execute?: (params: {
        args: TArgs;
        result: TResult;
        toolCallId: string;
    }) =>
        | TResult
        | ToolExecutionOutcome<TResult>
        | Promise<TResult | ToolExecutionOutcome<TResult>>;
};

export type RuntimeToolDefinition = {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    validate: (input: unknown) => ToolSchemaResult<unknown>;
    /**
     * Rendered as `<Renderer ... />` JSX. Hooks placed at the top of this
     * component work normally because it is a real React component, not a
     * function called inside another render path.
     */
    Renderer: ComponentType<ToolComponentProps<unknown, unknown>>;
    execute: (params: {
        args: unknown;
        result: unknown;
        toolCallId: string;
    }) =>
        | unknown
        | ToolExecutionOutcome<unknown>
        | Promise<unknown | ToolExecutionOutcome<unknown>>;
};

export type Toolset = Record<string, RuntimeToolDefinition>;

export type ToolPartContentData<TArgs = unknown, TResult = unknown> = ToolMessageContentData & {
    toolCallId: string;
    args?: TArgs;
    result?: TResult;
};

export type ToolPartContent<TArgs = unknown, TResult = unknown> = TMessageContent<
    'tool',
    ToolPartContentData<TArgs, TResult>
>;

export type ToolsetResultEvent = {
    toolCallId: string;
    toolName: string;
    status: ToolExecutionStatus;
    result: unknown;
    error?: {message: string};
};

/**
 * Wrap a typed tool definition into an erased runtime entry that the
 * toolset renderer can dispatch by `toolName`.
 */
export function defineTool<TArgs, TResult>(
    definition: ToolDefinition<TArgs, TResult>,
): RuntimeToolDefinition {
    return {
        name: definition.name,
        description: definition.description,
        parameters: definition.parameters,
        validate: definition.schema.validate as (input: unknown) => ToolSchemaResult<unknown>,
        Renderer: definition.component as ComponentType<ToolComponentProps<unknown, unknown>>,
        execute: ({args, result, toolCallId}) =>
            definition.execute
                ? definition.execute({
                      args: args as TArgs,
                      result: result as TResult,
                      toolCallId,
                  })
                : result,
    };
}

/**
 * Build a `Toolset` from a list of `defineTool(...)` results. Keys are
 * derived from `definition.name`, so the call site cannot drift between
 * a literal-object key and the embedded `name`. Throws on duplicates.
 */
export function createToolset<const T extends readonly RuntimeToolDefinition[]>(
    ...tools: T
): {[K in T[number]['name']]: RuntimeToolDefinition} {
    const result: Record<string, RuntimeToolDefinition> = {};
    for (const tool of tools) {
        if (Object.prototype.hasOwnProperty.call(result, tool.name)) {
            throw new Error(`createToolset: duplicate tool name "${tool.name}"`);
        }
        result[tool.name] = tool;
    }
    return result as {[K in T[number]['name']]: RuntimeToolDefinition};
}

/**
 * Map a `Toolset` to the OpenAI `tools[]` shape so chat clients can pass
 * tool definitions to the model without reimplementing the conversion.
 */
export function toolsetToOpenAIDefinitions(toolset: Toolset): Array<{
    type: 'function';
    function: {name: string; description: string; parameters: Record<string, unknown>};
}> {
    return Object.values(toolset).map((tool) => ({
        type: 'function' as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        },
    }));
}

export type CreateToolsetRendererOptions = {
    onToolResult: (event: ToolsetResultEvent) => void;
    /**
     * Existing registry whose entries should be preserved. A shallow copy
     * is taken; the input reference is never mutated.
     */
    registry?: MessageRendererRegistry;
};

function isToolExecutionOutcome<TResult>(value: unknown): value is ToolExecutionOutcome<TResult> {
    if (!value || typeof value !== 'object') return false;
    const status = (value as {status?: unknown}).status;
    return status === 'success' || status === 'error' || status === 'cancelled';
}

function normalizeOutcome<TResult>(value: unknown): ToolExecutionOutcome<TResult> {
    if (isToolExecutionOutcome<TResult>(value)) return value;
    return {status: 'success', result: value as TResult};
}

/**
 * Build a `MessageRendererRegistry` whose `tool` renderer dispatches
 * by `toolName` into the provided toolset. Unknown tools and invalid
 * args fall back to a generic `<ToolMessage status="error" />`. Errors
 * thrown inside `execute` are surfaced via an `error` outcome.
 */
export function createToolsetRenderer(
    toolset: Toolset,
    options: CreateToolsetRendererOptions,
): MessageRendererRegistry {
    const {onToolResult} = options;
    const registry: MessageRendererRegistry = {
        ...(options.registry ?? createMessageRendererRegistry()),
    };

    registerMessageRenderer<ToolPartContent>(registry, 'tool', {
        component: ({part}) => {
            const toolPart = part.data;
            const toolDef = toolset[toolPart.toolName];

            if (!toolDef) {
                return (
                    <ToolMessage
                        toolName={toolPart.toolName}
                        status="error"
                        expandable
                        initialExpanded
                        bodyContent={i18n('fallback-unknown-tool', {
                            toolName: toolPart.toolName,
                        })}
                    />
                );
            }

            const validation = toolDef.validate(toolPart.args);
            if (!validation.success) {
                return (
                    <ToolMessage
                        toolName={toolPart.toolName}
                        status="error"
                        expandable
                        initialExpanded
                        bodyContent={validation.error.message}
                    />
                );
            }

            const submitResult = (result: unknown) => {
                Promise.resolve()
                    .then(() =>
                        toolDef.execute({
                            args: validation.data,
                            result,
                            toolCallId: toolPart.toolCallId,
                        }),
                    )
                    .then((raw) => normalizeOutcome(raw))
                    .catch(
                        (err): ToolExecutionOutcome<unknown> => ({
                            status: 'error',
                            error: {message: err instanceof Error ? err.message : String(err)},
                        }),
                    )
                    .then((outcome) => {
                        onToolResult({
                            toolCallId: toolPart.toolCallId,
                            toolName: toolPart.toolName,
                            status: outcome.status,
                            result: outcome.result,
                            error: 'error' in outcome ? outcome.error : undefined,
                        });
                    });
            };

            const {Renderer} = toolDef;
            return (
                <Renderer
                    args={validation.data}
                    result={toolPart.result}
                    submitResult={submitResult}
                />
            );
        },
    });

    return registry;
}

function isToolPartContent(part: TMessageContent): part is ToolPartContent {
    return part.type === 'tool' && typeof part.data === 'object' && part.data !== null;
}

function toContentParts<TCustom extends TMessageContent>(
    content: TAssistantMessage<TCustom>['content'],
): TMessageContent[] {
    if (typeof content === 'string') {
        return content ? [{type: 'text', data: {text: content}}] : [];
    }
    return Array.isArray(content) ? (content as TMessageContent[]) : [content as TMessageContent];
}

/**
 * Merge a tool result into the matching `tool` part of the chat history.
 * Honors `event.status` so the part reflects success / error / cancelled.
 * For backward compatibility, a missing `status` is treated as `'success'`.
 * Returns the original array reference when nothing matched, so React state
 * setters can skip needless updates.
 */
export function applyToolResult<TCustom extends TMessageContent = never>(
    messages: TChatMessage<TCustom>[],
    event: ToolsetResultEvent,
): TChatMessage<TCustom>[] {
    let changed = false;
    const status: ToolExecutionStatus = event.status ?? 'success';
    const isError = status === 'error';

    const next = messages.map((msg): TChatMessage<TCustom> => {
        if (msg.role !== 'assistant') return msg;

        const parts = toContentParts<TCustom>(msg.content);
        const hasMatch = parts.some(
            (part) => isToolPartContent(part) && part.data.toolCallId === event.toolCallId,
        );
        if (!hasMatch) return msg;

        changed = true;
        const updatedParts = parts.map((part) => {
            if (!isToolPartContent(part) || part.data.toolCallId !== event.toolCallId) {
                return part;
            }
            const nextData: ToolPartContentData = {
                ...part.data,
                status,
                result: event.result,
            };
            if (isError && event.error?.message) {
                nextData.bodyContent = event.error.message;
                nextData.expandable = true;
                nextData.initialExpanded = true;
            }
            return {
                ...part,
                data: nextData,
            };
        });

        return {
            ...msg,
            content: updatedParts as TAssistantMessage<TCustom>['content'],
        };
    });

    return changed ? next : messages;
}
