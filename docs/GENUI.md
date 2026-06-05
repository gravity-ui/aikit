# Generative UI (toolset)

> Render LLM `tool_calls` as typed React components using the existing assistant
> `tool` content type. AIKit ships `defineTool`, `createToolset`,
> `createToolsetRenderer`, `applyToolResult`, `toolsetToOpenAIDefinitions`, and
> `useToolset` — no separate GenUI package.

---

## What ships in the library

| Export                                                                                                         | Module                                                     |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `defineTool`, `createToolset`, `createToolsetRenderer`, `applyToolResult`, `toolsetToOpenAIDefinitions`, types | `src/utils/toolset` (re-exported from `@gravity-ui/aikit`) |
| `useToolset`                                                                                                   | `src/hooks/useToolset.ts`                                  |

**Storybook (no network):** `genui/Showcase` (in
`src/utils/toolset/__stories__/Showcase.stories.tsx`) and `genui/useToolset` (in
`src/hooks/__stories__/useToolset.stories.tsx`). `Showcase` shows the registry
directly via `createToolsetRenderer`; `useToolset` is the recommended path via
the `useToolset` hook.

---

## Mental model

1. The model (or your backend) emits assistant messages whose `content` includes
   `{ type: 'tool', data: { toolName, toolCallId, args, status, ... } }` parts.
2. A **toolset** maps `toolName` → validator + React component + optional `execute`
   (shape the payload returned to the model).
3. `createToolsetRenderer` / `useToolset` register a `tool` dispatcher on
   `MessageRendererRegistry` so `AssistantMessage` renders your components.
4. On `submitResult`, the renderer runs `execute`, merges the result into history
   (`applyToolResult`), and optionally calls `onAfterResult` / `onToolResult` so
   you can POST the updated transcript to your chat API.

---

## Minimal wiring (Storybook-style)

Same pattern as the in-repo story — one message, manual history updates:

```tsx
import {useCallback, useMemo, useState} from 'react';
import {
  AssistantMessage,
  createToolset,
  createToolsetRenderer,
  defineTool,
  type ToolComponentProps,
  type ToolPartContent,
} from '@gravity-ui/aikit';

type ApprovalArgs = {summary: string};
type ApprovalResult = {approved: boolean; auditText: string};

function ApprovalCard({
  args,
  result,
  submitResult,
}: ToolComponentProps<ApprovalArgs, ApprovalResult>) {
  if (result) return <div>{result.auditText}</div>;
  return (
    <div>
      <p>{args.summary}</p>
      <button type="button" onClick={() => submitResult({approved: true, auditText: ''})}>
        Approve
      </button>
    </div>
  );
}

const toolset = createToolset(
  defineTool({
    name: 'approval.request',
    description: 'Ask the user to approve or reject an action.',
    parameters: {
      type: 'object',
      properties: {summary: {type: 'string'}},
      required: ['summary'],
    },
    schema: {
      validate: (input) => {
        if (
          !input ||
          typeof input !== 'object' ||
          typeof (input as ApprovalArgs).summary !== 'string'
        ) {
          return {success: false, error: {message: 'Expected args.summary to be a string'}};
        }
        return {success: true, data: input as ApprovalArgs};
      },
    },
    component: ApprovalCard,
    execute: ({args, result}) => ({
      approved: result.approved,
      auditText: `${result.approved ? 'Approved' : 'Rejected'} "${args.summary}".`,
    }),
  }),
);

// Pass messageRendererRegistry into AssistantMessage or ChatContainer messageListConfig.
const registry = createToolsetRenderer(toolset, {
  onToolResult: (event) => {
    // Merge result into parts, then forward event to your agent API if needed.
    console.log(event);
  },
});
```

For a full chat loop, use `useToolset` instead of hand-rolling `onToolResult` + history merge.

---

## Full chat with `useToolset`

```tsx
const {messageRendererRegistry} = useToolset<ToolPartContent>({
  toolset,
  setMessages,
  onAfterResult: (updated) => {
    sendTurn(updated).catch(console.warn);
  },
});

<ChatContainer
  messages={messages}
  messageListConfig={{messageRendererRegistry}}
  /* ... */
/>;
```

