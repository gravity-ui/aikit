# Generative UI (GenUI) for AIKit — Implementation Plan

## Context

`docs/genui/GENERATIVE_UI_REQUIREMENTS.md` specifies a new capability: let an LLM emit structured tool-call parts that AIKit maps to interactive React components, with a typed round-trip back to the model. Today AIKit already iterates `content[]` and dispatches each part through `MessageRendererRegistry` (`src/utils/messageTypeRegistry.ts`), but it has no notion of a _tool-named_ renderer, no args-schema validation, and no outbound channel for component → model results. The GenUI layer adds those three things as **additive** primitives so consumers who don't opt in see zero behavior change (BC1, BC2).

### Confirmed decisions (from design review of §20 open questions)

1. **Scope** — all three phases planned here; Phase 1 in implementation detail, Phases 2-3 in shape only.
2. **Protocol** — **protocol-agnostic core, no first-party adapter in v1**. AIKit ships the contract + primitives; consumers wire their own protocol bridge. (Overrides §6.3 default.)
3. **Schema** — **Zod and JSON Schema as co-equal first-class options from v1**. Both registered the same way; a small adapter normalizes them. (Overrides Q4.)
4. **Wiring** — **explicit prop drilling** from chat root through `ChatContent`/`MessageList` to `AssistantMessage`. No React context provider. (Overrides Q3-adjacent.)
5. Two-registry split (MessageRendererRegistry + GenUIToolRegistry) per §5 — confirmed.
6. Error boundary granularity: per-part per §12 E3 — confirmed.

---

## Architecture overview

```
ChatContainer / AIStudioChat (pages)
        │  props: genUIRegistry, onToolResult, onGenUIError
        ▼
ChatContent / History (templates)
        │  forward props
        ▼
MessageList (organism)
        │  forward props
        ▼
AssistantMessage (organism)
        │  forwards (genUIRegistry, onToolResult, onGenUIError)
        │  into the default 'tool-call' renderer via a registry factory
        ▼
MessageRendererRegistry  ── lookup by content.type ('tool-call')
        ▼
default tool-call renderer
        │  lookup by part.data.toolName in GenUIToolRegistry
        │  validate part.data.args against tool.schema
        │  resolve lifecycle status
        ▼
ToolPartErrorBoundary  →  <ToolComponent args={...} context={...} submitResult={...} previousResult={...} />
```

Two registries cooperate:

- **`MessageRendererRegistry`** (existing, unchanged) — keyed by `content.type`.
- **`GenUIToolRegistry`** (new) — keyed by tool name, holds `{schema, component, loading?, error?}`.

The `tool-call` and `tool-result` content types are registered into the standard renderer registry by default; the `tool-call` renderer is the bridge into the GenUI registry.

---

## Phase 1 — Foundation (read-only render)

Deliverable: the model can call a registered component and AIKit renders it. No round-trip yet.

### 1.1 New content types — `src/types/messages.ts`

Add additively after `ToolMessageContent` (preserve existing `'tool'` type per BC5):

- `ToolCallStatus = 'input-streaming' | 'input-available' | 'output-available' | 'output-error'`
- `ToolCallMessageContentData<TArgs = unknown>` — `{ toolCallId: string; toolName: string; args?: TArgs; partialArgsText?: string; status: ToolCallStatus; error?: { message: string; cause?: unknown } }`
- `ToolCallMessageContent<TArgs = unknown> = TMessageContent<'tool-call', ToolCallMessageContentData<TArgs>>`
- `ToolResultMessageContentData<TResult = unknown>` — `{ toolCallId: string; toolName: string; result: TResult }`
- `ToolResultMessageContent<TResult = unknown> = TMessageContent<'tool-result', ToolResultMessageContentData<TResult>>`
- Extend `TDefaultMessageContent` union (line 144) to add `ToolCallMessageContent | ToolResultMessageContent`.

JSON shape is fully serializable — satisfies ST1-ST3 and SEC6.

### 1.2 New directory — `src/genui/`

Sibling to `src/utils/`, `src/adapters/`. Files:

