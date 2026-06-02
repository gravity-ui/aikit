# Generative UI — Approach Decision

> Recommendation after comparing colleague's toolset pattern, custom message types,
> the `feat(genui)` branch, and existing `ToolMessageContent` in `messages.ts`.

**Date:** 2026-06-02  
**Status:** Design recommendation for team review

---

## TL;DR

**Choose the hybrid: existing `type: 'tool'` + `MessageRendererRegistry` + toolset lookup by `toolName`.**

Do **not** adopt the full branch GenUI registry (`GenUIToolRegistry`, `tool-call` / `tool-result`) as the primary API unless you need library-level schema validation, receipts, and cross-product standardization at scale.

The elegant approach **does** support client callbacks, agent round-trip, and schema validation — with a small app-level extension. See [Extended Capabilities](#extended-capabilities).

---

## Options Compared

| #   | Approach                             | Summary                                                                 |
| --- | ------------------------------------ | ----------------------------------------------------------------------- |
| 1   | Colleague's toolset + `ToolUseBlock` | One generic renderer; dispatch by `toolName` into app toolset           |
| 2   | Custom message types per widget      | `type: 'chart'`, `type: 'weather'`, etc. via `MessageRendererRegistry`  |
| 3   | Branch GenUI module                  | `GenUIToolRegistry` + `tool-call` / `tool-result` + schema validation   |
| 4   | Existing `ToolMessageContent`        | `type: 'tool'` with `ToolMessageProps` (lines 140–142 in `messages.ts`) |
| 5   | Other patterns in `docs/genui/`      | Adapter examples, landscape analysis, minimal DIY flows                 |

---

## Ranking

### 1. Best — `tool` content + custom renderer + toolset lookup

Minimal mental model: **"tool message renders tool component by name."**

Uses existing AIKit entities on maximum:

- `TMessageContent[]`
- `MessageRendererRegistry`
- existing `type: 'tool'`
- existing toolset definitions (`execute`, `displayName`, `icon`, `component`)
- one generic renderer that dispatches by `toolName`

```tsx
type AgentToolContent = TMessageContent<
  'tool',
  ToolMessageContentData & {
    toolCallId?: string;
    args?: unknown;
    result?: unknown;
    error?: unknown;
  }
>;

registerMessageRenderer<AgentToolContent>(registry, 'tool', {
  component: ({part}) => {
    const toolPart = part.data;
    const toolName = toolPart.toolName;

    return (
      <ToolUseContextProvider
        key={toolPart.toolCallId ?? part.id}
        toolName={toolName}
        toolPart={toolPart}
        messageId={part.id ?? ''}
      >
        <ToolUseBlock toolName={toolName} />
      </ToolUseContextProvider>
    );
  },
});
```

`ToolUseBlock` stays thin:

```tsx
function ToolUseBlock({toolName}: {toolName: string}) {
  const toolDef = toolset.tools[toolName];

  if (toolDef?.component) {
    return <toolDef.component />;
  }

  return <GenericToolUseBlock />;
}
```

### 2. Good fallback — colleague's `custom-tool`

Same architecture as #1, but less elegant because it invents another content type while `tool` already exists.

Prefer overriding the default `tool` renderer instead of adding `custom-tool`.

### 3. Per-widget custom messages (`chart`, `weather`, `approval`)

Nice for 2–3 static widgets. Scales badly: every new tool becomes a new message type and a new registry entry keyed by `content.type` instead of `toolName`.

Use for **display-only artifacts**, not as the general tool-call protocol.

### 4. Full branch GenUI registry

Technically solid, but too much for "simple usage":

- Duplicates `MessageRendererRegistry` with `GenUIToolRegistry`
- Adds `tool-call` / `tool-result` alongside existing `tool`
- Adds Ajv + optional Zod peer dep
- Requires learning `submitResult`, `onToolResult`, `onGenUIError`, lifecycle statuses

**Justified when:**

- 10+ interactive tools across products
- Consistent client-side schema validation UX
- Streaming partial tool args (`input-streaming`)
- Standard receipt/rehydration (`previousResult` + sibling `tool-result`)
- Single catalog source for LLM `tools[]` (`describeGenUIRegistry()`)

---

## Recommended Type Change

Extend `ToolMessageContentData` instead of introducing parallel content types:

```ts
export type ToolMessageContentData<TArgs = unknown, TResult = unknown> = ToolMessageProps & {
  toolCallId?: string;
  args?: TArgs;
  result?: TResult;
  error?: unknown;
};
```

This keeps old `ToolMessage` usage intact and lets `tool` become the single natural carrier for model tool calls.

---

## What Each Layer Owns

```
┌─────────────────────────────────────────────────────────────┐
│ App: toolset (execute, component, displayName, icon)      │
│ App: adapter (LLM tool_calls → type: 'tool' parts)        │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│ AIKit: MessageRendererRegistry                              │
│   'tool' → ToolUseContextProvider → ToolUseBlock            │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│ AIKit: ToolMessage shell (optional chrome for generic tools)  │
│   status, expand/collapse, accept/reject                      │
└─────────────────────────────────────────────────────────────┘
```

**Keep in app code (not AIKit core) unless team commits to Layer 3:**

- Second registry keyed by tool name (`GenUIToolRegistry`)
- Built-in round-trip protocol (`submitResult` → `tool-result` parts)
- Shared Ajv/Zod validation helpers across products

App-level toolset can still provide callbacks, agent round-trip, and per-tool schema validation without shipping `src/genui/`.

---

## Extended Capabilities

> Can the elegant approach support client callbacks, sending responses to the agent, and schema validation?

**Yes — all three.** You do not need `GenUIToolRegistry`. The existing **toolset becomes the registry**.

### Capability matrix

| Requirement            | Elegant approach | How                                                                                     |
| ---------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| Client callbacks       | ✅               | `execute` / `submitResult` wired in renderer or context — not stored in message content |
| Send response to agent | ✅               | `onToolResult` handler appends result to history + forwards to agent API                |
| Schema validation      | ✅               | `schema.validate(args)` on tool definition before render                                |

### Extended tool definition

Add `schema` and typed component props to the existing toolset entry:

```ts
type ToolDef<TArgs = unknown, TResult = unknown> = {
  execute?: (args: TArgs) => Promise<TResult> | TResult;
  schema?: {
    validate: (input: unknown) => {success: true; data: TArgs} | {success: false; error: unknown};
  };
  component?: React.ComponentType<{
    args: TArgs;
    result?: TResult;
    status?: ToolMessageProps['status'];
    submitResult: (result: TResult) => void;
  }>;
  displayName?: [string, string];
  icon?: React.ComponentType;
};
```

Zod example inside toolset:

```ts
import {z} from 'zod';

const StartSkillArgs = z.object({skillId: z.string()});

[ToolName.StartSkill]: {
  schema: {
    validate: (input) => {
      const parsed = StartSkillArgs.safeParse(input);
      return parsed.success
        ? {success: true, data: parsed.data}
        : {success: false, error: parsed.error};
    },
  },
  component: ToolStartSkill,
  execute: executeStartSkill,
  displayName: [i18n('tool_start_skill'), i18n('tool_start_skill_complete')],
},
```

### Renderer with validation + round-trip

Override the default `tool` renderer once:

```tsx
registerMessageRenderer<ToolMessageContent>(registry, 'tool', {
  component: ({part}) => {
    const toolPart = part.data;
    const toolDef = toolset.tools[toolPart.toolName];

    if (!toolDef) {
      return <ToolMessage {...toolPart} status="error" bodyContent="Unknown tool" />;
    }

    const validation = toolDef.schema?.validate(toolPart.args) ?? {
      success: true,
      data: toolPart.args,
    };

    if (!validation.success) {
      return <ToolMessage {...toolPart} status="error" bodyContent="Invalid tool arguments" />;
    }

    const submitResult = (result: unknown) => {
      onToolResult({
        toolCallId: toolPart.toolCallId ?? part.id,
        toolName: toolPart.toolName,
        result,
      });
    };

    if (toolDef.component) {
      const Component = toolDef.component;
      return (
        <Component
          args={validation.data}
          result={toolPart.result}
          status={toolPart.status}
          submitResult={submitResult}
        />
      );
    }

    return <ToolMessage {...toolPart} />;
  },
});
```

### Agent round-trip handler

App owns persistence and API forwarding:

```ts
function onToolResult(event: {toolCallId?: string; toolName: string; result: unknown}) {
  // 1. Update chat history (receipt / success state)
  appendMessagePart({
    type: 'tool',
    id: event.toolCallId,
    data: {
      toolCallId: event.toolCallId,
      toolName: event.toolName,
      status: 'success',
      result: event.result,
    },
  });

  // 2. Forward to agent / LLM
  sendToAgent({
    role: 'tool',
    tool_call_id: event.toolCallId,
    name: event.toolName,
    content: JSON.stringify(event.result),
  });
}
```

### End-to-end flow

```
LLM tool call
  → { type: 'tool', data: { toolName, toolCallId, args, status } }
  → MessageRendererRegistry['tool']
  → toolset.tools[toolName]
  → schema.validate(args)
  → render tool component
  → user action → submitResult(result)
  → onToolResult → append to history + sendToAgent
```

### Rule: callbacks stay out of message content

Message `content[]` must stay **serializable** (persist, replay, stream).

| Put in message content                               | Put in renderer / context                 |
| ---------------------------------------------------- | ----------------------------------------- |
| `toolName`, `toolCallId`, `args`, `result`, `status` | `submitResult`, `execute`, `onToolResult` |
| Validation errors as data if needed                  | Schema validators from toolset            |

Callbacks live in the renderer or `ToolUseContextProvider`, not in `part.data`.

### vs branch GenUI module

| Concern                | Elegant + extension                      | Branch `src/genui/`                                |
| ---------------------- | ---------------------------------------- | -------------------------------------------------- |
| Client callbacks       | App toolset + `submitResult` in renderer | Built-in `GenUIComponentProps.submitResult`        |
| Agent round-trip       | App `onToolResult`                       | Built-in `onToolResult` + `tool-result` part shape |
| Schema validation      | Per-tool in toolset (Zod/Ajv in app)     | Centralized `validateArgs` + Ajv in library        |
| Receipt rehydration    | `part.data.result` on same `tool` part   | Sibling `tool-result` lookup + `previousResult`    |
| Streaming partial args | DIY in adapter                           | `input-streaming` lifecycle built-in               |
| LLM tools catalog      | Hand-maintained or derive from toolset   | `describeGenUIRegistry()`                          |

For most agent-chat products with an existing toolset, the elegant extension is enough. Adopt branch GenUI when you want those lifecycle/catalog helpers shared across many Gravity UI products without reimplementing them.

---

## Decision Matrix

| Scenario                                              | Recommended approach                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Agent chat with toolset + a few interactive widgets   | **#1 — `tool` + renderer + toolset**                                |
| 2–3 display-only widgets, no tool round-trip          | Custom message types (`chart`, etc.)                                |
| Many products, many tools, shared validation/receipts | Branch GenUI module (Layer 3)                                       |
| Need only serializable protocol shapes                | Keep `ToolCallMessageContent` types in `messages.ts`; skip registry |

---

## One-Liner for Design Review

> **MessageRendererRegistry was always the generative UI extension point. The colleague's toolset pattern is the simplest path: one `tool` renderer, lookup by `toolName`, reuse existing tool definitions. The branch GenUI module is optional sugar for scale — not the default.**

---

## See Also

- [INSIGHTS.md](./INSIGHTS.md) — branch review and layer model
- [toolsets.tsx.md](./toolsets.tsx.md) — colleague's toolset definitions
- [ToolUseBlock.tsx.md](./ToolUseBlock.tsx.md) — colleague's dispatcher component
- [useChatMessages.tsx.md](./useChatMessages.tsx.md) — colleague's registry wiring
- [GENERATIVE_UI.md](../GENERATIVE_UI.md) — branch GenUI user guide
- [GENERATIVE_UI_LANDSCAPE.md](./GENERATIVE_UI_LANDSCAPE.md) — ecosystem comparison
