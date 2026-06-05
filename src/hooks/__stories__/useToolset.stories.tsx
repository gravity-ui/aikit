import {useCallback, useEffect, useRef, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn} from '@storybook/react-webpack5';

import {AssistantMessage} from '../../components/organisms/AssistantMessage';
import {ContentWrapper} from '../../demo/ContentWrapper';
import type {TChatMessage, TextMessageContent} from '../../types';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    createToolset,
    defineTool,
} from '../../utils/toolset';
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

export default {
    title: 'genui/useToolset',
    parameters: {layout: 'padded'},
} as Meta;

export const Playground: StoryFn = () => {
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