- `src/genui/index.ts` — public re-exports.
- `src/genui/types.ts` — `GenUITool`, `GenUIToolRegistry`, `GenUIContext`, `ToolResultEvent`, lifecycle enums.
- `src/genui/registry.ts` — registry primitives (see 1.3).
- `src/genui/schema.ts` — Zod + JSON Schema adapter (see 1.4).
- `src/genui/describeRegistry.ts` — exports tools as JSON-Schema catalog (R9).
- `src/genui/renderers/ToolCallRenderer.tsx` — the default `tool-call` part renderer.
- `src/genui/renderers/ToolResultRenderer.tsx` — default (hidden in v1) result renderer.
- `src/genui/renderers/ToolPartErrorBoundary.tsx` — per-part error boundary.
- `src/genui/renderers/UnknownToolFallback.tsx` — F3.
- `src/genui/renderers/DefaultLoadingSkeleton.tsx` — S1 default.

### 1.3 Registry primitives — `src/genui/registry.ts`

Mirror the shape of `src/utils/messageTypeRegistry.ts` for symmetry. Public API:

```ts
type GenUIToolRegistry = Record<string, GenUITool<any, any>>;
type GenUITool<TArgs, TResult> = {
  name: string;
  description?: string;
  schema: ArgsSchema<TArgs>; // normalized at registration (1.4)
  component: React.ComponentType<GenUIComponentProps<TArgs, TResult>>;
  loading?: React.ComponentType<{partialArgsText?: string; context: GenUIContext}>;
  error?: React.ComponentType<{error: GenUIError; context: GenUIContext}>;
};

type GenUIComponentProps<TArgs, TResult> = {
  args: TArgs;
  context: GenUIContext;
  submitResult: (result: TResult) => void; // Phase-1 no-op; wired in Phase 2
  previousResult?: TResult; // Phase-1 always undefined
};

function createGenUIToolRegistry(): GenUIToolRegistry;
function registerGenUITool<TArgs, TResult>(
  registry: GenUIToolRegistry,
  def: GenUITool<TArgs, TResult>,
): GenUIToolRegistry;
function mergeGenUIToolRegistries(...regs: GenUIToolRegistry[]): GenUIToolRegistry;
function getGenUITool(registry: GenUIToolRegistry, name: string): GenUITool | undefined;
```

Inference (R3): `registerGenUITool` infers `TArgs` from `def.schema` (overload-based for Zod vs JSON Schema). Misalignment between `schema` and `component.args` is a TS compile error.

### 1.4 Schema adapter — `src/genui/schema.ts`

Zod is added as an **optional peer dependency** in `package.json` (under `peerDependenciesMeta` with `optional: true`) so AIKit doesn't force the dep on consumers who only use JSON Schema. We `import type { ZodTypeAny } from 'zod'` (types only) and detect schemas at runtime via a duck-typed branding.

```ts
type ArgsSchema<T> =
  | {kind: 'zod'; schema: ZodTypeAny; validate: (input: unknown) => SchemaResult<T>}
  | {kind: 'json-schema'; schema: JSONSchema7; validate: (input: unknown) => SchemaResult<T>};

function normalizeSchema<T>(schema: ZodTypeAny | JSONSchema7): ArgsSchema<T>;
function validateArgs<T>(schema: ArgsSchema<T>, input: unknown): SchemaResult<T>;
```

- Zod path: call `schema.safeParse(input)`. Compiled once at registration (the Zod object is itself the compiled validator) — satisfies PF2.
- JSON Schema path: lazily compile with **Ajv** as a runtime dep (no separate optional). Compile-once cached on the `ArgsSchema` object — PF2.

Schema validation is non-optional and runs in production (SEC5).

### 1.5 Default `tool-call` renderer

`src/genui/renderers/ToolCallRenderer.tsx` exports a **factory** because it needs `genUIRegistry`, `onToolResult` (Phase 2), and `onGenUIError` at render time:

```ts
function createToolCallRenderer(opts: {
  genUIRegistry: GenUIToolRegistry;
  onToolResult?: (e: ToolResultEvent) => void; // Phase 2
  onGenUIError?: (e: GenUIErrorEvent) => void;
  consumerContext?: unknown; // F7
}): MessageRenderer<ToolCallMessageContent>;
```

Render flow:

