import {useCallback, useMemo, useRef} from 'react';

import type {ToolCallMessageContent, ToolResultMessageContent} from '../../types/messages';
import type {MessageContentComponentProps, MessageRenderer} from '../../utils/messageTypeRegistry';
import {getGenUITool} from '../registry';
import {validateArgs} from '../schema';
import type {
    GenUIContext,
    GenUIError,
    GenUIErrorEvent,
    GenUIToolRegistry,
    ToolResultEvent,
} from '../types';

import {DefaultErrorSlot} from './DefaultErrorSlot';
import {DefaultLoadingSkeleton} from './DefaultLoadingSkeleton';
import {ToolPartErrorBoundary} from './ToolPartErrorBoundary';
import {UnknownToolFallback} from './UnknownToolFallback';

export type ToolCallRendererOptions = {
    /** The GenUI tool registry. Required. */
    genUIRegistry: GenUIToolRegistry;
    /** Phase-2 result channel. When provided, components' `submitResult` calls flow through here. */
    onToolResult?: (event: ToolResultEvent) => void;
    /** Surface for unknown tools / schema-validation errors / render crashes / model-reported errors. */
    onGenUIError?: (event: GenUIErrorEvent) => void;
    /** Opaque payload forwarded into every component's `context.consumerContext`. */
    consumerContext?: unknown;
    /** Optional parent message id, threaded into events and context. */
    messageId?: string;
    /**
     * Optional accessor for sibling `tool-result` parts within the same message.
     * Phase-2 hook: `AssistantMessage` provides this so components can be
     * re-hydrated with `previousResult` on render.
     */
    findSiblingResult?: (toolCallId: string) => ToolResultMessageContent | undefined;
};

/**
 * Build a {@link MessageRenderer} for `tool-call` parts that resolves each part
 * through the supplied GenUI registry.
 *
 * Returned renderer is memoized on `part.id`/status inside the rendered
 * component to avoid remounting on adjacent text deltas (PF4, PF5).
 */
export function createToolCallRenderer(
    options: ToolCallRendererOptions,
): MessageRenderer<ToolCallMessageContent> {
    const Component = (props: MessageContentComponentProps<ToolCallMessageContent>) => (
        <ToolCallPart {...props} {...options} />
    );

    return {component: Component};
}

type ToolCallPartProps = MessageContentComponentProps<ToolCallMessageContent> &
    ToolCallRendererOptions;

function ToolCallPart({
    part,
    genUIRegistry,
    onToolResult,
    onGenUIError,
    consumerContext,
    messageId,
    findSiblingResult,
}: ToolCallPartProps) {
    const {toolCallId, toolName, status, args, partialArgsText, error: reportedError} = part.data;

    const tool = getGenUITool(genUIRegistry, toolName);

    const context = useMemo<GenUIContext>(
        () => ({toolCallId, toolName, messageId, consumerContext}),
        [toolCallId, toolName, messageId, consumerContext],
    );

    // Phase-2 idempotency guard (I11): each toolCallId may only resolve once.
    const submittedRef = useRef(false);

    const submitResult = useCallback(
        (result: unknown) => {
            if (!onToolResult) return;
            if (submittedRef.current) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[aikit/genui] submitResult called twice for toolCallId="${toolCallId}"; ignoring`,
                    );
                }
                return;
            }
            submittedRef.current = true;
            const partOut: ToolResultMessageContent = {
                type: 'tool-result',
                data: {toolCallId, toolName, result},
            };
            onToolResult({toolCallId, toolName, result, messageId, part: partOut});
        },
        [onToolResult, toolCallId, toolName, messageId],
    );

    const reportError = useCallback(
        (error: GenUIError) => {
            onGenUIError?.({error, part, messageId});
        },
        [onGenUIError, part, messageId],
    );

    // F3, E1 — unknown tool: log once + fallback UI.
    if (!tool) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn(`[aikit/genui] Unknown tool "${toolName}" — no entry in genUIRegistry`);
        }
        reportError({
            code: 'unknown-tool',
            message: `No registered GenUI component for tool "${toolName}"`,
        });
        return <UnknownToolFallback part={part} />;
    }

    const LoadingSlot = tool.loading ?? DefaultLoadingSkeleton;
    const ErrorSlot = tool.error ?? DefaultErrorSlot;

    if (status === 'input-streaming') {
        return <LoadingSlot partialArgsText={partialArgsText} context={context} />;
    }

    if (status === 'output-error') {
        const error: GenUIError = {
            code: 'model-reported',
            message: reportedError?.message ?? 'Tool execution failed',
            cause: reportedError?.cause,
        };
        reportError(error);
        return <ErrorSlot error={error} context={context} />;
    }

    // Both `input-available` and `output-available` require validated args.
    const validation = validateArgs(tool.schema, args);
    if (!validation.success) {
        reportError(validation.error);
        return <ErrorSlot error={validation.error} context={context} />;
    }

    const ToolComponent = tool.component;
    const previousResult =
        status === 'output-available' && findSiblingResult
            ? (findSiblingResult(toolCallId)?.data.result as unknown)
            : undefined;

    return (
        <ToolPartErrorBoundary context={context} onError={reportError}>
            <ToolComponent
                args={validation.data}
                context={context}
                submitResult={submitResult}
                previousResult={previousResult}
            />
        </ToolPartErrorBoundary>
    );
}
