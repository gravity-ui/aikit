import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn} from '@storybook/react-webpack5';

import {AssistantMessage} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {useToolset} from '../../../../hooks/useToolset';
import type {TAssistantMessage, TChatMessage, TextMessageContent} from '../../../../types';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    type ToolsetResultEvent,
    createToolset,
    createToolsetRenderer,
    defineTool,
} from '../../../../utils/toolset';

type ApprovalArgs = {
    summary: string;
    risk: 'low' | 'high';
};

type ApprovalResult = {
    approved: boolean;
    auditText: string;
};

type AgentToolEvent = {
    role: 'tool';
    tool_call_id: string;
    name: string;
    content: string;
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
    defineTool<ApprovalArgs, ApprovalResult>({
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

const initialContent: Array<TextMessageContent | ToolPartContent> = [
    textPart(
        'This story uses the existing `tool` content type. `createToolsetRenderer` validates args, dispatches by `toolName`, and sends a result back to the agent on `submitResult`.',
    ),
    toolPart('call-valid', {
        summary: 'Deploy the release candidate to production',
        risk: 'high',
    }),
    toolPart('call-invalid', {
        summary: 42,
        risk: 'medium',
    }),
];

export default {
    title: 'CustomToolRenderer',
    parameters: {layout: 'padded'},
} as Meta;

export const ProofOfConcept: StoryFn = () => {
    const [content, setContent] =
        useState<Array<TextMessageContent | ToolPartContent>>(initialContent);
    const [agentEvents, setAgentEvents] = useState<AgentToolEvent[]>([]);

    const handleToolResult = useCallback((event: ToolsetResultEvent) => {
        setContent((prevContent) =>
            prevContent.map((part) => {
                if (part.type !== 'tool' || part.data.toolCallId !== event.toolCallId) {
                    return part;
                }
                return {
                    ...part,
                    data: {
                        ...part.data,
                        status: event.status,
                        result: event.result,
                    },
                };
            }),
        );

        setAgentEvents((prev) => [
            ...prev,
            {
                role: 'tool',
                tool_call_id: event.toolCallId,
                name: event.toolName,
                content: JSON.stringify(event.result),
            },
        ]);
    }, []);

    const messageRendererRegistry = useMemo(
        () => createToolsetRenderer(toolset, {onToolResult: handleToolResult}),
        [handleToolResult],
    );

    const message: TAssistantMessage<ToolPartContent> = {
        id: 'custom-tool-renderer',
        role: 'assistant',
        content,
    };

    return (
        <ContentWrapper width="620px">
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <AssistantMessage
                    id={message.id}
                    content={message.content}
                    messageRendererRegistry={messageRendererRegistry}
                />
                <Card view="outlined" style={{padding: 12}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <Text variant="subheader-1">Tool responses sent to agent</Text>
                        <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>
                            {agentEvents.length === 0
                                ? '// Click Approve or Reject to send a tool response'
                                : JSON.stringify(agentEvents, null, 2)}
                        </pre>
                    </div>
                </Card>
                <Button
                    onClick={() => {
                        setContent(initialContent);
                        setAgentEvents([]);
                    }}
                >
                    Reset story state
                </Button>
            </div>
        </ContentWrapper>
    );
};

const initialMessages: TChatMessage<ToolPartContent>[] = [
    {
        id: 'msg-1',
        role: 'assistant',
        content: [
            textPart(
                'This story uses `useToolset` to wire the toolset into chat state. When you click Approve/Reject, the hook merges the result into history via `applyToolResult` and `onAfterResult` simulates a mock agent reply.',
            ),
            toolPart('call-hook-1', {
                summary: 'Deploy the release candidate to production',
                risk: 'high',
            }),
        ],
    },
];

export const CustomToolRendererWithHook: StoryFn = () => {
    const [messages, setMessages] = useState<TChatMessage<ToolPartContent>[]>(initialMessages);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
        };
    }, []);

    const handleAfterResult = useCallback((next: TChatMessage<ToolPartContent>[]) => {
        const lastTool = [...next]
            .reverse()
            .flatMap((m) => (m.role === 'assistant' && Array.isArray(m.content) ? m.content : []))
            .find(
                (part): part is ToolPartContent =>
                    part.type === 'tool' && part.data.status === 'success',
            );

        if (!lastTool) return;

        const timer = setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `mock-reply-${lastTool.data.toolCallId}`,
                    role: 'assistant',
                    content: [
                        textPart(
                            `Mock agent received tool result for ${lastTool.data.toolCallId}: ${JSON.stringify(lastTool.data.result)}`,
                        ),
                    ],
                },
            ]);
        }, 400);
        timersRef.current.push(timer);
    }, []);

    const {messageRendererRegistry} = useToolset({
        toolset,
        setMessages,
        onAfterResult: handleAfterResult,
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
