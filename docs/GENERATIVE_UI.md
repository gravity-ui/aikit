# Generative UI

AIKit's Generative UI (GenUI) layer lets a language model render interactive
React components by emitting structured `tool-call` content parts, and lets
those components send a typed result back to the model.

The layer is **additive**: omit `genUIRegistry` from your chat surface and
AIKit behaves exactly as it does today. There is no global state and no React
context — wiring is plain prop drilling through `ChatContainer` →
`ChatContent` → `MessageList` → `AssistantMessage`.

---

## Concepts

### Two registries

| Registry                  | Keyed by       | What it holds                                       |
| ------------------------- | -------------- | --------------------------------------------------- |
| `MessageRendererRegistry` | `content.type` | How to render each part type (`text`, `tool-call`…) |
| `GenUIToolRegistry`       | tool `name`    | Schema + component + optional loading/error slots   |

When `genUIRegistry` is provided, AIKit installs default renderers for
`'tool-call'` and `'tool-result'` into the message renderer registry. The
default `tool-call` renderer is a thin dispatcher: it looks each part up in
the `GenUIToolRegistry` by `toolName` and mounts the registered component.

### Content shape

```ts
type ToolCallMessageContent = {
  type: 'tool-call';
  data: {
    toolCallId: string;
    toolName: string;
    args?: unknown;
    partialArgsText?: string;
    status: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
    error?: {message: string; cause?: unknown};
  };
};

type ToolResultMessageContent = {
  type: 'tool-result';
  data: {
    toolCallId: string;
    toolName: string;
    result: unknown;
  };
};
```

Both are fully serializable so streams and persisted histories are unaffected.

### Lifecycle

The default `tool-call` renderer reacts to `status`:

- `input-streaming` → render `tool.loading ?? <DefaultLoadingSkeleton />`
- `input-available` → validate args; on success mount the component, on
  failure render `tool.error ?? <DefaultErrorSlot />`
- `output-available` → same as `input-available`, plus `previousResult` is
  rehydrated from a sibling `tool-result` part with the same `toolCallId`
- `output-error` → render the error slot with the model-reported error

Each part is wrapped in a per-part error boundary. A render crash in one tool
does **not** affect sibling parts.

---

## Quickstart

```tsx
import {z} from 'zod';
import {ChatContainer, createGenUIToolRegistry, registerGenUITool} from '@gravity-ui/aikit';

const registry = createGenUIToolRegistry();

registerGenUITool(registry, {
  name: 'weather.show',
  description: 'Render a weather card for a city.',
  schema: z.object({city: z.string(), units: z.enum(['c', 'f']).optional()}),
  component: ({args, submitResult}) => (
    <WeatherCard
      city={args.city}
      units={args.units ?? 'c'}
      onAcknowledge={() => submitResult({acknowledged: true})}
    />
  ),
});

<ChatContainer
  messages={messages}
  onSendMessage={handleSend}
  messageListConfig={{
    genUIRegistry: registry,
    onToolResult: (event) => {
      // event.part is a ready-to-append `tool-result` content part;
      // append it to your chat history and forward to the model.
    },
    onGenUIError: (event) => log.warn(event),
  }}
/>;
```

### JSON Schema

Either form is accepted at registration; AIKit normalizes the schema once and
re-uses the compiled validator on every render:

```ts
registerGenUITool(registry, {
  name: 'weather.show',
  schema: {
    type: 'object',
    properties: {city: {type: 'string'}},
    required: ['city'],
    additionalProperties: false,
  },
  component: WeatherCard,
});
```

Zod is treated as an optional peer dependency — install `zod` only if you use
the Zod path. JSON-Schema validation is powered by [Ajv](https://ajv.js.org/).

---

## API

### Tools

```ts
import {
  createGenUIToolRegistry,
  registerGenUITool,
  mergeGenUIToolRegistries,
  getGenUITool,
} from '@gravity-ui/aikit';
```

- `createGenUIToolRegistry()` — empty registry
- `registerGenUITool(registry, definition)` — mutates and returns the registry
- `mergeGenUIToolRegistries(...registries)` — shallow merge, later wins
- `getGenUITool(registry, name)` — lookup, returns `undefined` for unknowns

### Catalog

```ts
import {describeGenUIRegistry} from '@gravity-ui/aikit';

const catalog = describeGenUIRegistry(registry);
// → { tools: [{name, description, parameters: <JSONSchema>}] }
```

Useful for echoing the available tools to the model as a tools-API document.
For Zod schemas without a built-in `toJSONSchema` converter, `parameters` is
`undefined`.

### Chat-surface props

The following props are accepted on `MessageList`, and (because
`MessageListConfig` is `Omit<MessageListProps, …>`) flow through
`ChatContainer.messageListConfig` and `AIStudioChat.messageListConfig`:

| Prop                   | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `genUIRegistry`        | Required to opt into GenUI rendering                                      |
| `onToolResult`         | Called when a component invokes `submitResult(...)`                       |
| `onGenUIError`         | Called on unknown tools, validation failures, render crashes, etc.        |
| `genUIConsumerContext` | Opaque payload forwarded to every component via `context.consumerContext` |

### Component contract

```ts
type GenUIComponentProps<TArgs, TResult> = {
  args: TArgs;
  context: {toolCallId: string; toolName: string; messageId?: string; consumerContext?: unknown};
  submitResult: (result: TResult) => void;
  previousResult?: TResult;
};
```

`submitResult` is event-driven (not effect-driven) and idempotent: the
renderer ignores a second call for the same `toolCallId` and warns in dev.

---

## BC5 — `tool` vs `tool-call`

AIKit already has a `tool` content type powered by `ToolMessageContent` /
`<ToolMessage />`. It is **kept as-is** — it represents a fully presentational
"the agent ran a tool" badge rendered straight from message data.

The new `tool-call` / `tool-result` pair is the **interactive** path: args
flow into a registered component, and the component can send a result back.
Both live side-by-side. No existing renderer is removed; existing chat
histories continue to render identically.

If you currently model interactive tools via a custom message content type,
you can migrate gradually:

1. Start emitting `tool-call` parts alongside (or instead of) your custom
   type.
2. Register your interactive component in `GenUIToolRegistry`.
3. Remove the custom content type once the migration is complete.

---

## See also

- [Storybook → genui/Overview](../src/genui/__stories__/Docs.mdx) — runnable lifecycle and round-trip stories
- [docs/ARCHITECTURE.md → Generative UI](./ARCHITECTURE.md#generative-ui) — high-level placement in the architecture
