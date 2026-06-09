import {useEffect, useRef, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn} from '@storybook/react-webpack5';

import {AssistantMessage} from '../../components/organisms/AssistantMessage';
import {ContentWrapper} from '../../demo/ContentWrapper';
import type {TChatMessage, TMessageContent, TextMessageContent} from '../../types';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    createToolset,
    defineTool,
} from '../../utils/toolset';
import {useToolResultContinuation} from '../useToolResultContinuation';
import {useToolset} from '../useToolset';

type ApprovalArgs = {
    summary: string;
    risk: 'low' | 'high';
};

type ApprovalResult = {
    approved: boolean;
    auditText: string;
};

function validateApprovalArgs(input: unknown): ToolSchemaResult<ApprovalArgs> {
    if (!input || typeof input !== 'object') {
        return {success: false, error: {message: 'Expected object arguments'}};
    }

    const value = input as Record<string, unknown>;
    if (typeof value.summary !== 'string') {
        return {success: false, error: {message: 'Expected args.summary to be a string'}};
    }

    if (value.risk !== 'low' && value.risk !== 'high') {
        return {success: false, error: {message: 'Expected args.risk to be "low" or "high"'}};
    }

    return {success: true, data: {summary: value.summary, risk: value.risk}};
}

function ApprovalRequestTool({
    args,
    result,
    submitResult,
}: ToolComponentProps<ApprovalArgs, ApprovalResult>) {
    if (result) {
        return (
            <Card view="outlined" style={{padding: 12}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <Text variant="subheader-1">
                        {result.approved ? 'Approved' : 'Rejected'} on client
                    </Text>
                    <Text color="secondary">{result.auditText}</Text>
                </div>
            </Card>
        );
    }

    return (
        <Card view="outlined" style={{padding: 12}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <Text variant="subheader-1">Approval request</Text>
                    <Text>{args.summary}</Text>
                    <Text color={args.risk === 'high' ? 'danger' : 'secondary'}>
                        Risk: {args.risk}
                    </Text>
                </div>
                <div style={{display: 'flex', gap: 8}}>
                    <Button
                        view="action"
                        onClick={() => submitResult({approved: true, auditText: ''})}
                    >
                        Approve
                    </Button>
                    <Button onClick={() => submitResult({approved: false, auditText: ''})}>
                        Reject
                    </Button>
                </div>
            </div>
        </Card>
    );
}

const toolset = createToolset(
    defineTool({
        name: 'approval.request',
        description: 'Ask the user to approve or reject a proposed action.',
        parameters: {
            type: 'object',
            properties: {
                summary: {type: 'string'},
                risk: {type: 'string', enum: ['low', 'high']},
            },
            required: ['summary', 'risk'],
            additionalProperties: false,
        },
        schema: {validate: validateApprovalArgs},
        component: ApprovalRequestTool,
        execute: ({args, result}) => ({
            approved: result.approved,
            auditText: `${result.approved ? 'Approved' : 'Rejected'} "${args.summary}" in a client callback.`,
        }),
    }),
);

const textPart = (text: string): TextMessageContent => ({type: 'text', data: {text}});

const toolPart = (toolCallId: string, args: unknown): ToolPartContent => ({
    type: 'tool',
    id: toolCallId,
    data: {
        toolName: 'approval.request',
        toolCallId,
        status: 'waitingConfirmation',
        args,
    },
});

function isToolPartContent(part: TMessageContent): part is ToolPartContent {
    return (
        part.type === 'tool' &&
        typeof part.data === 'object' &&
        part.data !== null &&
        'toolCallId' in part.data
    );
}

function getToolResult(messages: TChatMessage<ToolPartContent>[], toolCallId: string): unknown {
    for (const message of messages) {
        if (message.role !== 'assistant' || typeof message.content === 'string') continue;
        const parts = Array.isArray(message.content) ? message.content : [message.content];
        const tool = parts.find(
            (part): part is ToolPartContent =>
                isToolPartContent(part) && part.data.toolCallId === toolCallId,
        );
        if (tool) return tool.data.result;
    }
    return undefined;
}

const initialMessages: TChatMessage<ToolPartContent>[] = [
    {
        id: 'msg-1',
        role: 'assistant',
        content: [
            textPart(
                'This story wires the toolset with `useToolset` (state writes only) and reacts to tool completion via `useToolResultContinuation`. Clicking Approve/Reject merges the result into history; the continuation hook then simulates a mock agent reply.',
            ),
            toolPart('call-hook-1', {
                summary: 'Deploy the release candidate to production',
                risk: 'high',
            }),
        ],
    },
];

const componentDescription = `
\`useToolset\` wires a \`Toolset\` into chat state. It returns a stable
\`messageRendererRegistry\` that renders \`tool\` parts via the toolset, and a
\`handleToolResult\` callback that merges results back into history with
\`applyToolResult\`. It performs no side effects beyond \`setMessages\`.

To react to tool completion (e.g. forward the merged transcript to the model),
pair it with \`useToolResultContinuation\`, which observes \`messages\` and
fires \`onSettled\` once per pending → terminal transition.
`;

const playgroundDescription = `
Renders an approval-request tool that the user can Approve or Reject.
\`useToolset\` merges the click result into the assistant message; the separate
\`useToolResultContinuation\` hook observes the transition and schedules a mock
agent reply 400 ms later. Use **Reset story state** to start over.
`;

export default {
    title: 'genui/useToolset',
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: componentDescription,
            },
        },
    },
} as Meta;

export const Playground: StoryFn = () => {
    const [messages, setMessages] = useState<TChatMessage<ToolPartContent>[]>(initialMessages);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
        };
    }, []);

    const {messageRendererRegistry} = useToolset({toolset, setMessages});

    useToolResultContinuation({
        messages,
        onSettled: ({toolCallId, status, messages: next}) => {
            if (status !== 'success') return;
            const toolResult = getToolResult(next, toolCallId);

            const timer = setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `mock-reply-${toolCallId}`,
                        role: 'assistant',
                        content: [
                            textPart(
                                `Mock agent received tool result for ${toolCallId}: ${JSON.stringify(toolResult)}`,
                            ),
                        ],
                    },
                ]);
            }, 400);
            timersRef.current.push(timer);
        },
    });

    return (
        <ContentWrapper width="620px">
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                {messages.map((msg) =>
                    msg.role === 'assistant' ? (
                        <AssistantMessage
                            key={msg.id}
                            id={msg.id}
                            content={msg.content}
                            messageRendererRegistry={messageRendererRegistry}
                        />
                    ) : null,
                )}
                <Button
                    onClick={() => {
                        timersRef.current.forEach(clearTimeout);
                        timersRef.current = [];
                        setMessages(initialMessages);
                    }}
                >
                    Reset story state
                </Button>
            </div>
        </ContentWrapper>
    );
};

Playground.parameters = {
    docs: {
        description: {
            story: playgroundDescription,
        },
    },
};