1. `getGenUITool(registry, part.data.toolName)` — if missing → `UnknownToolFallback` + `console.warn` (F3, E1).
2. Switch on `part.data.status`:
   - `input-streaming` → render `tool.loading ?? DefaultLoadingSkeleton` (S1).
   - `input-available` → `validateArgs(tool.schema, part.data.args)`. On failure render `tool.error ?? DefaultErrorSlot` (F4, F5, E2). On success mount `<tool.component args={validated} context={...} submitResult={noop} previousResult={undefined} />`.
   - `output-available` (Phase 2) → mount with `previousResult` from a sibling `tool-result` part with matching id.
   - `output-error` → render `tool.error ?? DefaultErrorSlot` (E3).
3. Wrap mount in `ToolPartErrorBoundary` (E3): catches render-throws, displays an inline error, surfaces via `onGenUIError`, does not affect sibling parts.

Memoize on `part.id` + `part.data.status` so adjacent text deltas do not re-mount the tool (PF4, PF5).

### 1.6 Wiring through chat surfaces

**`AssistantMessage`** — `src/components/organisms/AssistantMessage/AssistantMessage.tsx`:

Add three new optional props:

```ts
genUIRegistry?: GenUIToolRegistry;
onToolResult?: (e: ToolResultEvent) => void;       // forwarded to Phase 2 wiring
onGenUIError?: (e: GenUIErrorEvent) => void;
```

In the `useMemo` at line 61, when `genUIRegistry` is supplied, register the default `tool-call` and `tool-result` renderers (via `createToolCallRenderer(...)` / `createToolResultRenderer(...)`) into the base `MessageRendererRegistry` _before_ applying the consumer's custom `messageRendererRegistry` override. Consumers can still override the `tool-call` renderer wholesale if they want.

`createDefaultMessageRegistry` (`defaultMessageTypeRegistry.tsx`) is **not** modified to depend on GenUI — keeps BC2 (zero overhead when not opted in) and avoids a circular dependency between `src/genui/` and the default registry.

**`MessageList`** (organism): forward the three new props.
**`ChatContent`, `History`** (templates): forward.
**`ChatContainer`, `AIStudioChat`** (pages): expose at the public API.

Use `Explore` later to enumerate exact prop forwarding chains; pattern matches existing `messageRendererRegistry` flow.

### 1.7 Registry catalog helper

`describeGenUIRegistry(registry)` walks each tool and emits a JSON-Schema document `{ tools: [{ name, description, parameters: <JSONSchema> }] }`. For Zod schemas, convert via the existing Zod → JSON Schema converter packaged with newer Zod versions (`z.toJSONSchema()`); fall back to a small inline `zod-to-json-schema`-style converter if not available. Useful for echoing the catalog to the model per Q5(a).

### 1.8 Exports + package.json

- Add `export * from './genui'` to `src/index.ts` (BC4).
- Add subpath export `"./genui"` in `package.json` `exports`. Run `npm run generate:exports` to regenerate the per-component map.
- Add runtime deps: `ajv`, `ajv-formats`.
- Add `zod` to `peerDependenciesMeta` as optional.

### 1.9 Tests — Phase 1

Per `docs/guidelines/testing.md` (Docker Playwright):

- `src/genui/__tests__/registry.test.ts` — T1: register, lookup, fallback on missing, merge.
- `src/genui/__tests__/schema.test.ts` — T2: Zod valid, JSON Schema valid, validation failure, schema normalization.
- `src/genui/renderers/__tests__/ToolCallRenderer.visual.spec.tsx` — T4: one story each for `input-streaming`, `input-available`, `output-error`, unknown-tool fallback, schema-validation failure.
- `helpersPlaywright.tsx` uses `composeStories`; tests use `expectScreenshot()` from `~playwright/core`. Run via `npm run playwright:docker`.

### 1.10 Storybook — Phase 1

- `src/genui/__stories__/GenUIOverview.stories.tsx` — top-level "GenUI" category demo: a chat with `genUIRegistry` pre-seeded with two example tools, rendering each lifecycle state.
- `src/genui/__stories__/Docs.mdx` — concepts + quickstart.

### 1.11 Docs — Phase 1

- `docs/GENERATIVE_UI.md` (D1) — concepts, two-registry architecture, consumer quickstart, BC5 migration note (`tool` vs `tool-call`).
- `docs/ARCHITECTURE.md` — add "Generative UI" section (D4).
- `docs/COMPONENTS.md` and `llms.txt` are not updated yet (no built-in GenUI components in Phase 1). Run `npm run generate:llms` after docs land.