Keep a stable `toolset` reference (`useMemo`, `createToolset` at module scope, or
both). `useToolset` already calls `applyToolResult` before `onAfterResult`.

---

## Reporting tool failures and cancellations

By default an `execute` callback that returns `TResult` is treated as `'success'`.
To report a failure or a user cancellation explicitly, return a
`ToolExecutionOutcome<TResult>`:

```tsx
execute: async ({args}) => {
  try {
    const result = await callBackend(args);
    return {status: 'success', result};
  } catch (err) {
    return {status: 'error', error: {message: String(err)}};
  }
},
```

A thrown error is also surfaced as `{status: 'error'}` — the wrapper catches it so
the tool message flips to an error state instead of leaving the UI hanging. Use
`'cancelled'` when the user rejects an approval or otherwise aborts the action;
`applyToolResult` will reflect the status on the tool part.

---

## Architecture (with a live model)

```
User input
  → setMessages([...messages, userMessage])
  → sendTurn(messages)
     ↓
  fetch(CHAT_API_URL, { messages, tools, tool_choice: 'auto' })  // your server route
     ↓
  Response with tool_calls
  → chatCompletionsToAssistantMessage(body)
  → setMessages([...nextMessages, assistant])
     ↓
  messageRendererRegistry dispatches by toolName
  → component receives { args, submitResult }
  → user acts → submitResult(result)
     ↓
  useToolset → applyToolResult → onAfterResult(updated) → sendTurn(updated)
     ↓
  fetch(CHAT_API_URL, ...) — history now includes role: 'tool' messages
  → model replies with text or another tool_call
```

**API keys:** call the provider from your backend (Next.js route, BFF, worker, etc.).
The browser talks only to your route; never embed provider keys in client bundles.

---

## LLM adapter (app code, OpenAI Chat Completions shape)

Provider-specific conversion stays outside the library. Typical responsibilities:

- `messagesToChatCompletions` — flatten assistant `text` + `tool` parts into
  `assistant` + `tool` roles; include `tool_calls` and serialized `tool` results.
- `chatCompletionsToAssistantMessage` — map `tool_calls` into `tool` parts with
  `status: 'waitingConfirmation'` (or `error` on bad JSON).
- `toolsetToOpenAIDefinitions(toolset)` — library helper that maps a `Toolset` to
  the OpenAI `tools[]` shape.

See the reference implementation below for a two-tool weather + approval example.

---

## Reference: live chat component

Copy into your app. Set `CHAT_API_URL` to a server route that forwards to your
model (adds `model`, auth, etc. server-side).

