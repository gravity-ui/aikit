# Generative UI (Phase 1) — Implementation Report

Implements Phase 1 of `docs/genui/IMPLEMENTATION_PLAN.md`. The model can now emit
structured `tool-call` content parts that AIKit dispatches to registered React
components, with the scaffolding for Phase-2 round-trip and rehydration already
in place.

## What's done

### New content types — `src/types/messages.ts`

Added additively after `ToolMessageContent` (preserves existing `'tool'` type per BC5):

- `ToolCallStatus = 'input-streaming' | 'input-available' | 'output-available' | 'output-error'`
- `ToolCallMessageContentData<TArgs>` / `ToolCallMessageContent<TArgs>`
- `ToolResultMessageContentData<TResult>` / `ToolResultMessageContent<TResult>`
- `TDefaultMessageContent` now includes the two new types

JSON shape is fully serializable.

### New module — `src/genui/`

| File                                             | Purpose                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `types.ts`                                       | `GenUITool`, `GenUIToolRegistry`, `GenUIComponentProps`, error/event types                 |
| `schema.ts`                                      | `normalizeSchema` / `validateArgs` — Zod or JSON Schema, Ajv-backed                        |
| `registry.ts`                                    | `createGenUIToolRegistry`, `registerGenUITool`, `mergeGenUIToolRegistries`, `getGenUITool` |
| `describeRegistry.ts`                            | `describeGenUIRegistry(registry)` → JSON Schema catalog                                    |
| `renderers/ToolCallRenderer.tsx`                 | Factory `createToolCallRenderer({genUIRegistry, onToolResult, onGenUIError, ...})`         |
| `renderers/ToolResultRenderer.tsx`               | Phase-1 no-op; results render via `previousResult` on the matching call                    |
| `renderers/ToolPartErrorBoundary.tsx`            | Per-part error boundary (§12 E3)                                                           |
| `renderers/UnknownToolFallback.tsx` + `.scss`    | F3 fallback for unknown tool names                                                         |
| `renderers/DefaultLoadingSkeleton.tsx` + `.scss` | Default `input-streaming` placeholder                                                      |
| `renderers/DefaultErrorSlot.tsx` + `.scss`       | Default error rendering                                                                    |
| `index.ts`                                       | Public re-exports                                                                          |

#### Schema adapter highlights

- **Zod:** duck-typed detection (`safeParse` method) — no hard dep on `zod`. Validator is the Zod object itself; compiled at registration (PF2).
- **JSON Schema:** lazily compiled with Ajv via a singleton instance; the compiled `ValidateFunction` is cached on the `ArgsSchema` object (PF2).
- **Idempotent:** passing an already-normalized `ArgsSchema` returns it unchanged.
- **`toJSONSchema()`** on every adapter for `describeGenUIRegistry`; Zod path uses `schema.toJSONSchema()` when available, returns `undefined` otherwise.

#### Renderer flow

`createToolCallRenderer` returns a `MessageRenderer<ToolCallMessageContent>` that:

1. Looks up the tool by `part.data.toolName`. Missing → `UnknownToolFallback` + `console.warn` (dev) + `onGenUIError`.
2. Branches on `status`:
   - `input-streaming` → `tool.loading ?? DefaultLoadingSkeleton`
   - `output-error` → `tool.error ?? DefaultErrorSlot` with the model-reported error
   - `input-available` / `output-available` → `validateArgs(...)`; on failure render the error slot, on success mount the component inside `ToolPartErrorBoundary`
3. `submitResult` is event-driven and idempotent — second call for the same `toolCallId` is ignored with a dev warning (I11).
4. `previousResult` is populated when a sibling `tool-result` part with the same `toolCallId` exists in the parent message (Phase-2 rehydration scaffolding).

### Wiring through chat surfaces

- **`AssistantMessage`** (`src/components/organisms/AssistantMessage/AssistantMessage.tsx`): adds `genUIRegistry`, `onToolResult`, `onGenUIError`, `genUIConsumerContext` props. When `genUIRegistry` is provided, default `tool-call` / `tool-result` renderers are registered into the local renderer registry **before** consumer overrides — consumers can still replace the `tool-call` renderer wholesale. Also exposes `findSiblingResult` so the `tool-call` renderer can populate `previousResult`.
- **`MessageList`** (`src/components/organisms/MessageList/MessageList.tsx`): forwards the same four props to each `AssistantMessage`.
- **`ChatContent`, `ChatContainer`, `AIStudioChat`** — no edits required. Because `MessageListConfig = Omit<MessageListProps, ...>` and `ChatContent` spreads `messageListProps`, the new props are automatically reachable via `messageListConfig`.

