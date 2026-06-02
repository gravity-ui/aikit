/* eslint-disable no-console */
import {useCallback, useMemo, useRef, useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {v4 as uuid} from 'uuid';

import {ChatContainer} from '../../components/pages/ChatContainer';
import {ContentWrapper} from '../../demo/ContentWrapper';
import type {
    ChatStatus,
    TAssistantMessage,
    TChatMessage,
    TMessageContentUnion,
    TSubmitData,
    TUserMessage,
    ToolCallMessageContent,
    ToolResultMessageContent,
} from '../../types';
import {
    type GenUIComponentProps,
    type GenUIToolRegistry,
    type ToolResultEvent,
    createGenUIToolRegistry,
    describeGenUIRegistry,
    registerGenUITool,
} from '../index';

/* ---------- Sample tools ---------- */

type WeatherArgs = {city: string; units?: 'c' | 'f'; value: number};
type WeatherResult = {acknowledged: true};

function WeatherCard({
    args,
    submitResult,
    previousResult,
}: GenUIComponentProps<WeatherArgs, WeatherResult>) {
    return (
        <div
            style={{
                padding: 12,
                border: '1px solid var(--g-color-line-generic, rgba(0,0,0,0.15))',
                borderRadius: 8,
                background: 'var(--g-color-base-float, #fff)',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 220,
            }}
        >
            <strong>Weather · {args.city}</strong>
            <span style={{color: 'var(--g-color-text-secondary, rgba(0,0,0,0.6))'}}>
                Units: {args.value} {args.units ?? 'c'}
            </span>
            {previousResult ? (
                <em>acknowledged</em>
            ) : (
                <Button view="action" onClick={() => submitResult({acknowledged: true})}>
                    Got it
                </Button>
            )}
        </div>
    );
}

type ApprovalArgs = {summary: string};
type ApprovalResult = {approved: boolean};

function ApprovalCard({
    args,
    submitResult,
    previousResult,
}: GenUIComponentProps<ApprovalArgs, ApprovalResult>) {
    return (
        <div
            style={{
                padding: 12,
                border: '1px solid var(--g-color-line-generic, rgba(0,0,0,0.15))',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <span>{args.summary}</span>
            {previousResult ? (
                <em>{previousResult.approved ? 'Approved' : 'Rejected'}</em>
            ) : (
                <div style={{display: 'flex', gap: 8}}>
                    <Button view="action" onClick={() => submitResult({approved: true})}>
                        Approve
                    </Button>
                    <Button onClick={() => submitResult({approved: false})}>Reject</Button>
                </div>
            )}
        </div>
    );
}

function buildRegistry(): GenUIToolRegistry {
    const registry = createGenUIToolRegistry();
    registerGenUITool<WeatherArgs, WeatherResult>(registry, {
        name: 'weather_show',
        description: 'Render a weather card for a city.',
        schema: {
            type: 'object',
            properties: {
                city: {type: 'string', description: 'City name, e.g. Berlin.'},
                units: {type: 'string', enum: ['c', 'f']},
                value: {type: 'number', description: 'Temperature value, e.g. 20.'},
            },
            required: ['city', 'value'],
            additionalProperties: false,
        },
        component: WeatherCard,
    });
    registerGenUITool<ApprovalArgs, ApprovalResult>(registry, {
        name: 'approval_request',
        description: 'Ask the user to approve or reject a proposed action.',
        schema: {
            type: 'object',
            properties: {summary: {type: 'string'}},
            required: ['summary'],
            additionalProperties: false,
        },
        component: ApprovalCard,
    });
    return registry;
}

/* ---------- OpenAI-compatible /v1/chat/completions <-> AIKit messages ---------- */

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

function toContentArray(content: TAssistantMessage['content']): TMessageContentUnion[] {
    if (typeof content === 'string') {
        return content ? [{type: 'text', data: {text: content}}] : [];
    }
    return Array.isArray(content) ? content : [content];
}

function messagesToChatCompletions(messages: TChatMessage[]): ChatCompletionsMessage[] {
    const items: ChatCompletionsMessage[] = [];
    for (const msg of messages) {
        if (msg.role === 'user') {
            items.push({role: 'user', content: msg.content});
            continue;
        }
        // Aggregate all parts of one AIKit assistant message into a single chat-completions
        // assistant message (text + tool_calls) followed by separate `role: 'tool'` entries
        // for each tool-result.
        const textPieces: string[] = [];
        const toolCalls: ChatCompletionsToolCall[] = [];
        const toolResults: Array<{role: 'tool'; tool_call_id: string; content: string}> = [];
        for (const part of toContentArray(msg.content)) {
            if (part.type === 'text') {
                const text = (part as {data: {text: string}}).data.text;
                if (text) textPieces.push(text);
            } else if (part.type === 'tool-call') {
                const data = (part as ToolCallMessageContent).data;
                toolCalls.push({
                    id: data.toolCallId,
                    type: 'function',
                    function: {
                        name: data.toolName,
                        arguments: JSON.stringify(data.args ?? {}),
                    },
                });
            } else if (part.type === 'tool-result') {
                const data = (part as ToolResultMessageContent).data;
                toolResults.push({
                    role: 'tool',
                    tool_call_id: data.toolCallId,
                    content: JSON.stringify(data.result ?? null),
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

function chatCompletionsToAssistantMessage(response: ChatCompletionsResponse): TAssistantMessage {
    const message = response.choices?.[0]?.message ?? {};
    const parts: TMessageContentUnion[] = [];
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
        const callPart: ToolCallMessageContent = {
            type: 'tool-call',
            data: {
                toolCallId: call.id,
                toolName: call.function.name,
                args: parseError ? undefined : parsedArgs,
                status: parseError ? 'output-error' : 'input-available',
                ...(parseError
                    ? {error: {message: `Invalid tool arguments JSON: ${parseError}`}}
                    : {}),
            },
        };
        parts.push(callPart);
    }
    return {
        id: uuid(),
        role: 'assistant',
        content: parts.length === 0 ? '' : parts,
    };
}

function toolsFromRegistry(registry: GenUIToolRegistry) {
    return describeGenUIRegistry(registry).tools.map((entry) => ({
        type: 'function' as const,
        function: {
            name: entry.name,
            description: entry.description,
            parameters: entry.parameters ?? {
                type: 'object',
                properties: {},
                additionalProperties: true,
            },
        },
    }));
}

const SYSTEM_PROMPT = [
    'You are a UI assistant integrated into a chat app.',
    'When a user asks something that maps to one of the provided tools, CALL THE TOOL instead of replying with prose.',
    'Examples:',
    '- "weather in Berlin" -> call weather_show with {city:"Berlin"}.',
    '- "should I delete the staging db?" -> call approval_request with a one-line summary.',
    'Only fall back to plain text when no tool fits.',
].join('\n');

const PROXY_URL =
    (typeof process !== 'undefined' &&
        (process.env as Record<string, string | undefined>).STORYBOOK_GENUI_PROXY_URL) ||
    'http://localhost:8787/api/chat';

/* ---------- Story ---------- */

export default {
    title: 'genui/Live',
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
        const registry = useMemo(buildRegistry, []);
        const tools = useMemo(() => toolsFromRegistry(registry), [registry]);

        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const [errorBanner, setErrorBanner] = useState<string | null>(null);
        const abortRef = useRef<AbortController | null>(null);

        const sendTurn = useCallback(
            async (nextMessages: TChatMessage[]) => {
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

        const handleSendMessage = useCallback(
            async (data: TSubmitData) => {
                const userMessage: TUserMessage = {
                    id: uuid(),
                    role: 'user',
                    content: data.content,
                };
                const nextMessages: TChatMessage[] = [...messages, userMessage];
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

        const handleToolResult = useCallback(
            (event: ToolResultEvent) => {
                // Append the tool-result part to the assistant message that carries the matching
                // tool-call, then send another turn so the model can react to the result.
                const resultPart: ToolResultMessageContent = {
                    type: 'tool-result',
                    data: {
                        toolCallId: event.toolCallId,
                        toolName: event.toolName,
                        result: event.result,
                    },
                };
                const updated = messages.map((msg) => {
                    if (msg.role !== 'assistant') return msg;
                    const parts = toContentArray(msg.content);
                    const hasCall = parts.some(
                        (p) =>
                            p.type === 'tool-call' &&
                            (p as ToolCallMessageContent).data.toolCallId === event.toolCallId,
                    );
                    if (!hasCall) return msg;
                    const alreadyHasResult = parts.some(
                        (p) =>
                            p.type === 'tool-result' &&
                            (p as ToolResultMessageContent).data.toolCallId === event.toolCallId,
                    );
                    if (alreadyHasResult) return msg;
                    const nextParts = parts.map((p) => {
                        if (
                            p.type === 'tool-call' &&
                            (p as ToolCallMessageContent).data.toolCallId === event.toolCallId
                        ) {
                            return {
                                ...p,
                                data: {
                                    ...(p as ToolCallMessageContent).data,
                                    status: 'output-available' as const,
                                },
                            };
                        }
                        return p;
                    });
                    nextParts.push(resultPart);
                    return {...msg, content: nextParts};
                });
                setMessages(updated);
                sendTurn(updated).catch((err) => console.warn('[genui] sendTurn failed', err));
            },
            [messages, sendTurn],
        );

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
                        messages={messages}
                        status={status}
                        onSendMessage={handleSendMessage}
                        onCancel={handleCancel}
                        onSelectChat={() => {}}
                        onCreateChat={() => {}}
                        messageListConfig={{
                            ...(args.messageListConfig ?? {}),
                            genUIRegistry: registry,
                            onToolResult: handleToolResult,
                            onGenUIError: (event) => console.warn('[genui] error', event),
                        }}
                    />
                </div>
            </div>
        );
    },
};
