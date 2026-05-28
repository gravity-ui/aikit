# Generative UI Landscape Report

> A technical comparison of **Vercel AI SDK Generative UI**, **assistant-ui/tool-ui**, and **Gravity UI AIKit** — three approaches to rendering React components inside LLM chat interfaces.

**Date:** May 28, 2026  
**Scope:** Architecture, data flow, extensibility, interactivity, design-system fit, and integration paths for teams building AI chat products.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Definition](#problem-definition)
3. [Vercel AI SDK — Generative User Interfaces](#vercel-ai-sdk--generative-user-interfaces)
4. [assistant-ui / Tool UI](#assistant-ui--tool-ui)
5. [Gravity UI AIKit](#gravity-ui-aikit)
6. [Comparative Analysis](#comparative-analysis)
7. [Integration Patterns](#integration-patterns)
8. [Decision Guide](#decision-guide)
9. [Risks and Gaps](#risks-and-gaps)
10. [References](#references)

---

## Executive Summary

When a large language model (LLM) calls a tool, the raw result is usually JSON. Dumping that JSON into a chat bubble is a poor user experience. **Generative UI** (also called **Generative User Interfaces**) is the pattern of mapping structured tool outputs to purpose-built React components rendered inline in the conversation.

Three layers emerge in the ecosystem:

| Layer                   | Representative                                                                | Responsibility                                                        |
| ----------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Orchestration**       | [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)                         | Model calls, tool execution, streaming, message protocol              |
| **Tool-result widgets** | [assistant-ui/tool-ui](https://github.com/assistant-ui/tool-ui)               | Schema-validated, copy/paste React components for common tool outputs |
| **Full chat shell**     | [Gravity UI AIKit](https://github.com/gravity-ui/aikit) (`@gravity-ui/aikit`) | Complete chat UI on Gravity UI — messages, input, history, theming    |

These are **complementary, not competing** at the same abstraction level:

- **AI SDK** defines _how_ tool results travel over the wire (`UIMessage.parts`, tool lifecycle states).
- **Tool UI** provides _what_ to render for known tool output shapes (charts, approval cards, option lists).
- **AIKit** provides _where_ messages live in a production chat product (layout, streaming UX, Gravity UI design system).

A typical Gravity UI stack might look like:

```
AI SDK (server) → adapter (your code) → AIKit MessageRendererRegistry → Tool UI components (restyled or wrapped)
```

---

## Problem Definition

### What breaks without generative UI

1. **Cognitive load** — Users must parse JSON or debug-style tool dumps.
2. **No interaction model** — Approvals, selections, and form-like flows require leaving chat or typing free text.
3. **No persistent record** — After a user picks an option, the conversation loses a durable visual record of the choice.
4. **Fragile rendering** — String-matching model output to UI is brittle; schema-first contracts are required.

### Core architectural question

> Who owns the mapping from tool output → React component?

| Approach             | Owner of mapping                                                | Where validation happens                    |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| AI SDK Generative UI | Application developer (manual `switch` on `message.parts`)      | Optional (`outputSchema` on server)         |
| Tool UI              | Developer via `Toolkit` registry + Zod schemas per component    | Server + client (`safeParseSerializable*`)  |
| AIKit                | Developer via `MessageRendererRegistry` keyed by content `type` | Application-defined (no built-in Zod layer) |

### The collaboration triad (Tool UI terminology)

Tool UI formalizes a **user ↔ tool UI ↔ assistant** loop:

- **Assistant** narrates and provides context ("Here are auth libraries I found…").
- **Tool UI** structures data prose cannot express (tables, charts, selectable cards).
- **User** acts on the UI; the choice flows back to the assistant.

This is richer than "display JSON as a card." Interactive components (Option List, Approval Card) close the loop with **receipts** — read-only records of past decisions.

---

## Vercel AI SDK — Generative User Interfaces

**Documentation:** [Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)  
**Package:** `ai`, `@ai-sdk/react`  
**Version context:** AI SDK 5.x / 6.x (latest as of 2026)

### What it is

The AI SDK is a TypeScript toolkit for LLM integration. Its **Generative UI** pattern connects **tool call results** to **React components on the client**. It is a _protocol and hook layer_, not a component catalog.

Two libraries matter:

- **AI SDK Core** — `streamText`, `generateText`, `tool()`, providers, agents.
- **AI SDK UI** — `useChat`, message streaming, `UIMessage` shape.

### Data flow

```
┌─────────────┐     POST /api/chat      ┌──────────────────┐
│   Client    │ ──────────────────────► │  streamText()    │
│  useChat()  │                         │  + tools{}       │
└─────────────┘                         └────────┬─────────┘
       ▲                                         │
       │         toUIMessageStreamResponse()     │
       │         (SSE / stream protocol)         ▼
       │                              ┌──────────────────┐
       └──────────────────────────────│  UIMessage[]     │
                                        │  message.parts[] │
                                        └──────────────────┘
```

### Server-side: define tools

```ts
import {streamText, tool, convertToModelMessages, stepCountIs} from 'ai';
import {z} from 'zod';

export async function POST(request: Request) {
  const {messages} = await request.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.5',
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // multi-step tool chains
    tools: {
      displayWeather: tool({
        description: 'Display the weather for a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({location}) => {
          // Returns structured data — NOT JSX
          return {weather: 'Sunny', temperature: 75, location};
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

Key points:

- Tools return **serializable data**, not React nodes (in the recommended client-side rendering model).
- `inputSchema` (Zod) describes arguments the model must produce.
- `outputSchema` (optional, used heavily by Tool UI integrations) validates execute results.
- `stopWhen: stepCountIs(n)` enables multi-step agent loops (model calls tool → gets result → calls another tool → synthesizes answer).

### Client-side: map parts to components

AI SDK 5+ messages expose a **`parts` array** instead of a single `content` string:

```tsx
'use client';

import {useChat} from '@ai-sdk/react';

export function Chat() {
  const {messages, sendMessage} = useChat();

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.text}</span>;
            }

            // Tool parts use typed naming: tool-${toolName}
            if (part.type === 'tool-displayWeather') {
              switch (part.state) {
                case 'input-available':
                  return <div key={index}>Loading weather…</div>;
                case 'output-available':
                  return <Weather key={index} {...part.output} />;
                case 'output-error':
                  return <div key={index}>Error: {part.errorText}</div>;
                default:
                  return null;
              }
            }

            return null;
          })}
        </div>
      ))}
    </>
  );
}
```

### Tool part lifecycle states

| State              | Meaning                                                 | Typical UI                          |
| ------------------ | ------------------------------------------------------- | ----------------------------------- |
| `input-available`  | Model requested tool; args known; execution in progress | Skeleton, spinner, "Loading…"       |
| `output-available` | Tool finished successfully                              | Rich component with `part.output`   |
| `output-error`     | Tool failed                                             | Error message with `part.errorText` |

This state machine is the **contract** every generative UI implementation must respect.

### Historical note: AI SDK RSC / `streamUI`

An older **experimental** pattern ([Generative UI with RSC](https://ai-sdk.dev/docs/ai-sdk-rsc)) allowed server-side tools to **return JSX** streamed via React Server Components. The current recommended approach keeps rendering on the **client** and streams **data** only. Reasons:

- Clear separation of server logic and client design system
- Easier testing and Storybook isolation
- No RSC coupling for non-Next.js apps

### What AI SDK does NOT provide

- Prebuilt chat layout (header, history sidebar, prompt input styling)
- Prebuilt tool-result widgets (weather cards, data tables, approval flows)
- A registry abstraction — you write the `if (part.type === 'tool-…')` switch yourself
- Design system — fully BYO

### Strengths

- Provider-agnostic, widely adopted
- Clean streaming protocol
- Multi-step agents with `stopWhen`
- Works with any React UI library

### Weaknesses

- Boilerplate grows linearly with each new tool type
- No built-in interactive receipt pattern
- Chat chrome is entirely custom unless paired with assistant-ui or AIKit

---

## assistant-ui / Tool UI

**Repository:** [github.com/assistant-ui/tool-ui](https://github.com/assistant-ui/tool-ui)  
**Documentation:** [tool-ui.com/docs/overview](https://www.tool-ui.com/docs/overview)  
**License:** MIT  
**Distribution:** shadcn-style registry (copy source into your repo)

### What it is

**Tool UI** is a component library for rendering **tool call results** in AI chat. It is built by the [assistant-ui](https://github.com/assistant-ui) team and designed to sit on top of **shadcn/ui + Radix + Tailwind**.

It is **not** a full chat framework. For chat state, streaming, and tool orchestration UI, Tool UI expects **[assistant-ui](https://github.com/assistant-ui)** (`@assistant-ui/react`, `@assistant-ui/react-ai-sdk`).

### Position in the stack

```
Radix / shadcn (primitives)
        ↓
    Tool UI (conversation-native widgets + Zod schemas)
        ↓
AI SDK / LangGraph (LLM orchestration)
        ↓
assistant-ui (chat runtime, Toolkit registry, streaming transport)
```

### Distribution model: copy/paste, not dependency lock-in

```bash
# Via shadcn registry
npx shadcn@latest add @tool-ui/link-preview

# Via agent CLI
npx tool-agent "integrate the option list component to let users select from multiple choices"
```

Components land in `@/components/tool-ui/<name>/` with:

- `index.tsx` — React component
- `schema.ts` — Zod schema + `safeParseSerializable{Name}` helper
- Presets for Storybook/demo data

### Component catalog (as of 2026)

| Category             | Components                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Progress**         | Plan, Progress Tracker                                                                         |
| **Input / Decision** | Option List, Parameter Slider, Preferences Panel, Question Flow                                |
| **Display**          | Citation, Geo Map, Item Carousel, Link Preview, Stats Display, Terminal, Weather Widget        |
| **Artifacts**        | Chart, Code Block, Code Diff, Data Table, Instagram Post, LinkedIn Post, Message Draft, X Post |
| **Confirmation**     | Approval Card, Order Summary                                                                   |
| **Media**            | Audio, Image, Image Gallery, Video                                                             |

Each component ships with a **Zod schema** defining the exact JSON shape the tool must return.

### Schema-first rendering

```ts
// Tool returns JSON matching SerializableLinkPreviewSchema
{
  id: "lp-1",
  href: "https://tailwindcss.com/docs",
  title: "Tailwind CSS",
  description: "Rapidly build modern websites..."
}

// Client validates before render
const parsed = safeParseSerializableLinkPreview(result);
return parsed ? <LinkPreview {...parsed} /> : null;
```

Benefits:

- Typed contract between server tool `execute()` and UI
- Safe failure when model returns malformed data
- Same schema usable as AI SDK `outputSchema`

### The Toolkit registry (assistant-ui)

Tool UI integrates through assistant-ui's **`Toolkit`** — a map from tool name → renderer:

```tsx
import {type Toolkit} from '@assistant-ui/react';
import {LinkPreview} from '@/components/tool-ui/link-preview';
import {safeParseSerializableLinkPreview} from '@/components/tool-ui/link-preview/schema';

export const toolkit: Toolkit = {
  previewLink: {
    type: 'backend',
    render: ({result}) => {
      const parsed = safeParseSerializableLinkPreview(result);
      if (!parsed) return null;
      return <LinkPreview {...parsed} />;
    },
  },
};
```

Registered via:

```tsx
const aui = useAui({tools: Tools({toolkit})});

<AssistantRuntimeProvider runtime={runtime} aui={aui}>
  {/* chat thread */}
</AssistantRuntimeProvider>;
```

### Component roles (design guidelines)

Tool UI classifies every widget by **role**:

| Role            | Purpose                                              | Examples                            |
| --------------- | ---------------------------------------------------- | ----------------------------------- |
| **Information** | Display data; user reads more than clicks            | Data Table, Chart, Link Preview     |
| **Decision**    | Choices that return to the assistant; needs receipts | Approval Card, Option List          |
| **Control**     | Reversible parameter tweaks                          | Parameter Slider, Preferences Panel |
| **State**       | Progress / internal activity                         | Progress Tracker, Terminal          |

Design constraints for chat context:

- ~400–600px horizontal width
- Communicate purpose within first ~300px vertical
- 44×44px minimum touch targets
- Limit visible options to 5–7

### Interactive tools and receipts

**Backend tools** — server `execute()` returns data; component displays it.

**Frontend tools** — model calls a tool; UI renders an interactive component; user action calls `addResult(selection)` to send the choice back:

```tsx
selectFormat: {
  description: 'Let the user choose an output format.',
  parameters: SerializableOptionListSchema,
  render: ({ args, toolCallId, result, addResult }) => {
    const parsedArgs = safeParseSerializableOptionList({
      ...args,
      id: args?.id ?? `format-selection-${toolCallId}`,
    });
    if (!parsedArgs) return null;

    return result ? (
      // Receipt state — read-only record of choice
      <OptionList {...parsedArgs} value={undefined} choice={result} />
    ) : (
      <OptionList
        {...parsedArgs}
        value={undefined}
        onAction={(actionId, selection) => {
          if (actionId === 'confirm') {
            void addResult?.(selection);
          }
        }}
      />
    );
  },
},
```

**Receipts** collapse interactive UI into a durable, read-only summary (e.g., only the selected option with a checkmark). This solves the "what did I pick?" problem in long conversations.

### Addressability

Tool UI emphasizes stable **`id`** fields on components and sub-entities (row IDs, option IDs) so the assistant can reference them later ("approve the merge option in the list above"). Backend IDs preferred over array indexes.

### Anti-patterns (from Tool UI docs)

- Free-text input fields inside tool UI (competes with chat composer)
- Hidden mutations without receipts
- Kitchen-sink components needing tabs/navigation
- Redundant narration (assistant and tool UI repeating the same prompt text)

### Strengths

- Rich prebuilt widget catalog
- Schema validation built in
- Interactive decision flows with receipts
- shadcn ownership model (no version lock-in)
- `tool-agent` CLI for agent-driven integration

### Weaknesses

- **Tailwind/shadcn only** — no Gravity UI variant
- Requires assistant-ui runtime for full Toolkit/interactivity story
- Not a complete chat product (no history sidebar, etc. out of the box)
- Styling migration needed for non-Tailwind design systems

---

## Gravity UI AIKit

**Package:** `@gravity-ui/aikit`  
**Repository:** [github.com/gravity-ui/aikit](https://github.com/gravity-ui/aikit)  
**Design system:** [Gravity UI](https://gravity-ui.com/) (`@gravity-ui/uikit`)

### What it is

AIKit is a **full React component library for AI assistant chats**, built on Atomic Design:

```
atoms → molecules → organisms → templates → pages
```

It offers two integration levels:

1. **Page level** — drop-in `ChatContainer` or `AIStudioChat`
2. **Organism level** — compose `Header`, `MessageList`, `PromptInput`, etc.

AIKit is **not** an LLM orchestration layer. It does not ship `streamText`, tool definitions, or provider adapters beyond an optional OpenAI streaming helper.

### Message content model

Assistant messages support **multi-part content**:

```ts
type TMessageContent<Type extends string = string, Data = unknown> = {
  id?: string;
  type: Type;
  data: Data;
};

type TAssistantMessage<TCustomContent = never> = {
  role: 'assistant';
  content: string | TMessageContent | TMessageContent[];
  // ...
};
```

Built-in part types:

| `type`     | Renderer           | Purpose                                           |
| ---------- | ------------------ | ------------------------------------------------- |
| `text`     | `MarkdownRenderer` | Streaming markdown (Yandex Flavored Markdown)     |
| `thinking` | `ThinkingMessage`  | Collapsible reasoning / chain-of-thought          |
| `tool`     | `ToolMessage`      | Tool execution shell with status, expand/collapse |

Custom types extend via generics: `TChatMessage<ChartContent>`.

### MessageRendererRegistry

AIKit's extensibility point for generative UI:

```ts
// src/utils/messageTypeRegistry.ts
export type MessageRendererRegistry = Record<string, MessageRenderer>;

export type MessageRenderer<TContent extends TMessageContent = TMessageContent> = {
  component: React.ComponentType<{part: TContent}>;
};

export function registerMessageRenderer<TContent extends TMessageContent>(
  registry: MessageRendererRegistry,
  contentType: TContent['type'],
  renderer: MessageRenderer<TContent>,
): MessageRendererRegistry;
```

Usage:

```tsx
import {
  createMessageRendererRegistry,
  registerMessageRenderer,
  MessageList,
} from '@gravity-ui/aikit';

type ChartContent = TMessageContent<'chart', {points: number[]; label?: string}>;

const renderers = createMessageRendererRegistry();
registerMessageRenderer<ChartContent>(renderers, 'chart', {
  component: ({part}) => <Chart points={part.data.points} title={part.data.label} />,
});

<MessageList messages={messages} messageRendererRegistry={renderers} status="ready" />;
```

`AssistantMessage` merges custom registries with defaults:

```ts
mergeMessageRendererRegistries(defaultRegistry, customRegistry);
```

Default registry (`createDefaultMessageRegistry`):

- `text` → `MarkdownRenderer`
- `tool` → `ToolMessage`
- `thinking` → `ThinkingMessage`

### ToolMessage — AIKit's native tool shell

`ToolMessage` is a **structural wrapper**, not a rich artifact renderer:

```ts
type ToolMessageProps = {
  toolName: string;
  toolIcon?: React.ReactNode;
  bodyContent?: React.ReactNode; // expandable body — put rich UI here
  headerContent?: React.ReactNode;
  status?: TToolStatus;
  expandable?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  // ...
};

type TToolStatus =
  | 'success'
  | 'error'
  | 'loading'
  | 'waitingConfirmation'
  | 'waitingSubmission'
  | 'cancelled';
```

Features:

- Auto expand/collapse based on status (`useToolMessage` hook)
- Status-driven footer presets (`waitingConfirmation` → Accept/Reject)
- `autoCollapseOnSuccess` / `autoCollapseOnCancelled`

**Important distinction:** AIKit's `ToolMessage` handles **tool execution chrome** (name, status, actions). It does **not** ship prebuilt widgets for charts, tables, approval cards, etc. You put those in `bodyContent` or register separate content types.

### OpenAI streaming adapter

AIKit includes `src/adapters/openai/` with stream event helpers:

| Event kind                                          | Effect                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `text_delta`                                        | Append to last `text` part or create new                     |
| `tool_add`                                          | Insert `{ type: 'tool', id, data: { toolName, status, … } }` |
| `tool_update`                                       | Patch existing tool part by `id`                             |
| `thinking_add` / `thinking_delta` / `thinking_done` | Manage thinking parts                                        |

This adapter speaks AIKit's content model, **not** AI SDK's `UIMessage.parts` protocol directly. A bridge layer is required for AI SDK integration.

### Chat product features (beyond generative UI)

AIKit provides production chat UX that neither AI SDK nor Tool UI address alone:

| Feature                                         | Components                                                   |
| ----------------------------------------------- | ------------------------------------------------------------ |
| Chat history sidebar                            | `History` template                                           |
| Welcome / empty state                           | `EmptyContainer`                                             |
| Prompt input (attachments, suggestions, panels) | `PromptInput` organism                                       |
| File upload                                     | `AttachmentPicker`, `FileUploadDialog`, `useFileUploadStore` |
| Smart scroll                                    | `useSmartScroll`                                             |
| Theming                                         | `--g-aikit-*` CSS variables on Gravity UI                    |
| i18n                                            | `@gravity-ui/i18n` (en, ru)                                  |
| Ready OpenAI page                               | `AIStudioChat`                                               |

### Strengths

- Complete chat UI on Gravity UI (enterprise Yandex ecosystem fit)
- Clean `MessageRendererRegistry` extensibility
- Native tool status UX (`ToolMessage`, thinking blocks)
- OpenAI stream adapter for incremental updates
- Atomic Design — compose only what you need

### Weaknesses

- No prebuilt generative UI widget catalog
- No Zod schema layer for content parts
- No built-in receipt pattern for interactive tool decisions
- No native AI SDK `useChat` / `UIMessage.parts` integration
- `ToolMessage` is a shell — rich artifacts are BYO

---

## Comparative Analysis

### Layer matrix

| Capability                        | AI SDK       | Tool UI                    | AIKit                                 |
| --------------------------------- | ------------ | -------------------------- | ------------------------------------- |
| LLM provider abstraction          | ✅ Core      | ❌ (uses AI SDK)           | Partial (OpenAI adapter)              |
| Tool definition / execution       | ✅           | ❌                         | ❌                                    |
| Streaming protocol                | ✅           | ❌ (via assistant-ui)      | Partial (OpenAI)                      |
| Chat layout (input, list, header) | ❌           | Partial (via assistant-ui) | ✅                                    |
| Tool-result widgets               | ❌           | ✅ Rich catalog            | ❌ (registry only)                    |
| Schema validation (Zod)           | Optional     | ✅ Per component           | ❌                                    |
| Interactive decisions + receipts  | Manual       | ✅ Built-in                | Partial (`ToolMessage` accept/reject) |
| Multi-part message model          | ✅ `parts[]` | ✅ via toolkit             | ✅ `TMessageContent[]`                |
| Design system                     | BYO          | shadcn/Tailwind            | Gravity UI                            |
| Distribution                      | npm packages | Copy/paste registry        | npm package                           |

### Concept mapping

| AI SDK concept                     | Tool UI concept            | AIKit concept                             |
| ---------------------------------- | -------------------------- | ----------------------------------------- |
| `tool({ name })`                   | Toolkit key + Zod schema   | Custom `type` in content part             |
| `part.type === 'tool-foo'`         | `toolkit.foo.render()`     | `registerMessageRenderer(reg, 'foo', …)`  |
| `part.state === 'input-available'` | Loading UI in renderer     | `ToolMessage status="loading"`            |
| `part.output`                      | `result` in render props   | `part.data`                               |
| `addResult()` (frontend tools)     | Built into assistant-ui    | `onAccept` / custom handler → your bridge |
| Receipt after decision             | `choice` prop on component | Custom collapsed renderer state           |

### When to use what

| Scenario                                                     | Recommendation                                |
| ------------------------------------------------------------ | --------------------------------------------- |
| Greenfield Next.js app, shadcn stack, need tool widgets fast | AI SDK + assistant-ui + Tool UI               |
| Enterprise app on Gravity UI, full chat product              | AIKit + AI SDK (with adapter)                 |
| Already have AIKit, want rich tool cards                     | AIKit registry + port/wrap Tool UI components |
| Only need orchestration, custom UI                           | AI SDK alone                                  |
| Only need chat chrome, BYO backend                           | AIKit alone                                   |

---

## Integration Patterns

### Pattern A: AIKit + AI SDK (recommended for Gravity UI teams)

**Goal:** Use AI SDK for server-side tool execution; render results in AIKit.

```
┌──────────────────────────────────────────────────────────────┐
│                        Your Application                       │
├──────────────────────────────────────────────────────────────┤
│  Server (AI SDK)                                              │
│    streamText({ tools }) → toUIMessageStreamResponse()        │
├──────────────────────────────────────────────────────────────┤
│  Client adapter (you write this)                              │
│    UIMessage.parts → TChatMessage[]                         │
│    tool-displayWeather + output-available →                   │
│      { role:'assistant', content:[{ type:'weather', data }] }│
├──────────────────────────────────────────────────────────────┤
│  AIKit                                                        │
│    MessageList + messageRendererRegistry                      │
│      'weather' → <WeatherWidget />                          │
│      'tool'    → <ToolMessage bodyContent={…} />              │
└──────────────────────────────────────────────────────────────┘
```

**Adapter sketch — AI SDK part → AIKit content part:**

```ts
import type { UIMessage } from 'ai';
import type { TAssistantMessage, TMessageContent } from '@gravity-ui/aikit';

function mapToolPartToContentPart(
  part: Extract<UIMessage['parts'][number], { type: `tool-${string}` }>,
): TMessageContent | null {
  const toolName = part.type.replace(/^tool-/, '');

  if (part.state === 'input-available') {
    return {
      type: 'tool',
      id: part.toolCallId,
      data: { toolName, status: 'loading' },
    };
  }

  if (part.state === 'output-error') {
    return {
      type: 'tool',
      id: part.toolCallId,
      data: {
        toolName,
        status: 'error',
        bodyContent: part.errorText,
      },
    };
  }

  if (part.state === 'output-available') {
    // Option 1: dedicated content type per tool (generative UI)
    if (toolName === 'displayWeather') {
      return { type: 'weather', id: part.toolCallId, data: part.output };
    }

    // Option 2: generic tool shell with rich body
    return {
      type: 'tool',
      id: part.toolCallId,
      data: {
        toolName,
        status: 'success',
        bodyContent: <YourWidget {...part.output} />, // or store raw data, render in registry
      },
    };
  }

  return null;
}

export function aiSdkMessageToAikit(message: UIMessage): TAssistantMessage | null {
  if (message.role !== 'assistant') return null;

  const parts: TMessageContent[] = [];
  for (const part of message.parts) {
    if (part.type === 'text') {
      parts.push({ type: 'text', data: { text: part.text } });
    } else if (part.type.startsWith('tool-')) {
      const mapped = mapToolPartToContentPart(part as any);
      if (mapped) parts.push(mapped);
    }
  }

  return { role: 'assistant', content: parts };
}
```

**Register Tool UI-style components in AIKit:**

```tsx
import {safeParseSerializableLinkPreview} from '@/components/tool-ui/link-preview/schema';
import {LinkPreview} from '@/components/tool-ui/link-preview'; // restyled for Gravity UI

registerMessageRenderer(renderers, 'link-preview', {
  component: ({part}) => {
    const parsed = safeParseSerializableLinkPreview(part.data);
    return parsed ? <LinkPreview {...parsed} /> : null;
  },
});
```

Note: Tool UI components use Tailwind/shadcn — expect CSS wrapper work or reimplementation using Gravity UI primitives.

### Pattern B: Tool UI frontend tools → AIKit interactive flow

Tool UI's `addResult()` pattern needs a **callback channel** back to your chat backend. In AIKit:

1. Render interactive widget inside a custom content part or `ToolMessage.bodyContent`.
2. On user confirm, call your API (or append a synthetic user/tool-result message).
3. Re-render in receipt mode by storing the result in message state.

```tsx
registerMessageRenderer(renderers, 'option-list', {
  component: ({part}) => (
    <OptionListBridge
      payload={part.data.payload}
      choice={part.data.choice} // undefined = interactive; set = receipt
      onConfirm={(selection) => {
        part.data.onConfirm?.(selection); // wired by parent chat container
      }}
    />
  ),
});
```

AIKit does not provide `addResult` natively — wire through `onSendMessage` or a dedicated `onToolResult` callback on your chat container.

### Pattern C: AIKit ToolMessage as shell + Tool UI artifact inside

Use AIKit's structural tool chrome with Tool UI body:

```tsx
{
  type: 'tool',
  id: 'call_123',
  data: {
    toolName: 'Search GitHub',
    status: 'success',
    autoCollapseOnSuccess: true,
    bodyContent: <DataTable {...tablePayload} />, // Tool UI component
  },
}
```

Good when you want consistent tool headers/status across all tools while reusing rich body widgets.

### Pattern D: Stay on assistant-ui stack (non-AIKit)

If Gravity UI is not required:

```
AI SDK server → assistant-ui runtime → Tool UI toolkit
```

Fastest path to full generative UI with receipts. Trade-off: shadcn/Tailwind stack, not Gravity UI.

---

## Decision Guide

### Choose **AI SDK only** if…

- You want minimal dependencies
- You already have a design system and chat layout
- Tool count is small (< 5 types)

### Choose **AI SDK + Tool UI (+ assistant-ui)** if…

- You want prebuilt tool widgets quickly
- shadcn/Tailwind is acceptable
- Interactive approvals/selections with receipts matter
- You don't need Gravity UI

### Choose **AIKit** if…

- You need a production chat shell on Gravity UI
- You want `ChatContainer`, history, file upload, theming out of the box
- Yandex ecosystem / `@gravity-ui/uikit` is your design system

### Choose **AIKit + AI SDK adapter** if…

- Gravity UI chat + modern tool-calling/streaming from AI SDK
- You're willing to build (or share) the `UIMessage → TChatMessage` bridge
- You may selectively port Tool UI schemas/components

---

## Risks and Gaps

### Cross-stack integration risks

| Risk                                 | Mitigation                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Two message models (AI SDK vs AIKit) | Single adapter module; unit test part mapping                                                |
| Tool UI Tailwind vs Gravity UI       | Wrap components; restyle; or reimplement from schema only                                    |
| Interactive tool results             | Define explicit `onToolResult` contract in your chat container                               |
| Schema drift                         | Share Zod schemas between server tool and client renderer                                    |
| Docs/API mismatch in AIKit examples  | Registry API uses `{ component }`, not `{ render }` — see `src/utils/messageTypeRegistry.ts` |

### Feature gaps in AIKit (opportunities)

1. **Official AI SDK adapter** — `UIMessage.parts` ↔ `TMessageContent[]` bridge
2. **Generative UI catalog** — Gravity UI-native widgets for common tool outputs
3. **Zod validators** — optional validation layer for custom content types
4. **Receipt pattern** — documented pattern for interactive content parts post-decision
5. **Frontend tool protocol** — standardized callback for user decisions flowing back to LLM

### Feature gaps in Tool UI

1. No Gravity UI / non-Tailwind variants
2. Tight coupling to assistant-ui for full interactivity story
3. Copy/paste model means manual sync when upstream components update

---

## References

### Vercel AI SDK

- [AI SDK Introduction](https://ai-sdk.dev/docs/introduction)
- [Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
- [Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)
- [AI SDK llms.txt](https://ai-sdk.dev/llms.txt) — LLM-friendly doc index
- [Vercel Academy: Multi-Step & Generative UI](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui)

### assistant-ui / Tool UI

- [Tool UI GitHub](https://github.com/assistant-ui/tool-ui)
- [Tool UI Overview](https://www.tool-ui.com/docs/overview)
- [Tool UI Quick Start](https://www.tool-ui.com/docs/quick-start)
- [Tool UI Design Guidelines](https://www.tool-ui.com/docs/design-guidelines)
- [Tool UI Gallery](https://www.tool-ui.com/docs/gallery)
- [assistant-ui GitHub](https://github.com/assistant-ui)

### Gravity UI AIKit

- [AIKit GitHub](https://github.com/gravity-ui/aikit)
- [Architecture](./ARCHITECTURE.md)
- [Examples — Custom Message Renderer](./EXAMPLES.md#3-custom-message-content-renderer)
- [AI Agents Integration](./AI_AGENTS.md)
- [MessageRendererRegistry source](../src/utils/messageTypeRegistry.ts)
- [Default message registry](../src/components/organisms/AssistantMessage/defaultMessageTypeRegistry.tsx)
- [ToolMessage README](../src/components/organisms/ToolMessage/README.md)
- [OpenAI stream adapter](../src/adapters/openai/)

---

## Appendix: Side-by-Side Code Comparison

### Same "weather tool" in all three models

**AI SDK server:**

```ts
displayWeather: tool({
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => ({ weather: 'Sunny', temp: 75, location }),
}),
```

**Tool UI client (assistant-ui toolkit):**

```tsx
displayWeather: {
  type: 'backend',
  render: ({ result }) => {
    const parsed = safeParseSerializableWeatherWidget(result);
    return parsed ? <WeatherWidget {...parsed} /> : null;
  },
},
```

**AIKit client (MessageRendererRegistry):**

```tsx
registerMessageRenderer(renderers, 'weather', {
  component: ({part}) => <WeatherCard {...part.data} />,
});

// Message built by your adapter:
// { role: 'assistant', content: [{ type: 'weather', data: { weather: 'Sunny', temp: 75, location: 'NYC' } }] }
```

All three render the same UX goal; the **wiring layer** differs.

---

_Report generated for the `@gravity-ui/aikit` project. For questions or corrections, open an issue on [gravity-ui/aikit](https://github.com/gravity-ui/aikit/issues)._