---

## Phase 2 — Interactivity (round-trip)

Deliverable: components send results back to the model; re-hydration shows receipts.

- **`submitResult` channel**: the factory `createToolCallRenderer` already accepts `onToolResult`. Wire it through: when the rendered component calls `submitResult(result)`, the renderer emits `{ toolCallId, toolName, result, messageId }` via `onToolResult`. AIKit does **not** mutate `content[]` — consumers append a `tool-result` part to their own chat history. (Adapters would translate to their wire format.)
- **`previousResult` rehydration** (ST6, T6): in `input-available`/`output-available` state, the renderer scans the _parent message's_ `content[]` for a `tool-result` part with the same `toolCallId` and passes its `result` as `previousResult`. Components render the read-only receipt form. AssistantMessage needs to pass the full normalized parts array down to each renderer factory closure (small addition to the `MessageContentComponentProps` shape: optionally a `sibling` accessor). Keep it backwards-compatible by reading from a context-free closure created per-message inside `AssistantMessage`'s `useMemo`.
- **Idempotency** (F10, I11): track called `toolCallId`s in a ref inside the renderer; second call replaces with a `console.warn` in dev. Replay never re-fires (I12) because `submitResult` is event-driven, not effect-driven.
- **Built-in renderers** (R7, atomic-design placement):
  - `src/components/molecules/ApprovalCard/` — buttons Approve/Reject, comment field, emits `{ approved, comment? }`. Follow `aikit-new-component`, `aikit-storybook`, `aikit-testing`, `aikit-readme`. Update `src/components/molecules/index.ts`, `docs/COMPONENTS.md`, `llms.txt`, regenerate exports.
  - `src/components/molecules/OptionList/` — radio or multi-select, emits `{ selectedIds: string[] }`. Same scaffolding.
  - These are reachable both as standalone components _and_ pre-wired GenUI tools via a `createGenUIApprovalCardTool()` / `createGenUIOptionListTool()` helper exported from `src/genui/builtins/`.
- **JSON Schema parity**: already shipped in Phase 1 per the user's decision — no Phase-2 work here.
- **Tests** — T5 (round-trip), T6 (re-hydration), per-renderer visual specs in Docker.

---

## Phase 3 — Hardening

Deliverable: production-grade resilience.

- **Streaming args opt-in** (S2): `GenUITool.streamingArgsSchema?: ArgsSchema<Partial<TArgs>>`. When provided, the `input-streaming` state attempts incremental parse of `part.data.partialArgsText` (via a tolerant JSON parser like `partial-json`) and mounts the component with `Partial<TArgs>` instead of the loading slot. Component author opts in per-tool.
- **`React.lazy` support** (PF3): the factory detects when `tool.component` is a lazy element and wraps the mount in `<Suspense fallback={LoadingSlot} />`.
- **Stall timeout** (E5): the renderer starts a `setTimeout` (configurable, default 30s) on `input-streaming` entry; on fire, synthesizes a transition to `output-error` with a `TimeoutError`. Cleared on status change. Consumers can override per-tool.
- **Telemetry** (Q10): `onGenUIEvent?: (e: GenUIEvent) => void` on chat root. Emits one typed event per lifecycle transition. Cheap (single function call per transition; no allocations on hot path).
- **Performance benchmarks**: a new `bench/` script (or extension to existing perf story) measures mount cost + re-render counts under a synthetic stream. Tracked in CI as a soft gate.
- **No second adapter** (user chose protocol-agnostic). Optional follow-up: a `examples/` directory showing how to glue Vercel AI SDK v5 to AIKit's GenUI primitives — _outside_ the published package.

---

## Critical files

### Modified

- `src/types/messages.ts` — add `ToolCallMessageContent`, `ToolResultMessageContent`, extend `TDefaultMessageContent` (additive).
- `src/components/organisms/AssistantMessage/AssistantMessage.tsx` — new props, registry composition.
- `src/components/organisms/MessageList/MessageList.tsx` — forward props.
- `src/components/templates/ChatContent/ChatContent.tsx`, `History/History.tsx` — forward props.
- `src/components/pages/ChatContainer/ChatContainer.tsx`, `AIStudioChat/AIStudioChat.tsx` — expose props.
- `src/index.ts` — re-export `./genui`.
- `package.json` — `exports` entry for `./genui`; runtime dep `ajv`; optional peer `zod`. Regenerate per-component map.
- `docs/ARCHITECTURE.md` — new GenUI section.

