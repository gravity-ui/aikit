reviewer showed me code:

registerMessageRenderer<CustomToolContent>(registry, 'custom-tool', {
component: ({ part }) => {
const toolPart = part.data;
const messageId = part.id ?? '';
const toolName = toolPart.toolName;

                return (
                    <ToolUseContextProvider
                        key={toolPart.toolCallId}
                        toolName={toolName}
                        toolPart={toolPart}
                        messageId={messageId}
                    >
                        <ToolUseBlock toolName={toolName} />
                    </ToolUseContextProvider>
                );
            },
        });

from the entire file:

import React, { useMemo } from 'react';

import {
type BaseMessageActionConfig,
type ChatStatus,
type MessageRendererRegistry,
type TMessageContentUnion,
type TextMessageContent,
ThinkingMessage,
type ThinkingMessageContent,
createMessageRendererRegistry,
registerMessageRenderer,
} from '@gravity-ui/aikit';
import { Text } from '@gravity-ui/uikit';

import {
type AgentMessage,
type CodeContent,
type CompactionContent,
type CustomMessageContent,
type CustomToolContent,
type DiffContent,
type StepwiseContent,
getMessageText,
} from 'shared/agent/types';

import { DiffBlock } from '../components/DiffBlock';
import { ReasoningBlock } from '../components/ReasoningBlock';
import { ToolUseBlock } from '../components/ToolUseBlock';
import { ToolUseContextProvider } from '../components/ToolUseContextProvider';
import { CodeBlock, parseMessageContent } from '../deps';
import { i18n } from '../i18n';

function parseTextPart(part: TextMessageContent): TMessageContentUnion<CustomMessageContent>[] {
const blocks = parseMessageContent(part.data.text);
return blocks.flatMap((block): TMessageContentUnion<CustomMessageContent>[] => {
switch (block.type) {
case 'text':
return [{ type: 'text', data: { text: block.content } }];
case 'stepwise_execution':
return [
{
type: 'stepwise_execution',
data: { title: block.title, content: block.content, done: block.done },
} satisfies StepwiseContent,
];
case 'code':
return [
{
type: 'code',
data: {
language: block.language,
content: block.content,
filename: block.filename,
},
} satisfies CodeContent,
];
case 'diff':
return [
{
type: 'diff',
data: { content: block.content, filename: block.filename },
} satisfies DiffContent,
];
default:
return [];
}
});
}

function createCopyAction(message: AgentMessage): BaseMessageActionConfig | null {
const textToCopy = getMessageText(message, { separator: '\n\n' });

    if (!textToCopy) {
        return null;
    }

    return {
        actionType: 'copy',
        onClick: async () => {
            try {
                await navigator.clipboard.writeText(textToCopy);
            } catch {
                // Ignore copy errors
            }
        },
    };

}

// ChatStatus values where streaming has finished — stop showing in-progress indicators
// inside reasoning blocks even if the corresponding stream-end event was missed.
const COMPLETED_CHAT_STATUSES: ChatStatus[] = ['ready', 'error'];

export function useChatMessages(
messages: AgentMessage[],
status?: ChatStatus,
): {
convertedMessages: AgentMessage[];
messageRendererRegistry: MessageRendererRegistry;
} {
const isChatCompleted = status && COMPLETED_CHAT_STATUSES.includes(status);
const convertedMessages = useMemo(() => {
return messages.map((message) => {
let processedMessage = message;
if (message.role === 'assistant') {
let parsedContent: TMessageContentUnion<CustomMessageContent>[];
if (typeof message.content === 'string') {
parsedContent = message.content
? parseTextPart({ type: 'text', data: { text: message.content } })
: [];
} else if (Array.isArray(message.content)) {
parsedContent = message.content.flatMap(
(part): TMessageContentUnion<CustomMessageContent>[] => {
if (part.type === 'text') {
return parseTextPart(part as TextMessageContent);
}
return [part];
},
);
} else {
parsedContent = [];
}
processedMessage = { ...message, content: parsedContent };
}

            const copyAction = createCopyAction(processedMessage);
            if (!copyAction) {
                return processedMessage;
            }
            return { ...processedMessage, actions: [copyAction] };
        });
    }, [messages]);

    const messageRendererRegistry = useMemo(() => {
        const registry = createMessageRendererRegistry();

        registerMessageRenderer<StepwiseContent>(registry, 'stepwise_execution', {
            component: ({ part }) => {
                const data = part.data;
                return (
                    <ReasoningBlock
                        title={data.title}
                        content={data.content}
                        isStreaming={!data.done && !isChatCompleted}
                    />
                );
            },
        });

        registerMessageRenderer<ThinkingMessageContent>(registry, 'thinking', {
            component: ({ part }) => {
                const rawContent = part.data.content;

                const content = Array.isArray(rawContent)
                    ? rawContent.filter((c) => c.trim())
                    : rawContent.trim();

                if (content.length === 0) {
                    return null;
                }
                const thinkingStatus = isChatCompleted ? 'thought' : part.data.status;
                return (
                    <ThinkingMessage
                        {...part.data}
                        status={thinkingStatus}
                        content={content}
                        defaultExpanded={false}
                        qa="thinking-message"
                    />
                );
            },
        });

        registerMessageRenderer<CodeContent>(registry, 'code', {
            component: ({ part }) => {
                const data = part.data;
                const messageId = part.id ?? '';
                return (
                    <CodeBlock
                        language={data.language}
                        content={data.content}
                        filename={data.filename}
                        messageId={messageId}
                    />
                );
            },
        });

        registerMessageRenderer<DiffContent>(registry, 'diff', {
            component: ({ part }) => {
                const data = part.data;
                return <DiffBlock content={data.content} filename={data.filename} />;
            },
        });

        registerMessageRenderer<CompactionContent>(registry, 'compaction', {
            component: ({ part }) => (
                <Text color="complementary" qa="compaction-message">
                    {part.data.status === 'compacting'
                        ? i18n('message_history-compacting')
                        : i18n('message_history-compacted')}
                </Text>
            ),
        });

        registerMessageRenderer<CustomToolContent>(registry, 'custom-tool', {
            component: ({ part }) => {
                const toolPart = part.data;
                const messageId = part.id ?? '';
                const toolName = toolPart.toolName;

                return (
                    <ToolUseContextProvider
                        key={toolPart.toolCallId}
                        toolName={toolName}
                        toolPart={toolPart}
                        messageId={messageId}
                    >
                        <ToolUseBlock toolName={toolName} />
                    </ToolUseContextProvider>
                );
            },
        });

        return registry;
    }, [isChatCompleted]);

    return {
        convertedMessages,
        messageRendererRegistry,
    };

}
