import type {ComponentType, ReactNode} from 'react';

import {ToolMessage} from '../components/organisms/ToolMessage';
import type {
    TAssistantMessage,
    TChatMessage,
    TMessageContent,
    ToolMessageContentData,
} from '../types/messages';

import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from './messageTypeRegistry';

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

export type ToolDefinition<TArgs, TResult> = {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    schema: ToolSchema<TArgs>;
    component: ComponentType<ToolComponentProps<TArgs, TResult>>;
    execute?: (params: {
        args: TArgs;
        result: TResult;
        toolCallId: string;
    }) => TResult | Promise<TResult>;
};

export type RuntimeToolDefinition = {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    validate: (input: unknown) => ToolSchemaResult<unknown>;
    render: (props: {
        args: unknown;
        result?: unknown;
        submitResult: (result: unknown) => void;
    }) => ReactNode;
    execute: (params: {
        args: unknown;
        result: unknown;
        toolCallId: string;
    }) => unknown | Promise<unknown>;
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
    result: unknown;
};

/**
 * Wrap a typed tool definition into an erased runtime entry that the
 * toolset renderer can dispatch by `toolName`.
 */
export function defineTool<TArgs, TResult>(
    definition: ToolDefinition<TArgs, TResult>,
): RuntimeToolDefinition {
    const Component = definition.component;

    return {
        name: definition.name,
        description: definition.description,
        parameters: definition.parameters,
        validate: definition.schema.validate as (input: unknown) => ToolSchemaResult<unknown>,
        render: ({args, result, submitResult}) => (
            <Component
                args={args as TArgs}
                result={result as TResult | undefined}
                submitResult={submitResult as (result: TResult) => void}
            />
        ),
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

export type CreateToolsetRendererOptions = {
    onToolResult: (event: ToolsetResultEvent) => void;
    /**
     * Existing registry to extend instead of starting from a fresh one.
     * The `tool` renderer is overridden; other types are preserved.
     */
    registry?: MessageRendererRegistry;
};

/**
 * Build a `MessageRendererRegistry` whose `tool` renderer dispatches
 * by `toolName` into the provided toolset. Unknown tools and invalid
 * args fall back to a generic `<ToolMessage status="error" />`.
 */
export function createToolsetRenderer(
    toolset: Toolset,
    options: CreateToolsetRendererOptions,
): MessageRendererRegistry {
    const {onToolResult, registry = createMessageRendererRegistry()} = options;

    registerMessageRenderer<ToolPartContent>(registry, 'tool', {
        component: ({part}) => {
            const toolPart = part.data;
            const toolDef = toolset[toolPart.toolName];

            if (!toolDef) {
                return (
                    <ToolMessage
                        {...toolPart}
                        status="error"
                        expandable
                        initialExpanded
                        bodyContent={`Unknown tool: ${toolPart.toolName}`}
                    />
                );
            }

            const validation = toolDef.validate(toolPart.args);
            if (!validation.success) {
                return (
                    <ToolMessage
                        {...toolPart}
                        status="error"
                        expandable
                        initialExpanded
                        bodyContent={validation.error.message}
                    />
                );
            }

            const submitResult = (result: unknown) => {
                Promise.resolve(
                    toolDef.execute({
                        args: validation.data,
                        result,
                        toolCallId: toolPart.toolCallId,
                    }),
                ).then((finalResult) => {
                    onToolResult({
                        toolCallId: toolPart.toolCallId,
                        toolName: toolPart.toolName,
                        result: finalResult,
                    });
                });
            };

            return toolDef.render({
                args: validation.data,
                result: toolPart.result,
                submitResult,
            });
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
 * Returns the original array reference when nothing matched, so React state
 * setters can skip needless updates.
 */
export function applyToolResult<TCustom extends TMessageContent = never>(
    messages: TChatMessage<TCustom>[],
    event: ToolsetResultEvent,
): TChatMessage<TCustom>[] {
    let changed = false;

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
            return {
                ...part,
                data: {
                    ...part.data,
                    status: 'success' as const,
                    result: event.result,
                },
            };
        });

        return {
            ...msg,
            content: updatedParts as TAssistantMessage<TCustom>['content'],
        };
    });

    return changed ? next : messages;
}
