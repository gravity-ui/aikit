import type React from 'react';

import type {
    ToolCallErrorData,
    ToolCallMessageContent,
    ToolResultMessageContent,
} from '../types/messages';

import type {ArgsSchema} from './schema';

/**
 * Contextual information passed to every GenUI component, loading slot and error slot.
 * Carries identifiers that components need to scope their state, plus an opaque
 * `consumerContext` slot for app-specific data (auth, theme overrides, etc.).
 */
export type GenUIContext = {
    /** The `toolCallId` from the originating `tool-call` part. */
    toolCallId: string;
    /** The `toolName` from the originating `tool-call` part. */
    toolName: string;
    /** Optional id of the parent assistant message, if known. */
    messageId?: string;
    /** Opaque consumer-supplied payload; forwarded as-is. */
    consumerContext?: unknown;
};

/**
 * Props passed to every registered GenUI component.
 */
export type GenUIComponentProps<TArgs = unknown, TResult = unknown> = {
    /** Validated tool arguments. */
    args: TArgs;
    /** Lifecycle / addressing context. */
    context: GenUIContext;
    /**
     * Emit a result back to the host. Phase 1: emits a synthetic event via
     * `onToolResult` if wired; consumers append a `tool-result` part to history.
     */
    submitResult: (result: TResult) => void;
    /**
     * If the parent message already contains a `tool-result` for this `toolCallId`,
     * the component is mounted in "receipt mode" with the previous result here.
     */
    previousResult?: TResult;
};

/**
 * Props passed to the optional `loading` slot of a tool while the model is still
 * streaming arguments.
 */
export type GenUILoadingProps = {
    /** Raw partial-args text emitted so far (component may parse it itself). */
    partialArgsText?: string;
    context: GenUIContext;
};

/**
 * Props passed to the optional `error` slot of a tool when validation fails or
 * the model reports an `output-error`.
 */
export type GenUIErrorProps = {
    error: GenUIError;
    context: GenUIContext;
};

/**
 * Normalized error surfaced by the GenUI layer. The `code` discriminates origins
 * so consumers can branch (e.g. ignore `unknown-tool` while debugging schemas).
 */
export type GenUIError = {
    code: 'unknown-tool' | 'schema-validation' | 'render-error' | 'model-reported' | 'timeout';
    message: string;
    /** Underlying object for inspection — may be a Zod issue, AJV error, Error, etc. */
    cause?: unknown;
};

/**
 * Definition of one GenUI tool.
 *
 * @template TArgs   - inferred from `schema`
 * @template TResult - inferred from the registered component's `submitResult` callback
 */
export type GenUITool<TArgs = unknown, TResult = unknown> = {
    /** Stable identifier matched against `tool-call.data.toolName`. */
    name: string;
    /** Human-readable description (also forwarded by `describeGenUIRegistry`). */
    description?: string;
    /** Args validator (Zod or JSON Schema), normalized at registration time. */
    schema: ArgsSchema<TArgs>;
    /** Main component rendered once args validate. */
    component: React.ComponentType<GenUIComponentProps<TArgs, TResult>>;
    /** Optional override for the `input-streaming` placeholder. */
    loading?: React.ComponentType<GenUILoadingProps>;
    /** Optional override for the error slot (validation, model-reported, render). */
    error?: React.ComponentType<GenUIErrorProps>;
};

/**
 * A registry of tools, keyed by tool name.
 *
 * Use {@link createGenUIToolRegistry}, {@link registerGenUITool} and
 * {@link mergeGenUIToolRegistries} to construct or compose registries; do not
 * mutate the shape directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenUIToolRegistry = Record<string, GenUITool<any, any>>;

/**
 * Event payload emitted when a component calls `submitResult(...)`.
 *
 * AIKit never mutates `content[]`: hosts are responsible for appending the
 * matching `tool-result` part to their own chat history.
 */
export type ToolResultEvent<TResult = unknown> = {
    toolCallId: string;
    toolName: string;
    messageId?: string;
    result: TResult;
    /** A ready-to-append message-content part for convenience. */
    part: ToolResultMessageContent<TResult>;
};

/**
 * Event payload emitted on any lifecycle / error condition surfaced by the
 * default `tool-call` renderer.
 */
export type GenUIErrorEvent = {
    error: GenUIError;
    /** The originating `tool-call` part, when available. */
    part?: ToolCallMessageContent;
    messageId?: string;
};

/** @internal — narrowed shape of a model-reported error embedded in a `tool-call`. */
export type ToolCallReportedError = ToolCallErrorData;
