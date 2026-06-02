# Generative UI — Insights, Decisions & Architecture Notes

> Consolidated findings from branch review, team-lead feedback, and integration analysis.
> Complements [GENERATIVE_UI_REQUIREMENTS.md](./GENERATIVE_UI_REQUIREMENTS.md), [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md), and [GENERATIVE_UI.md](../GENERATIVE_UI.md).

**Date:** 2026-06-02  
**Branch:** `feat(genui)` — 1 commit vs `main`, ~3,880 lines, 34 files  
**Status:** Working notes for design review; not a normative spec.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Phase 1 Actually Shipped](#2-what-phase-1-actually-shipped)
3. [Two Parallel Mechanisms in AIKit](#3-two-parallel-mechanisms-in-aikit)
4. [BC5 — `tool` vs `tool-call` Explained](#4-bc5--tool-vs-tool-call-explained)
5. [LLM Integration — What AIKit Does NOT Do](#5-llm-integration--what-aikit-does-not-do)
6. [The Pre-Existing Pattern (Team-Lead Point)](#6-the-pre-existing-pattern-team-lead-point)
7. [GenUI Module vs MessageRendererRegistry](#7-genui-module-vs-messagerendererregistry)
8. [Layer Model — Where Each Piece Belongs](#8-layer-model--where-each-piece-belongs)
9. [Team-Lead Feedback — How to Rethink](#9-team-lead-feedback--how-to-rethink)
10. [Minimal GenUI Without `src/genui/`](#10-minimal-genui-without-srcgenui)
11. [When the Full GenUI Module Is Justified](#11-when-the-full-genui-module-is-justified)
12. [Decision Checklist for the Team](#12-decision-checklist-for-the-team)
13. [Suggested Talking Points for Design Review](#13-suggested-talking-points-for-design-review)
14. [Uncommitted Local Work (Not in Branch)](#14-uncommitted-local-work-not-in-branch)
15. [Known Doc / API Inconsistencies](#15-known-doc--api-inconsistencies)
16. [Open Questions](#16-open-questions)
17. [Can Custom Components Replace the GenUI Module?](#17-can-custom-components-replace-the-genui-module)

---

## 1. Executive Summary

Phase 1 introduced **`src/genui/`** — an opt-in Generative UI layer on top of AIKit's existing chat stack. It adds:

- New serializable content types: `tool-call`, `tool-result`
- A second registry: `GenUIToolRegistry` (keyed by **tool name**)
- Schema validation (Zod optional peer, JSON Schema via Ajv)
- Lifecycle handling (`input-streaming` → `input-available` → `output-available` / `output-error`)
- Interactive round-trip plumbing (`submitResult` → `onToolResult` → persist `tool-result`)
- Default renderers wired through existing `MessageRendererRegistry`

**Critical insight:** AIKit **already supported generative UI** before this branch via `MessageRendererRegistry` + custom content types (e.g. `type: 'chart'` in `MessageList.stories.tsx`). GenUI does **not** introduce a new rendering capability — it **standardizes the LLM tool-call protocol** and packages conveniences (schema, lifecycle, round-trip) as library infrastructure.

**Team-lead concern (valid):** Building a second registry + module may be over-engineering if products only need a few static widgets and can map LLM output → custom content types in application code.

**Resolution framing:** GenUI is **Layer 3 optional sugar** on **Layer 1** (`MessageRendererRegistry`). The team must decide whether Layer 3 belongs in the library or in consumer apps.

---

## 2. What Phase 1 Actually Shipped

### Commit

```
a18804f feat(genui): introduce Generative UI support with tool-call and tool-result components
```

### Code (`src/genui/`)

| Area      | Files                 | Role                                                                           |
| --------- | --------------------- | ------------------------------------------------------------------------------ |
| Types     | `types.ts`            | `GenUITool`, `GenUIComponentProps`, `ToolResultEvent`, `GenUIErrorEvent`       |
| Registry  | `registry.ts`         | `createGenUIToolRegistry`, `registerGenUITool`, `mergeGenUIToolRegistries`     |
| Schema    | `schema.ts`           | `normalizeSchema`, `validateArgs` — Zod duck-typed or JSON Schema + Ajv        |
| Catalog   | `describeRegistry.ts` | `describeGenUIRegistry()` → JSON Schema tool list for LLM `tools[]`            |
| Renderers | `renderers/*`         | `ToolCallRenderer`, loading/error slots, error boundary, unknown-tool fallback |

### Integration points (modified)

- `src/types/messages.ts` — `ToolCallMessageContent`, `ToolResultMessageContent`, `ToolCallStatus`
- `AssistantMessage.tsx` — `genUIRegistry`, `onToolResult`, `onGenUIError`, `genUIConsumerContext`; auto-registers `tool-call` / `tool-result` renderers
- `MessageList.tsx` — forwards GenUI props
- `ChatContainer` / `AIStudioChat` — **unchanged**; props flow via `messageListConfig`
- `package.json` — `@gravity-ui/aikit/genui` subpath, `ajv` dep, optional `zod` peer

### Tests & Storybook (committed)

- Unit tests: registry + schema (12 new)
- `GenUIOverview.stories.tsx` — lifecycle + round-trip (fixture data, no LLM)
- `Docs.mdx` — overview

### Explicitly deferred

- Playwright visual specs (Docker snapshots)
- Built-in molecules (`ApprovalCard`, `OptionList`) — Phase 2
- Streaming-args hardening, telemetry — Phase 3
- Lockfile update for new deps

---

## 3. Two Parallel Mechanisms in AIKit

After Phase 1, AIKit has **two registries** with different keys:

| Registry                  | Keyed by       | Holds                                    | Used when                                                  |
| ------------------------- | -------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `MessageRendererRegistry` | `content.type` | `{ component }` per part type            | Always (text, thinking, tool, custom types, **tool-call**) |
| `GenUIToolRegistry`       | `toolName`     | schema + component + loading/error slots | Only when `genUIRegistry` prop is set                      |

**Data flow with GenUI enabled:**

```
Model / adapter produces message parts
  → AssistantMessage normalizes content[]
  → MessageRendererRegistry dispatches by part.type
  → For type 'tool-call': ToolCallRenderer (default, from GenUI)
  → ToolCallRenderer looks up part.data.toolName in GenUIToolRegistry
  → Validates args → mounts registered component
  → User calls submitResult()
  → onToolResult event → host appends tool-result part
  → Component re-renders with previousResult (receipt mode)
```

**Opt-in guarantee:** Omit `genUIRegistry` → zero behavior change. No global state, no React context.

**Ownership rule:** AIKit never mutates `content[]`. The host appends `tool-result` parts and forwards them to the model.

---

## 4. BC5 — `tool` vs `tool-call` Explained

**BC5** = Backwards Compatibility requirement #5 from the engineering spec.

It means: the **old** `tool` content type is **not replaced** by `tool-call`. Both coexist.

### Old path: `type: 'tool'` → `<ToolMessage />`

- **Purpose:** Presentational shell — "the agent ran a tool"
- **Data:** `{ toolName, status, bodyContent, headerContent, onAccept, onReject, … }`
- **Statuses:** `loading`, `success`, `error`, `waitingConfirmation`, `waitingSubmission`, `cancelled`
- **Used by:** OpenAI streaming adapter (`tool_add` / `tool_update` events)
- **Interaction:** Accept/Reject buttons on shell; no standardized round-trip to model
- **Rich UI:** You put widgets in `bodyContent` or use separate custom content types

Example part:

```json
{
  "type": "tool",
  "id": "call_abc",
  "data": {
    "toolName": "search",
    "status": "success",
    "bodyContent": "…"
  }
}
```

### New path: `type: 'tool-call'` + `type: 'tool-result'` → GenUI

- **Purpose:** Interactive, model-driven UI with typed args and result loop
- **Data:** `{ toolCallId, toolName, args, status, partialArgsText?, error? }`
- **Statuses:** `input-streaming`, `input-available`, `output-available`, `output-error`
- **Interaction:** `submitResult()` → `onToolResult` → host persists `tool-result` → forward to model
- **Rich UI:** Registered component in `GenUIToolRegistry`, schema-validated args

Example parts:

```json
{
  "type": "tool-call",
  "data": {
    "toolCallId": "call_abc",
    "toolName": "weather_show",
    "args": {"city": "Berlin"},
    "status": "input-available"
  }
}
```

```json
{
  "type": "tool-result",
  "data": {
    "toolCallId": "call_abc",
    "toolName": "weather_show",
    "result": {"acknowledged": true}
  }
}
```

### Why two mechanisms?

|                         | `tool`                              | `tool-call`                            |
| ----------------------- | ----------------------------------- | -------------------------------------- |
| Who constructs the part | Consumer / OpenAI adapter           | Consumer adapter from LLM `tool_calls` |
| Component lookup        | N/A (shell) or manual `bodyContent` | `GenUIToolRegistry` by name            |
| Schema validation       | None built-in                       | Zod / JSON Schema                      |
| Standard round-trip     | DIY                                 | `submitResult` / `tool-result`         |
| Migration               | None required                       | Opt-in                                 |

**Analogy:** `tool` = generic notification card; `tool-call` = typed widget with a contract and feedback channel to the model.

---

## 5. LLM Integration — What AIKit Does NOT Do

GenUI is a **rendering and protocol layer**, not an orchestration layer.

### AIKit does NOT:

- Call LLM APIs
- Automatically mark responses as `tool-call`
- Force models to use tools
- Convert arbitrary LLM output to AIKit parts without an adapter

### What the integrator must build:

1. **Registry** — `registerGenUITool` (schema + component)
2. **Catalog → API** — `describeGenUIRegistry()` → `tools[]` in request body
3. **Outbound adapter** — AIKit messages → provider format (e.g. OpenAI Chat Completions)
4. **Inbound adapter** — `tool_calls` in response → `{ type: 'tool-call', data: … }`
5. **Round-trip** — `onToolResult` → append `tool-result` → re-request with `role: 'tool'`

Reference implementation: `src/genui/__stories__/Live.stories.tsx` (uncommitted) + `examples/genui-live-proxy/`.

### LLM requirements

- **Not** a specific vendor model
- **Yes** function/tool calling support in the API you use (OpenAI-compatible `tools` + `tool_calls` is the reference in Live story)
- Model **decides** whether to call a tool (`tool_choice: 'auto'`) or reply with plain text
- Text-only models or models that ignore `tools` → no `tool-call` parts, GenUI never activates

### Can you use GenUI without a live LLM?

**Yes.** `GenUIOverview.stories.tsx` hardcodes `tool-call` parts in fixtures — pure client-side rendering test.

---

## 6. The Pre-Existing Pattern (Team-Lead Point)

Before GenUI, AIKit documented and demonstrated generative UI via **`MessageRendererRegistry`**:

**Docs:** `docs/ARCHITECTURE.md` (Custom Message Content Renderers), `docs/GETTING_STARTED.md`  
**Story:** `MessageList.stories.tsx` → `WithCustomMessageType`

```tsx
type ChartMessageContent = TMessageContent<'chart', ChartMessageData>;

registerMessageRenderer<ChartMessageContent>(customRegistry, 'chart', {
  component: ChartMessageView, // ({ part }) => ...
});

// Message contains:
content: [
  {type: 'text', data: {text: 'Here is your chart…'}},
  {type: 'chart', data: {chartData, chartType: 'bar'}},
];
```

This **is** generative UI:

- Structured data in message history (serializable)
- Custom React component rendered inline in chat
- Extensible via registry

What it **lacks** for real LLM flows:

- Dynamic tool names from model (`tool_calls[].function.name`)
- Args validation before render
- Streaming partial args lifecycle
- Standardized user action → result → model loop
- Single catalog source for LLM `tools[]` parameter
- Receipt / rehydration after reload (`previousResult`)

The team-lead's point: **rendering was already solved**. The open question is how much protocol plumbing belongs in the library vs. application adapters.

---

## 7. GenUI Module vs MessageRendererRegistry

### Side-by-side comparison

| Concern                   | `MessageRendererRegistry` + custom type (`chart`) | GenUI (`tool-call` + `GenUIToolRegistry`) |
| ------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Registry key              | `content.type` (`'chart'`, `'weather'`, …)        | `toolName` (`'weather_show'`, …)          |
| One type per widget?      | Typically yes                                     | No — one `tool-call` type, many tools     |
| Who maps LLM → part       | Your adapter                                      | Your adapter (same work)                  |
| Schema validation         | DIY in adapter                                    | Built-in (Zod / JSON Schema)              |
| Loading while args stream | DIY                                               | `input-streaming` + default skeleton      |
| Validation errors         | Component crash or DIY                            | Default error slot + `onGenUIError`       |
| User → model round-trip   | DIY props/callbacks                               | `submitResult` → `onToolResult`           |
| Receipt after decision    | DIY (`previousResult`-like state)                 | `previousResult` + sibling `tool-result`  |
| LLM tools catalog         | Manual `tools[]` array                            | `describeGenUIRegistry()`                 |
| Error isolation           | Whole part may break message                      | Per-part error boundary                   |
| Library surface           | Already public, stable                            | New module, new deps (Ajv)                |

### What GenUI's `ToolCallRenderer` actually is

It is a **generic dispatcher** registered as the renderer for `content.type === 'tool-call'`:

```tsx
// Conceptually equivalent app-level code:
registerMessageRenderer(reg, 'tool-call', {
  component: ({ part }) => {
    const tool = toolsByName[part.data.toolName];
    if (!tool) return <UnknownTool />;
    const validated = tool.schema.safeParse(part.data.args);
    if (!validated.success) return <Error />;
    return <tool.component args={validated.data} onResult={…} />;
  },
});
```

GenUI codifies this pattern once in the library instead of every product reimplementing it.

---

## 8. Layer Model — Where Each Piece Belongs

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 0: LLM provider (OpenAI, Claude, Yandex, vLLM, …)   │
│          tools[] in request → tool_calls in response         │
└───────────────────────────────┬─────────────────────────────┘
                                │ YOUR ADAPTER
┌───────────────────────────────▼─────────────────────────────┐
│ Layer 1: AIKit message model (ALREADY EXISTS)               │
│          TMessageContent[] — text, thinking, tool, custom   │
│          MessageRendererRegistry — type → component          │
└───────────────────────────────┬─────────────────────────────┘
                                │ OPTIONAL
┌───────────────────────────────▼─────────────────────────────┐
│ Layer 2: Standard tool-call / tool-result content shapes    │
│          (types in messages.ts — shipped in Phase 1)         │
│          Serializable, persistable, adapter-friendly         │
└───────────────────────────────┬─────────────────────────────┘
                                │ OPTIONAL
┌───────────────────────────────▼─────────────────────────────┐
│ Layer 3: GenUI module (src/genui/ — shipped in Phase 1)     │
│          GenUIToolRegistry, schema validation, lifecycle,    │
│          submitResult, describeGenUIRegistry, default UI       │
└─────────────────────────────────────────────────────────────┘
```

**Team decision = which layers to keep in `@gravity-ui/aikit` vs. ship as examples/docs only.**

---

## 9. Team-Lead Feedback — How to Rethink

### What the team lead is saying

> "We already have `MessageRendererRegistry`. Register `chart`, `weather`, whatever. Map LLM tool calls in the adapter. Don't build a framework inside the framework."

### What that implies

**Minimal library change:**

- Keep `ToolCallMessageContent` / `ToolResultMessageContent` types (Layer 2) — useful protocol shapes
- Document adapter patterns in docs + Storybook example
- Do **not** ship `GenUIToolRegistry`, Ajv, lifecycle renderers in core — or demote to `@gravity-ui/aikit/genui` optional subpath only

**App-level GenUI:**

```tsx
// Per-widget content types (like chart)
registerMessageRenderer(reg, 'weather', {component: WeatherView});
registerMessageRenderer(reg, 'approval', {component: ApprovalView});

// Adapter maps LLM tool_calls:
//   weather_show → { type: 'weather', data: parsedArgs }
//   approval_request → { type: 'approval', data: parsedArgs }
```

**Single generic dispatcher (middle ground):**

```tsx
registerMessageRenderer(reg, 'tool-call', {
  component: AppToolCallDispatcher, // switch on part.data.toolName
});
// All GenUI logic lives in app code, not src/genui/
```

### Strongest argument FOR keeping GenUI in the library

Products with **many tools** will duplicate:

- Per-tool schema validation
- Loading/error states
- `submitResult` idempotency
- `toolCallId` ↔ `tool-result` linking
- `describeGenUIRegistry` for LLM prompts

Centralizing this avoids N copies across Gravity UI chat products.

### Strongest argument FOR team-lead's approach

- Smaller library, fewer deps, simpler mental model
- `MessageRendererRegistry` is the documented extension point since day one
- Landscape doc already shows Pattern A: AI SDK → adapter → `type: 'weather'` → registry
- Phase 1 shipped ~400 lines of renderer/schema code for problems apps can solve in ~50 lines when tool count is low

---

## 10. Minimal GenUI Without `src/genui/`

End-to-end flow using **only** existing APIs:

### 1. Define content types + renderers

```tsx
type WeatherContent = TMessageContent<'weather', {city: string; value: number}>;

function WeatherView({part}: MessageContentComponentProps<WeatherContent>) {
  const {city, value} = part.data;
  return (
    <Card>
      {city}: {value}°
    </Card>
  );
}

const reg = createMessageRendererRegistry();
registerMessageRenderer(reg, 'weather', {component: WeatherView});
```

### 2. Adapter: LLM response → AIKit parts

```tsx
function openAiToolCallsToParts(toolCalls: OpenAiToolCall[]): TMessageContentUnion[] {
  return toolCalls.map((call) => {
    const args = JSON.parse(call.function.arguments);
    if (call.function.name === 'weather_show') {
      return {type: 'weather', id: call.id, data: args};
    }
    return {type: 'text', data: {text: `Unknown tool: ${call.function.name}`}};
  });
}
```

### 3. Interactive round-trip (DIY)

```tsx
function WeatherViewInteractive({part, onAck}: Props) {
  return (
    <Card>
      …<Button onClick={() => onAck(part.id, {acknowledged: true})}>Got it</Button>
    </Card>
  );
}

// Host handler:
function handleAck(toolCallId: string, result: unknown) {
  appendToHistory({type: 'tool-result-custom', data: {toolCallId, result}});
  resendToModelWithToolResult(toolCallId, result);
}
```

No GenUI module required. You own schema validation (Zod in adapter), receipts, and LLM catalog.

---

## 11. When the Full GenUI Module Is Justified

Keep / expand `src/genui/` if the team commits to:

| Requirement                                | Why GenUI helps                                           |
| ------------------------------------------ | --------------------------------------------------------- |
| 10+ interactive tools across products      | Tool-name registry scales better than N content types     |
| Consistent validation UX                   | Shared error slots, dev warnings                          |
| Streaming tool args                        | `input-streaming` lifecycle                               |
| Standard receipt/rehydration               | `previousResult` + `tool-result` sibling lookup           |
| Single source for LLM `tools[]`            | `describeGenUIRegistry()`                                 |
| First-party widget catalog (Phase 2)       | `ApprovalCard`, `OptionList` register into GenUI registry |
| Cross-provider adapters in `src/adapters/` | Standard `tool-call` shape as adapter target              |

Skip or shrink GenUI if:

- 2–3 widgets, one LLM provider, one product
- Team prefers explicit content types (`chart`, `weather`) for clarity
- Validation happens server-side only
- No interactive round-trip (display-only artifacts)

---

## 12. Decision Checklist for the Team

Answer these in a design review:

1. **Tool count:** How many GenUI widgets do we expect across products in 12 months?
2. **Registry model:** One `tool-call` dispatcher vs. one content type per widget?
3. **Validation:** Client-side (Ajv/Zod in library) or server-only?
4. **Interactivity:** Do we need standardized `submitResult` → model loop?
5. **Streaming args:** Do we stream partial JSON for tool arguments?
6. **Adapter ownership:** Library (`src/adapters/`) or application code?
7. **Dependencies:** Is `ajv` + optional `zod` peer acceptable in core package?
8. **Backwards compat:** Are existing `tool` + OpenAI adapter consumers unaffected? (Yes today — BC5.)
9. **Documentation:** Fix ARCHITECTURE/GETTING_STARTED examples to match real API?

---

## 13. Suggested Talking Points for Design Review

### If defending Phase 1 as-is

- GenUI **extends** `MessageRendererRegistry`, does not replace it (`NG4` in requirements)
- The `chart` story proves render extensibility; GenUI solves **LLM tool-call protocol**, not rendering
- `tool-call` / `tool-result` types are adapter-friendly and serializable (Layer 2 value even if Layer 3 shrinks)
- Opt-in: zero cost for existing consumers
- Landscape analysis shows enterprise Gravity UI teams need adapter + registry; GenUI reduces repeated boilerplate

### If accepting team-lead direction to simplify

- Propose **split PR strategy:**
  - PR A (keep): `ToolCallMessageContent` / `ToolResultMessageContent` types + docs + adapter example story
  - PR B (defer): `GenUIToolRegistry`, Ajv, default renderers → optional package or Phase 2
- Rewrite Live story using `MessageRendererRegistry` + per-tool types as reference
- Align ARCHITECTURE.md GenUI section with "custom content types" narrative first, GenUI module second

### Neutral framing (recommended)

> "MessageRendererRegistry was always our generative UI extensibility point. Phase 1 adds a **standard tool-call protocol** and optional conveniences. We should decide whether conveniences live in the library or in a reference adapter/example."

---

## 14. Uncommitted Local Work (Not in Branch)

These files exist in the working tree but are **not** in the commit vs `main`:

| Path                                     | Purpose                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/genui/__stories__/Live.stories.tsx` | Full `ChatContainer` demo with real LLM via proxy; OpenAI Chat Completions adapter; round-trip |
| `examples/genui-live-proxy/`             | Node proxy keeping API key server-side; forwards to `/v1/chat/completions`                     |

The Live story demonstrates the **full integration stack** that the library intentionally does not ship:

- `describeGenUIRegistry()` → `tools[]`
- `messagesToChatCompletions()` / `chatCompletionsToAssistantMessage()`
- `onToolResult` → append `tool-result` → resend

Consider committing these as **examples** regardless of GenUI module scope decision.

---

## 15. Known Doc / API Inconsistencies

Fix separately (discovered during review):

| Location                                           | Issue                                | Correct API                            |
| -------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| `docs/ARCHITECTURE.md` ~L218                       | `render: ({content})`                | `component: ({part})`                  |
| `docs/GETTING_STARTED.md` ~L147                    | `render: ({content})`                | `component: ({part})`                  |
| `GENERATIVE_UI_LANDSCAPE.md` (pre-Phase 1 section) | Says AIKit has "no Zod schema layer" | Partially outdated after Phase 1 GenUI |
| `IMPLEMENTATION_REPORT.md`                         | Notes lockfile not updated for `ajv` | Run `npm install` before publish       |

Reference (correct pattern):

```tsx
registerMessageRenderer<ChartMessageContent>(registry, 'chart', {
  component: ({part}) => <ChartView data={part.data} />,
});
```

See `MessageList.stories.tsx` → `WithCustomMessageType`.

---

## 16. Open Questions

1. Should `src/genui/` remain in core `@gravity-ui/aikit` or move to `@gravity-ui/aikit/genui` optional entry only?
2. Should OpenAI adapter emit `tool-call` parts (GenUI) in addition to legacy `tool` parts?
3. Do we ship first-party GenUI widgets (Phase 2) or only registry + docs?
4. Is one generic `tool-call` content type preferred over per-tool types (`weather`, `chart`)?
5. Who owns the LLM adapter — AIKit `src/adapters/` or consumer applications?
6. Should Live story + proxy be merged as official getting-started path for GenUI?

---

## 17. Can Custom Components Replace the GenUI Module?

**Short answer:** Yes — **functionally 100% reproducible**. No — if “completely solved” means zero duplicated boilerplate across products.

### Why “yes” at the API level

`src/genui/` uses **no private AIKit APIs**. `ToolCallRenderer` is literally a `MessageRenderer` registered for `content.type === 'tool-call'`:

```tsx
// src/genui/renderers/ToolCallRenderer.tsx
export function createToolCallRenderer(options): MessageRenderer<ToolCallMessageContent> {
  return {component: (props) => <ToolCallPart {...props} {...options} />};
}
```

Equivalent app-level wiring:

```tsx
registerMessageRenderer(reg, 'tool-call', createToolCallRenderer({ genUIRegistry, onToolResult, ... }));
// Or paste ToolCallPart logic into your own AppToolCallDispatcher component.
```

Anything in the branch can live in application code; the library does not gatekeep it.

### What Custom Components already solve (Layer 1)

| Capability                                       | Custom `MessageRendererRegistry`                              |
| ------------------------------------------------ | ------------------------------------------------------------- |
| Map `content[]` part → React component           | ✅ (`registerMessageRenderer`, `WithCustomMessageType` story) |
| Serializable history / streaming                 | ✅ (`TMessageContent`, custom `type` + `data`)                |
| One content type per widget (`chart`, `weather`) | ✅                                                            |
| Rich UI in chat                                  | ✅                                                            |

**Rendering was never the gap.** GenUI does not add a new rendering capability — it standardizes the **LLM tool-call protocol** and packages conveniences.

### What you re-implement without `src/genui/` (Layer 3)

| Branch feature                                          | DIY with custom components                 |
| ------------------------------------------------------- | ------------------------------------------ |
| `GenUIToolRegistry` keyed by `toolName`                 | `toolsByName` map + dispatcher `switch`    |
| `validateArgs` (Zod / Ajv, `schema.ts`)                 | Per-tool validation in adapter or renderer |
| `submitResult` idempotency (`ToolCallRenderer` L78–100) | `submittedRef` + dev warning               |
| `tool-result` part shape + `onToolResult` event         | Custom round-trip contract                 |
| `previousResult` via sibling `tool-result` lookup       | Custom `findSiblingResult`                 |
| Lifecycle (`input-streaming`, `output-error`, …)        | Status branching in your renderer          |
| `ToolPartErrorBoundary`                                 | Your own per-part boundary                 |
| `describeGenUIRegistry()` → LLM `tools[]`               | Hand-maintained tools catalog              |
| Unknown-tool UI + `onGenUIError` taxonomy               | DIY                                        |

Roughly **~400 lines** of dispatcher/schema/lifecycle/round-trip in the branch → **~50 lines per product** when tool count is low; **N copies** when many Gravity UI chat products each ship the same pattern.

### Verdict matrix

| Scenario                                                        | Custom components enough?                      | GenUI module justified?                                          |
| --------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| 2–3 display-only widgets, one LLM provider, one app             | ✅ Yes — over-engineering to ship `src/genui/` | ❌                                                               |
| 10+ interactive tools, streaming args, receipts, shared catalog | ⚠️ Solvable, but duplicated pain               | ✅                                                               |
| Need only protocol shapes, not library sugar                    | ✅ Types only (Layer 2)                        | Partial — keep `tool-call` / `tool-result` types, defer registry |

### Recommended split (aligns with §13)

| Keep in library                                                 | Optional / app / example                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `ToolCallMessageContent` / `ToolResultMessageContent` (Layer 2) | `GenUIToolRegistry`, Ajv, default renderers (Layer 3)        |
| Docs + adapter example (Live story, proxy)                      | Full `src/genui/` in core if team rejects Layer 3 in package |

### One-liner for design review

> **MessageRendererRegistry was always the generative UI extension point. Phase 1 adds a standard tool-call protocol and optional conveniences. Custom components can replace Layer 3 entirely; they cannot replace the integrator’s adapter (Layer 0) or the decision to use Layer 2 types.**

---

## See Also

- [GENERATIVE_UI.md](../GENERATIVE_UI.md) — user-facing GenUI guide
- [GENERATIVE_UI_REQUIREMENTS.md](./GENERATIVE_UI_REQUIREMENTS.md) — full engineering spec (BC1–BC5, F1–F12)
- [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) — Phase 1 delivery report
- [GENERATIVE_UI_LANDSCAPE.md](./GENERATIVE_UI_LANDSCAPE.md) — AI SDK vs Tool UI vs AIKit
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased roadmap
- Storybook: `genui/Overview`, `MessageList/WithCustomMessageType`
