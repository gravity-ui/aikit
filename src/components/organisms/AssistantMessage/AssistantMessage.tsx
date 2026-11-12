import {type HTMLAttributes, type ReactNode, memo, useMemo} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {MarkdownRendererMdxOptions, MermaidOptions} from '../../../markdown/types';
import type {
    BaseMessageProps,
    TAssistantMessage,
    TMessageContent,
    TMessageContentUnion,
    TMessageMetadata,
    ThinkingMessageContent,
} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {
    type MessageRendererRegistry,
    getMessageRenderer,
    mergeMessageRendererRegistries,
} from '../../../utils/messageTypeRegistry';
import {normalizeContent} from '../../../utils/messageUtils';
import {MessageMarkdownContext} from '../../internal/MessageMarkdownContext';
import {BaseMessage} from '../../molecules/BaseMessage';
import {ActivityList} from '../ActivityList/ActivityList';
import {groupThinkingMessages, thinkingMessageToStep} from '../ActivityList/utils';

import {createDefaultMessageRegistry} from './defaultMessageTypeRegistry';

import './AssistantMessage.scss';

type BaseMessagePick = Pick<
    BaseMessageProps,
    | 'data-message-id'
    | 'actions'
    | 'extraInfo'
    | 'timestamp'
    | 'showActionsOnHover'
    | 'showTimestamp'
    | 'onActionPopup'
>;
type AssistantMessagePick<TContent extends TMessageContent> = Pick<
    TAssistantMessage<TContent, TMessageMetadata>,
    'id' | 'content' | 'userRating'
>;

export type AssistantMessageProps<TContent extends TMessageContent = never> = BaseMessagePick &
    AssistantMessagePick<TContent> & {
        /** Content after message parts and before the actions/timestamp. */
        footerContent?: ReactNode;
        messageRendererRegistry?: MessageRendererRegistry;
        /** Opt in to grouping adjacent legacy thinking parts. Custom thinking renderers take precedence. */
        thinkingMessageView?: 'default' | 'grouped';
        transformOptions?: OptionsType;
        shouldParseIncompleteMarkdown?: boolean;
        mermaidOptions?: MermaidOptions;
        openMarkdownLinksInNewTab?: boolean;
        mdxOptions?: MarkdownRendererMdxOptions;
        mdxContext?: Record<string, unknown>;
        /** Extra props forwarded to the root container `div` of each rendered markdown block. */
        markdownExtraProps?: HTMLAttributes<HTMLDivElement>;
        className?: string;
        qa?: string;
    };

const b = block('assistant-message');

function AssistantMessageComponent<TContent extends TMessageContent = never>({
    content,
    footerContent,
    actions,
    extraInfo,
    timestamp,
    id,
    messageRendererRegistry,
    thinkingMessageView,
    transformOptions,
    shouldParseIncompleteMarkdown,
    mermaidOptions,
    openMarkdownLinksInNewTab,
    mdxOptions,
    mdxContext,
    markdownExtraProps,
    showActionsOnHover,
    showTimestamp,
    userRating,
    className,
    qa,
    'data-message-id': messageId,
    onActionPopup,
}: AssistantMessageProps<TContent>) {
    const registry = useMemo<MessageRendererRegistry>(() => {
        const defaultRegistry = createDefaultMessageRegistry(
            transformOptions,
            shouldParseIncompleteMarkdown,
            openMarkdownLinksInNewTab,
            mdxOptions,
            mdxContext,
            markdownExtraProps,
            mermaidOptions,
        );
        if (messageRendererRegistry) {
            return mergeMessageRendererRegistries(defaultRegistry, messageRendererRegistry);
        }

        return defaultRegistry;
    }, [
        messageRendererRegistry,
        transformOptions,
        shouldParseIncompleteMarkdown,
        mermaidOptions,
        openMarkdownLinksInNewTab,
        mdxOptions,
        mdxContext,
        markdownExtraProps,
    ]);

    const markdownOptions = useMemo(
        () => ({
            transformOptions,
            mermaidOptions,
            openMarkdownLinksInNewTab,
            mdxOptions,
            mdxContext,
            markdownExtraProps,
        }),
        [
            transformOptions,
            mermaidOptions,
            openMarkdownLinksInNewTab,
            mdxOptions,
            mdxContext,
            markdownExtraProps,
        ],
    );

    const parts = useMemo(() => normalizeContent<TContent>(content), [content]);

    const groupedParts =
        thinkingMessageView === 'grouped' && !messageRendererRegistry?.thinking
            ? groupThinkingMessages(parts, {
                  getStep: (part, index) =>
                      part.type === 'thinking'
                          ? thinkingMessageToStep(
                                part.id ?? `${id ?? 'message'}-part-${index}`,
                                (part as ThinkingMessageContent).data,
                            )
                          : undefined,
                  getGroupKey: () => id ?? 'message',
              })
            : undefined;

    if (parts.length === 0 && !footerContent) {
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
            data-message-id={messageId}
            onActionPopup={onActionPopup}
        >
            <MessageMarkdownContext.Provider value={markdownOptions}>
                <div className={b('content')}>
                    {groupedParts
                        ? groupedParts.map((entry) =>
                              entry.type === 'item' ? (
                                  renderPart(entry.item, entry.index)
                              ) : (
                                  <ActivityList
                                      key={entry.id}
                                      steps={entry.steps}
                                      format="markdown"
                                      transformOptions={transformOptions}
                                      mermaidOptions={mermaidOptions}
                                      openMarkdownLinksInNewTab={openMarkdownLinksInNewTab}
                                      mdxOptions={mdxOptions}
                                      mdxContext={mdxContext}
                                      markdownExtraProps={markdownExtraProps}
                                  />
                              ),
                          )
                        : parts.map((part, index) => renderPart(part, index))}
                    {footerContent}
                </div>
            </MessageMarkdownContext.Provider>
        </BaseMessage>
    );
}

const MemoizedAssistantMessage = memo(AssistantMessageComponent);
MemoizedAssistantMessage.displayName = 'AssistantMessage';

export const AssistantMessage = MemoizedAssistantMessage as typeof AssistantMessageComponent;