### Packaging

- `src/index.ts` re-exports `./genui` (BC4).
- `package.json`:
  - New subpath export `"./genui"`.
  - New runtime deps: `ajv@^8.17.1`, `@types/json-schema@^7.0.15`.
  - New optional peer: `zod` (with `peerDependenciesMeta.zod.optional = true`).
- `generate:exports --check` reports in sync (48 components, unchanged).

### Tests

`src/genui/__tests__/` — jest unit tests, 12 passing:

- `registry.unit.test.ts` — empty registry, register/lookup/merge, unknown-name return, re-registration overwrite, conflict policy (later wins).
- `schema.unit.test.ts` — JSON Schema validate success/failure, `toJSONSchema` round-trip, idempotency, Zod-like duck-typed validate success/failure, missing-converter `undefined` fallback.

### Storybook

`src/genui/__stories__/`:

- `GenUIOverview.stories.tsx` — two stories:
  - **Lifecycle** — `input-streaming`, `input-available`, `output-error`, unknown-tool fallback, schema-validation failure
  - **RoundTrip** — `onToolResult` callback + `previousResult` rehydration example
- `Docs.mdx` — overview, two-registry model, quickstart, lifecycle reference.

### Docs

- `docs/GENERATIVE_UI.md` — concepts, lifecycle, quickstart, API, chat-surface props, component contract, BC5 migration note.
- `docs/ARCHITECTURE.md` — new "Generative UI" subsection inside _Extensibility_.

## Verification

| Check                                      | Result                |
| ------------------------------------------ | --------------------- |
| `npm run typecheck`                        | clean                 |
| `npm run test:unit`                        | 177/177 pass (12 new) |
| `npx eslint` on touched files              | clean                 |
| `node scripts/generate-exports.js --check` | in sync               |

## Not included (deferred)

- **Playwright visual specs.** The plan calls for `.visual.spec.tsx` files under `src/genui/renderers/__tests__/`, but generating baseline snapshots requires Docker (`npm run playwright:docker:update`). The story coverage above is the runnable backstop; the visual specs are a small follow-up once Docker is available. Existing `MessageList` visual specs continue to pass — the new types and props are additive.
- **`npm install`.** New runtime deps (`ajv`, `@types/json-schema`) and optional peer (`zod`) are declared in `package.json` but not yet materialized in the lockfile. Ajv is already present transitively, so TypeScript and tests resolve correctly today; a `npm install` is required before publishing.
- **Phase 2 (Interactivity).** `submitResult`, `previousResult`, `findSiblingResult` and `onToolResult` are fully wired, but the planned built-in molecules (`ApprovalCard`, `OptionList`) and their `createGenUI…Tool()` helpers are not yet built.
- **Phase 3 (Hardening).** Streaming-args opt-in, `React.lazy` Suspense, stall-timeout, `onGenUIEvent` telemetry, and the `bench/` script are not yet built.

## Files

### Created

```
src/genui/index.ts
src/genui/types.ts
src/genui/registry.ts
src/genui/schema.ts
src/genui/describeRegistry.ts
src/genui/renderers/ToolCallRenderer.tsx
src/genui/renderers/ToolResultRenderer.tsx
src/genui/renderers/ToolPartErrorBoundary.tsx
src/genui/renderers/UnknownToolFallback.tsx
src/genui/renderers/UnknownToolFallback.scss
src/genui/renderers/DefaultLoadingSkeleton.tsx
src/genui/renderers/DefaultLoadingSkeleton.scss
src/genui/renderers/DefaultErrorSlot.tsx
src/genui/renderers/DefaultErrorSlot.scss
src/genui/__tests__/registry.unit.test.ts
src/genui/__tests__/schema.unit.test.ts
src/genui/__stories__/GenUIOverview.stories.tsx
src/genui/__stories__/Docs.mdx
docs/GENERATIVE_UI.md
```

### Modified

```
src/types/messages.ts                                          (new types appended)
src/components/organisms/AssistantMessage/AssistantMessage.tsx (new props + GenUI registry composition)
src/components/organisms/MessageList/MessageList.tsx           (forward new props)
src/index.ts                                                   (re-export ./genui)
package.json                                                   (./genui subpath, ajv dep, zod optional peer, @types/json-schema dep)
docs/ARCHITECTURE.md                                           (new "Generative UI" subsection)
```
