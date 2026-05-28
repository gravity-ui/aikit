import {useCallback, useMemo} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import {
    type GenUIErrorEvent,
    type GenUIToolRegistry,
    type ToolResultEvent,
    createToolCallRenderer,
    createToolResultRenderer,
} from '../../../genui';
import type {
    BaseMessageProps,
    TAssistantMessage,
    TMessageContent,
    TMessageContentUnion,
    TMessageMetadata,
    ToolCallMessageContent,
    ToolResultMessageContent,
} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {
    type MessageRendererRegistry,
    getMessageRenderer,
    mergeMessageRendererRegistries,
    registerMessageRenderer,
} from '../../../utils/messageTypeRegistry';
import {normalizeContent} from '../../../utils/messageUtils';
import {BaseMessage} from '../../molecules/BaseMessage';

import {createDefaultMessageRegistry} from './defaultMessageTypeRegistry';

import './AssistantMessage.scss';

type BaseMessagePick = Pick<
    BaseMessageProps,
    'actions' | 'extraInfo' | 'timestamp' | 'showActionsOnHover' | 'showTimestamp' | 'onActionPopup'
>;
type AssistantMessagePick<TContent extends TMessageContent> = Pick<
    TAssistantMessage<TContent, TMessageMetadata>,
    'id' | 'content' | 'userRating'
>;

export type AssistantMessageProps<TContent extends TMessageContent = never> = BaseMessagePick &
    AssistantMessagePick<TContent> & {
        messageRendererRegistry?: MessageRendererRegistry;
        transformOptions?: OptionsType;
        shouldParseIncompleteMarkdown?: boolean;
        className?: string;
        qa?: string;
        /**
         * Generative-UI tool registry. When provided, `tool-call` parts are
         * routed through the registered components and `tool-result` parts are
         * collapsed by default. Opt-in: zero overhead when omitted.
         */
        genUIRegistry?: GenUIToolRegistry;
        /** Called when a GenUI component invokes `submitResult(...)`. */
        onToolResult?: (event: ToolResultEvent) => void;
        /** Called on unknown tools, validation failures, render crashes and model-reported errors. */
        onGenUIError?: (event: GenUIErrorEvent) => void;
        /** Opaque payload forwarded to every GenUI component via `context.consumerContext`. */
        genUIConsumerContext?: unknown;
    };

const b = block('assistant-message');

export function AssistantMessage<TContent extends TMessageContent = never>({
    content,
    actions,
    extraInfo,
    timestamp,
    id,
    messageRendererRegistry,
    transformOptions,
    shouldParseIncompleteMarkdown,
    showActionsOnHover,
    showTimestamp,
    userRating,
    className,
    qa,
    onActionPopup,
    genUIRegistry,
    onToolResult,
    onGenUIError,
    genUIConsumerContext,
}: AssistantMessageProps<TContent>) {
    const parts = normalizeContent<TContent>(content);

    // Accessor over sibling parts for Phase-2 result re-hydration (ST6, T6).
    // Closure captures the current parts array; stable inside this render pass.
    const findSiblingResult = useCallback(
        (toolCallId: string): ToolResultMessageContent | undefined => {
            for (const candidate of parts) {
                if (
                    candidate &&
                    typeof candidate === 'object' &&
                    'type' in candidate &&
                    candidate.type === 'tool-result'
                ) {
                    const data = (candidate as ToolResultMessageContent).data;
                    if (data && data.toolCallId === toolCallId) {
                        return candidate as ToolResultMessageContent;
                    }
                }
            }
            return undefined;
        },
        [parts],
    );

    const registry = useMemo<MessageRendererRegistry>(() => {
        const defaultRegistry = createDefaultMessageRegistry(
            transformOptions,
            shouldParseIncompleteMarkdown,
        );

        // Register GenUI defaults before applying consumer overrides so
        // consumers can still replace the `tool-call` renderer wholesale.
        if (genUIRegistry) {
            registerMessageRenderer<ToolCallMessageContent>(
                defaultRegistry,
                'tool-call',
                createToolCallRenderer({
                    genUIRegistry,
                    onToolResult,
                    onGenUIError,
                    consumerContext: genUIConsumerContext,
                    messageId: id,
                    findSiblingResult,
                }),
            );
            registerMessageRenderer<ToolResultMessageContent>(
                defaultRegistry,
                'tool-result',
                createToolResultRenderer(),
            );
        }

        if (messageRendererRegistry) {
            return mergeMessageRendererRegistries(defaultRegistry, messageRendererRegistry);
        }

        return defaultRegistry;
    }, [
        messageRendererRegistry,
        transformOptions,
        shouldParseIncompleteMarkdown,
        genUIRegistry,
        onToolResult,
        onGenUIError,
        genUIConsumerContext,
        id,
        findSiblingResult,
    ]);

    if (parts.length === 0) {
        return null;
    }

    const renderPart = (part: TMessageContentUnion<TContent>, partIndex: number) => {
        const PartComponent = getMessageRenderer(registry, part.type);

        if (!PartComponent) {
            return null;
        }

        const key = part.id || `${id || 'message'}-part-${partIndex}`;

        return <PartComponent key={key} part={part} />;
    };

    return (
        <BaseMessage
            role="assistant"
            actions={actions}
            extraInfo={extraInfo}
            showActionsOnHover={showActionsOnHover}
            showTimestamp={showTimestamp}
            timestamp={timestamp}
            userRating={userRating}
            className={b(null, className)}
            qa={qa}
            onActionPopup={onActionPopup}
        >
            <div className={b('content')}>
                {parts.map((part, index) => renderPart(part, index))}
            </div>
        </BaseMessage>
    );
}
