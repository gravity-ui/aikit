/* eslint-disable no-console */
import {useCallback, useMemo, useRef, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {v4 as uuid} from 'uuid';

import {ChatContainer} from '../../components/pages/ChatContainer';
import {ContentWrapper} from '../../demo/ContentWrapper';
import {useToolset} from '../../hooks/useToolset';
import type {
    ChatStatus,
    TAssistantMessage,
    TChatMessage,
    TSubmitData,
    TUserMessage,
    TextMessageContent,
} from '../../types';
import {
    type ToolComponentProps,
    type ToolPartContent,
    type ToolSchemaResult,
    type Toolset,
    defineTool,
} from '../../utils/toolset';

type JSONSchemaObject = {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
};

type ChatCompletionsToolCall = {
    id: string;
    type: 'function';
    function: {name: string; arguments: string};
};

type ChatCompletionsMessage =
    | {role: 'system' | 'user'; content: string}
    | {role: 'assistant'; content: string | null; tool_calls?: ChatCompletionsToolCall[]}
    | {role: 'tool'; tool_call_id: string; content: string};

type ChatCompletionsResponse = {
    choices?: Array<{
        message?: {
            role?: string;
            content?: string | null;
            tool_calls?: ChatCompletionsToolCall[];
        };
        finish_reason?: string;
    }>;
    error?: {message?: string} | string;
};

type AssistantContentPart = TextMessageContent | ToolPartContent;
type AgentChatMessage = TChatMessage<ToolPartContent>;

type WeatherArgs = {
    city: string;
    value: number;
    units?: 'c' | 'f';
};

type WeatherResult = {
    acknowledged: true;
    auditText: string;
};

type ApprovalArgs = {
    summary: string;
};

type ApprovalResult = {
    approved: boolean;
    auditText: string;
};

const weatherParameters: JSONSchemaObject = {
    type: 'object',
    properties: {
        city: {type: 'string', description: 'City name, e.g. Berlin.'},
        units: {type: 'string', enum: ['c', 'f']},
        value: {type: 'number', description: 'Temperature value, e.g. 20.'},
    },
    required: ['city', 'value'],
    additionalProperties: false,
};

const approvalParameters: JSONSchemaObject = {
    type: 'object',
    properties: {
        summary: {
            type: 'string',
            description: 'One-line summary of the action that needs user approval.',
        },
    },
    required: ['summary'],
    additionalProperties: false,
};

function validateWeatherArgs(input: unknown): ToolSchemaResult<WeatherArgs> {
    if (!input || typeof input !== 'object') {
        return {success: false, error: {message: 'Expected object arguments'}};
    }

    const value = input as Record<string, unknown>;
    if (typeof value.city !== 'string') {
        return {success: false, error: {message: 'Expected args.city to be a string'}};
    }

    if (typeof value.value !== 'number') {
        return {success: false, error: {message: 'Expected args.value to be a number'}};
    }

    if (value.units !== undefined && value.units !== 'c' && value.units !== 'f') {
        return {success: false, error: {message: 'Expected args.units to be "c" or "f"'}};
    }

    return {
        success: true,
        data: {city: value.city, value: value.value, units: value.units},
    };
}

function validateApprovalArgs(input: unknown): ToolSchemaResult<ApprovalArgs> {
    if (!input || typeof input !== 'object') {
        return {success: false, error: {message: 'Expected object arguments'}};
    }

    const value = input as Record<string, unknown>;
    if (typeof value.summary !== 'string') {
        return {success: false, error: {message: 'Expected args.summary to be a string'}};
    }

    return {success: true, data: {summary: value.summary}};
}

function WeatherCard({args, result, submitResult}: ToolComponentProps<WeatherArgs, WeatherResult>) {
    return (
        <Card view="outlined" style={{padding: 12}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <Text variant="subheader-1">Weather · {args.city}</Text>
                <Text color="secondary">
                    {args.value}°{args.units ?? 'c'}
                </Text>
                {result ? (
                    <Text color="secondary">{result.auditText}</Text>
                ) : (
                    <Button
                        view="action"
                        onClick={() => submitResult({acknowledged: true, auditText: ''})}
                    >
                        Got it
                    </Button>
                )}
            </div>
        </Card>
    );
}

function ApprovalCard({
    args,
    result,
    submitResult,
}: ToolComponentProps<ApprovalArgs, ApprovalResult>) {
    return (
        <Card view="outlined" style={{padding: 12}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <Text variant="subheader-1">Approval request</Text>
                <Text>{args.summary}</Text>
                {result ? (
                    <Text color="secondary">{result.auditText}</Text>
                ) : (
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
                )}
            </div>
        </Card>
    );
}

const toolset: Toolset = {
    weather_show: defineTool<WeatherArgs, WeatherResult>({
        name: 'weather_show',
        description: 'Render a weather card for a city and let the user acknowledge it.',
        parameters: weatherParameters,
        schema: {validate: validateWeatherArgs},
        component: WeatherCard,
        execute: ({args, result}) => ({
            acknowledged: result.acknowledged,
            auditText: `User acknowledged the weather card for ${args.city} (${args.value}°${args.units ?? 'c'}).`,
        }),
    }),
    approval_request: defineTool<ApprovalArgs, ApprovalResult>({
        name: 'approval_request',
        description: 'Ask the user to approve or reject a proposed action.',
        parameters: approvalParameters,
        schema: {validate: validateApprovalArgs},
        component: ApprovalCard,
        execute: ({args, result}) => ({
            approved: result.approved,
            auditText: `${result.approved ? 'Approved' : 'Rejected'} "${args.summary}" in the client UI.`,
        }),
    }),
};

function toolsFromToolset() {
    return Object.values(toolset).map((tool) => ({
        type: 'function' as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        },
    }));
}

function toContentArray(
    content: TAssistantMessage<ToolPartContent>['content'],
): AssistantContentPart[] {
    if (typeof content === 'string') {
        return content ? [{type: 'text', data: {text: content}}] : [];
    }

    const parts = Array.isArray(content) ? content : [content];
    return parts.flatMap((part): AssistantContentPart[] => {
        if (part.type === 'text' || part.type === 'tool') {
            return [part as AssistantContentPart];
        }
        return [];
    });
}

function isToolPart(part: AssistantContentPart): part is ToolPartContent {
    return part.type === 'tool' && typeof part.data === 'object' && part.data !== null;
}

function messagesToChatCompletions(messages: AgentChatMessage[]): ChatCompletionsMessage[] {
    const items: ChatCompletionsMessage[] = [];

    for (const msg of messages) {
        if (msg.role === 'user') {
            items.push({role: 'user', content: msg.content});
            continue;
        }

        const textPieces: string[] = [];
        const toolCalls: ChatCompletionsToolCall[] = [];
        const toolResults: Array<{role: 'tool'; tool_call_id: string; content: string}> = [];

        for (const part of toContentArray(msg.content)) {
            if (part.type === 'text') {
                const text = (part as TextMessageContent).data.text;
                if (text) textPieces.push(text);
                continue;
            }

            if (!isToolPart(part)) {
                continue;
            }

            const data = part.data;
            toolCalls.push({
                id: data.toolCallId,
                type: 'function',
                function: {
                    name: data.toolName,
                    arguments: JSON.stringify(data.args ?? {}),
                },
            });

            if (data.result !== undefined) {
                toolResults.push({
                    role: 'tool',
                    tool_call_id: data.toolCallId,
                    content: JSON.stringify(data.result),
                });
            }
        }

        if (textPieces.length > 0 || toolCalls.length > 0) {
            const content = textPieces.length > 0 ? textPieces.join('\n') : null;
            items.push(
                toolCalls.length > 0
                    ? {role: 'assistant', content, tool_calls: toolCalls}
                    : {role: 'assistant', content: content ?? ''},
            );
        }

        items.push(...toolResults);
    }

    return items;
}

function chatCompletionsToAssistantMessage(
    response: ChatCompletionsResponse,
): TAssistantMessage<ToolPartContent> {
    const message = response.choices?.[0]?.message ?? {};
    const parts: AssistantContentPart[] = [];

    if (typeof message.content === 'string' && message.content.trim()) {
        parts.push({type: 'text', data: {text: message.content}});
    }

    for (const call of message.tool_calls ?? []) {
        if (call.type !== 'function' || !call.function) continue;

        let parsedArgs: unknown = {};
        let parseError: string | undefined;
        try {
            parsedArgs = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        } catch (err) {
            parseError = err instanceof Error ? err.message : String(err);
        }

        parts.push({
            type: 'tool',
            id: call.id,
            data: {
                toolName: call.function.name,
                toolCallId: call.id,
                args: parseError ? undefined : parsedArgs,
                status: parseError ? 'error' : 'waitingConfirmation',
                ...(parseError
                    ? {
                          bodyContent: `Invalid tool arguments JSON: ${parseError}`,
                          expandable: true,
                          initialExpanded: true,
                      }
                    : {}),
            },
        });
    }

    return {
        id: uuid(),
        role: 'assistant',
        content: parts.length === 0 ? '' : parts,
    };
}

const SYSTEM_PROMPT = [
    'You are a UI assistant integrated into a chat app.',
    'When a user asks something that maps to one of the provided tools, CALL THE TOOL instead of replying with prose.',
    'Examples:',
    '- "weather in Berlin" -> call weather_show with {city:"Berlin", value:20}.',
    '- "should I delete the staging db?" -> call approval_request with a one-line summary.',
    'Only fall back to plain text when no tool fits.',
].join('\n');

const PROXY_URL =
    (typeof process !== 'undefined' &&
        (process.env as Record<string, string | undefined>).STORYBOOK_GENUI_PROXY_URL) ||
    'http://localhost:8787/api/chat';

export default {
    title: 'genui/ElegantLive',
    component: ChatContainer,
    parameters: {layout: 'padded'},
} as Meta<typeof ChatContainer>;

type Story = StoryObj<typeof ChatContainer>;

const decorators = [
    (Story) => (
        <ContentWrapper height="800px" width="640px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Live: Story = {
    args: {
        chats: [],
        showHistory: false,
        showNewChat: false,
        showFolding: false,
        showClose: false,
    },
    decorators,
    render: (args) => {
        const tools = useMemo(toolsFromToolset, []);
        const [messages, setMessages] = useState<AgentChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [errorBanner, setErrorBanner] = useState<string | null>(null);
        const abortRef = useRef<AbortController | null>(null);

        const sendTurn = useCallback(
            async (nextMessages: AgentChatMessage[]) => {
                setStatus('submitted');
                setErrorBanner(null);
                const controller = new AbortController();
                abortRef.current = controller;

                try {
                    const chatMessages: ChatCompletionsMessage[] = [
                        {role: 'system', content: SYSTEM_PROMPT},
                        ...messagesToChatCompletions(nextMessages),
                    ];
                    const res = await fetch(PROXY_URL, {
                        method: 'POST',
                        headers: {'content-type': 'application/json'},
                        body: JSON.stringify({
                            messages: chatMessages,
                            tools,
                            tool_choice: 'auto',
                        }),
                        signal: controller.signal,
                    });
                    const body = (await res.json()) as ChatCompletionsResponse;

                    if (!res.ok) {
                        const reason =
                            (typeof body?.error === 'object' && body.error?.message) ||
                            (typeof body?.error === 'string' && body.error) ||
                            `Proxy returned ${res.status}`;
                        setErrorBanner(String(reason));
                        return;
                    }

                    const assistant = chatCompletionsToAssistantMessage(body);
                    setMessages([...nextMessages, assistant]);
                } catch (err) {
                    if ((err as Error)?.name === 'AbortError') return;
                    setErrorBanner((err as Error)?.message ?? String(err));
                } finally {
                    abortRef.current = null;
                    setStatus('ready');
                }
            },
            [tools],
        );

        const {messageRendererRegistry} = useToolset<ToolPartContent>(toolset, setMessages, {
            onAfterResult: (next) => {
                sendTurn(next).catch((err) =>
                    console.warn('[genui/elegant-live] sendTurn failed', err),
                );
            },
        });

        const handleSendMessage = useCallback(
            async (data: TSubmitData) => {
                const userMessage: TUserMessage = {
                    id: uuid(),
                    role: 'user',
                    content: data.content,
                };
                const nextMessages: AgentChatMessage[] = [...messages, userMessage];
                setMessages(nextMessages);
                await sendTurn(nextMessages);
            },
            [messages, sendTurn],
        );

        const handleCancel = useCallback(async () => {
            abortRef.current?.abort();
            abortRef.current = null;
            setStatus('ready');
        }, []);

        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                {errorBanner && (
                    <div
                        style={{
                            padding: 8,
                            marginBottom: 8,
                            background: 'var(--g-color-base-danger-light, #fce4e4)',
                            color: 'var(--g-color-text-danger, #a30000)',
                            borderRadius: 6,
                            fontSize: 13,
                        }}
                    >
                        {errorBanner}
                    </div>
                )}
                <div style={{flex: 1, minHeight: 0}}>
                    <ChatContainer
                        {...args}
                        messages={messages as TChatMessage[]}
                        status={status}
                        onSendMessage={handleSendMessage}
                        onCancel={handleCancel}
                        onSelectChat={() => {}}
                        onCreateChat={() => {}}
                        messageListConfig={{
                            ...(args.messageListConfig ?? {}),
                            messageRendererRegistry,
                        }}
                    />
                </div>
            </div>
        );
    },
};