### Created

- `src/genui/index.ts`
- `src/genui/types.ts`
- `src/genui/registry.ts`
- `src/genui/schema.ts`
- `src/genui/describeRegistry.ts`
- `src/genui/renderers/ToolCallRenderer.tsx`
- `src/genui/renderers/ToolResultRenderer.tsx`
- `src/genui/renderers/ToolPartErrorBoundary.tsx`
- `src/genui/renderers/UnknownToolFallback.tsx`
- `src/genui/renderers/DefaultLoadingSkeleton.tsx`
- `src/genui/__tests__/registry.test.ts`
- `src/genui/__tests__/schema.test.ts`
- `src/genui/renderers/__tests__/ToolCallRenderer.visual.spec.tsx`
- `src/genui/renderers/__tests__/helpersPlaywright.tsx`
- `src/genui/__stories__/GenUIOverview.stories.tsx`
- `src/genui/__stories__/Docs.mdx`
- `docs/GENERATIVE_UI.md`
- (Phase 2) `src/components/molecules/ApprovalCard/**`, `src/components/molecules/OptionList/**`, `src/genui/builtins/**`

### Existing primitives to reuse (not reinvent)

- `MessageRendererRegistry`, `registerMessageRenderer`, `mergeMessageRendererRegistries` — `src/utils/messageTypeRegistry.ts`
- `normalizeContent` — `src/utils/messageUtils.ts`
- `createMessageRendererRegistry` — same file
- Atomic-design placement (`molecules/` for stateful single-purpose widgets) — `docs/ARCHITECTURE.md`
- Component scaffolding workflow — `aikit-new-component` skill / `docs/guidelines/new-component.md`
- Storybook scaffolding — `aikit-storybook` skill / `docs/guidelines/storybook.md`
- Test scaffolding — `aikit-testing` skill / `docs/guidelines/testing.md`
- Exports regeneration — `npm run generate:exports`
- LLM docs regeneration — `npm run generate:llms`

---

## Verification

### Phase 1

1. `npm run typecheck` passes with the new types + registry.
2. Type-level: a Zod schema `z.object({ city: z.string() })` registered with a component expecting `{args: {city: string}}` compiles; mismatched component types fail to compile.
3. `npm run playwright:docker -- --grep "@GenUI"` passes the lifecycle visual specs (`input-streaming`, `input-available`, unknown-tool fallback, validation-error).
4. Storybook (`npm run storybook`) shows the "GenUI" category; the demo story renders a model-emitted tool-call as a registered component.
5. Bundle-size delta check: a fixture consumer that does NOT pass `genUIRegistry` shows ≤ 1 KB gzipped growth in their tree-shaken bundle (acceptance criterion 9). Measure with a small `size-limit` check or manual `rollup --plugin-visualizer` diff.
6. Existing test suite still green — BC1, BC2.

### Phase 2

7. Round-trip story: clicking "Approve" in the ApprovalCard demo fires `onToolResult` with `{ toolCallId, result: { approved: true } }` exactly once (Playwright assertion).
8. Re-hydration fixture: chat JSON containing a `tool-call` + matching `tool-result` renders the ApprovalCard directly in receipt mode with `previousResult` populated; no `onToolResult` fires during render (I12).
9. `describeGenUIRegistry(registry)` for the two built-ins returns a JSON-Schema document validated against `JSON Schema draft 7`.

### Phase 3

10. Streaming-args story: feed a synthetic partial-args stream; component re-renders with progressively complete props without unmounting.
11. Lazy-component story: a tool whose `component` is `React.lazy(...)` mounts inside `<Suspense>` and the loading slot is visible until the chunk loads.
12. Timeout: a tool stuck in `input-streaming` for >30s transitions to `output-error` with the configured timeout error.
13. `onGenUIEvent` is called once per lifecycle transition for a multi-tool turn (Playwright `page.evaluate` capture).

### End-to-end smoke (manual)

14. Run the demo chat in Storybook, paste a fixture stream that includes mixed `text → tool-call → text → tool-call → tool-result → text` content order; verify rendering, ordering, and that text deltas don't remount tool calls (PF5).