```tsx
/* eslint-disable no-console */
import {useCallback, useMemo, useRef, useState} from 'react';

import {Button, Card, Text} from '@gravity-ui/uikit';
import {v4 as uuid} from 'uuid';

import {
  ChatContainer,
  type ChatStatus,
  type TAssistantMessage,
  type TChatMessage,
  type TSubmitData,
  type TUserMessage,
  type TextMessageContent,
  type ToolComponentProps,
  type ToolPartContent,
  type ToolSchemaResult,
  createToolset,
  defineTool,
  toolsetToOpenAIDefinitions,
  useToolset,
} from '@gravity-ui/aikit';

// === Provider types (OpenAI Chat Completions shape) ===

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

type WeatherArgs = {city: string; value: number; units?: 'c' | 'f'};
type WeatherResult = {acknowledged: true; auditText: string};
type ApprovalArgs = {summary: string};
type ApprovalResult = {approved: boolean; auditText: string};

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
    summary: {type: 'string', description: 'One-line summary for user approval.'},
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
  return {success: true, data: {city: value.city, value: value.value, units: value.units}};
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
      <Text variant="subheader-1">Weather · {args.city}</Text>
      <Text color="secondary">
        {args.value}°{args.units ?? 'c'}
      </Text>
      {result ? (
        <Text color="secondary">{result.auditText}</Text>
      ) : (
        <Button view="action" onClick={() => submitResult({acknowledged: true, auditText: ''})}>
          Got it
        </Button>
      )}
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
      <Text variant="subheader-1">Approval request</Text>
      <Text>{args.summary}</Text>
      {result ? (
        <Text color="secondary">{result.auditText}</Text>
      ) : (
        <div style={{display: 'flex', gap: 8}}>
          <Button view="action" onClick={() => submitResult({approved: true, auditText: ''})}>
            Approve
          </Button>
          <Button onClick={() => submitResult({approved: false, auditText: ''})}>Reject</Button>
        </div>
      )}
    </Card>
  );
}

const toolset = createToolset(
  defineTool({
    name: 'weather_show',
    description: 'Render a weather card for a city and let the user acknowledge it.',
    parameters: weatherParameters,
    schema: {validate: validateWeatherArgs},
    component: WeatherCard,
    execute: ({args, result}) => ({
      acknowledged: result.acknowledged,
      auditText: `User acknowledged weather for ${args.city} (${args.value}°${args.units ?? 'c'}).`,
    }),
  }),
  defineTool({
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
);

function toContentArray(
  content: TAssistantMessage<ToolPartContent>['content'],
): AssistantContentPart[] {
  if (typeof content === 'string') {
    return content ? [{type: 'text', data: {text: content}}] : [];
  }
  const parts = Array.isArray(content) ? content : [content];
  return parts.flatMap((part): AssistantContentPart[] => {
    if (part.type === 'text' || part.type === 'tool') return [part as AssistantContentPart];
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
      if (!isToolPart(part)) continue;

      const data = part.data;
      toolCalls.push({
        id: data.toolCallId,
        type: 'function',
        function: {name: data.toolName, arguments: JSON.stringify(data.args ?? {})},
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

  return {id: uuid(), role: 'assistant', content: parts.length === 0 ? '' : parts};
}

const SYSTEM_PROMPT = [
  'You are a UI assistant integrated into a chat app.',
  'When a user asks something that maps to a provided tool, CALL THE TOOL instead of prose.',
  'Examples: "weather in Berlin" -> weather_show; "delete staging db?" -> approval_request.',
  'Only use plain text when no tool fits.',
].join('\n');

const CHAT_API_URL =
  (typeof process !== 'undefined' &&
    (process.env as Record<string, string | undefined>).CHAT_API_URL) ||
  '/api/chat';

export function AgentChat() {
  const tools = useMemo(() => toolsetToOpenAIDefinitions(toolset), []);
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
        const res = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({messages: chatMessages, tools, tool_choice: 'auto'}),
          signal: controller.signal,
        });
        const body = (await res.json()) as ChatCompletionsResponse;

        if (!res.ok) {
          const reason =
            (typeof body?.error === 'object' && body.error?.message) ||
            (typeof body?.error === 'string' && body.error) ||
            `Chat API returned ${res.status}`;
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

  const {messageRendererRegistry} = useToolset<ToolPartContent>({
    toolset,
    setMessages,
    onAfterResult: (next) => {
      sendTurn(next).catch((err) => console.warn('sendTurn failed', err));
    },
  });

  const handleSendMessage = useCallback(
    async (data: TSubmitData) => {
      const userMessage: TUserMessage = {id: uuid(), role: 'user', content: data.content};
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
      {errorBanner && <div role="alert">{errorBanner}</div>}
      <ChatContainer
        messages={messages as TChatMessage[]}
        status={status}
        onSendMessage={handleSendMessage}
        onCancel={handleCancel}
        onSelectChat={() => {}}
        onCreateChat={() => {}}
        messageListConfig={{messageRendererRegistry}}
      />
    </div>
  );
}
```

---

## What the library gives you for free

- **Registry** — `useToolset` returns a `MessageRendererRegistry` with the `tool`
  dispatcher wired to your toolset.
- **`submitResult`** — typed on `ToolComponentProps`; injected by `createToolsetRenderer`.
- **History merge** — `applyToolResult` on every successful submit; `onAfterResult`
  receives the updated transcript.
- **Validation** — invalid args or unknown `toolName` fall back to
  `<ToolMessage status="error" />`.

What stays in your app: tool definitions (schemas, components, `execute`), the LLM
adapter, `sendTurn`, and a server route that holds provider credentials.
