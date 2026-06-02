import {useCallback, useMemo, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn} from '@storybook/react-webpack5';

import {AssistantMessage} from '../../components/organisms/AssistantMessage';
import {ToolMessage} from '../../components/organisms/ToolMessage';
import {ContentWrapper} from '../../demo/ContentWrapper';
import type {
    TAssistantMessage,
    TMessageContent,
    TextMessageContent,
    ToolMessageContentData,
} from '../../types';
import {
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../utils/messageTypeRegistry';

type SchemaResult<TArgs> =
    | {success: true; data: TArgs}
    | {success: false; error: {message: string}};

type AgentToolContentData<TArgs = unknown, TResult = unknown> = ToolMessageContentData & {
    toolCallId: string;
    args?: TArgs;
    result?: TResult;
};

type AgentToolContent<TArgs = unknown, TResult = unknown> = TMessageContent<
    'tool',
    AgentToolContentData<TArgs, TResult>
>;

type ElegantToolComponentProps<TArgs, TResult> = {
    args: TArgs;
    result?: TResult;
    status?: ToolMessageContentData['status'];
    submitResult: (result: TResult) => void;
};

type ElegantToolDefinition<TArgs, TResult> = {
    displayName: [string, string];
    schema: {
        validate: (input: unknown) => SchemaResult<TArgs>;
    };
    component: React.ComponentType<ElegantToolComponentProps<TArgs, TResult>>;
    execute?: (params: {
        args: TArgs;
        result: TResult;
        toolCallId: string;
    }) => TResult | Promise<TResult>;
};

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

function validateApprovalArgs(input: unknown): SchemaResult<ApprovalArgs> {
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
}: ElegantToolComponentProps<ApprovalArgs, ApprovalResult>) {
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

const toolset: Record<string, ElegantToolDefinition<ApprovalArgs, ApprovalResult>> = {
    'approval.request': {
        displayName: ['Approval request', 'Approval resolved'],
        schema: {validate: validateApprovalArgs},
        component: ApprovalRequestTool,
        execute: ({args, result}) => ({
            approved: result.approved,
            auditText: `${result.approved ? 'Approved' : 'Rejected'} "${args.summary}" in a client callback.`,
        }),
    },
};

function createElegantToolRegistry(
    onToolResult: (event: {toolCallId: string; toolName: string; result: unknown}) => void,
): MessageRendererRegistry {
    const registry = createMessageRendererRegistry();

    registerMessageRenderer<AgentToolContent<unknown, ApprovalResult>>(registry, 'tool', {
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

            const validation = toolDef.schema.validate(toolPart.args);
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

            const Component = toolDef.component;
            const submitResult = (result: ApprovalResult) => {
                const resultPromise = Promise.resolve(
                    toolDef.execute
                        ? toolDef.execute({
                              args: validation.data,
                              result,
                              toolCallId: toolPart.toolCallId,
                          })
                        : result,
                );

                resultPromise.then((finalResult) => {
                    onToolResult({
                        toolCallId: toolPart.toolCallId,
                        toolName: toolPart.toolName,
                        result: finalResult,
                    });
                });
            };

            return (
                <Component
                    args={validation.data}
                    result={toolPart.result}
                    status={toolPart.status}
                    submitResult={submitResult}
                />
            );
        },
    });

    return registry;
}

const textPart = (text: string): TextMessageContent => ({type: 'text', data: {text}});

const toolPart = (
    toolCallId: string,
    args: unknown,
): AgentToolContent<unknown, ApprovalResult> => ({
    type: 'tool',
    id: toolCallId,
    data: {
        toolName: 'approval.request',
        toolCallId,
        status: 'waitingConfirmation',
        args,
    },
});

const initialContent: Array<TextMessageContent | AgentToolContent> = [
    textPart(
        'This story uses the existing `tool` content type. The custom renderer validates args, renders by `toolName`, and sends a result back to the agent.',
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
    title: 'genui/ElegantToolRenderer',
    parameters: {layout: 'padded'},
} as Meta;

export const ProofOfConcept: StoryFn = () => {
    const [content, setContent] =
        useState<Array<TextMessageContent | AgentToolContent>>(initialContent);
    const [agentEvents, setAgentEvents] = useState<AgentToolEvent[]>([]);

    const handleToolResult = useCallback(
        ({
            toolCallId,
            toolName,
            result,
        }: {
            toolCallId: string;
            toolName: string;
            result: unknown;
        }) => {
            setContent((prevContent) =>
                prevContent.map((part) => {
                    if (part.type !== 'tool' || part.data.toolCallId !== toolCallId) {
                        return part;
                    }

                    return {
                        ...part,
                        data: {
                            ...part.data,
                            status: 'success',
                            result,
                        },
                    };
                }),
            );

            setAgentEvents((prevEvents) => [
                ...prevEvents,
                {
                    role: 'tool',
                    tool_call_id: toolCallId,
                    name: toolName,
                    content: JSON.stringify(result),
                },
            ]);
        },
        [],
    );

    const messageRendererRegistry = useMemo(
        () => createElegantToolRegistry(handleToolResult),
        [handleToolResult],
    );

    const message: TAssistantMessage<AgentToolContent> = {
        id: 'elegant-tool-renderer',
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
