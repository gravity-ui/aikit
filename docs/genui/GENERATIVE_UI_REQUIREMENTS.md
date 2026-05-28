# Generative UI in AIKit — Engineering Requirements

> A detailed specification for adding **Generative UI (GenUI)** support to `@gravity-ui/aikit`: the ability for an LLM to render arbitrary, interactive AIKit components inline in a chat using a well-known client-to-LLM communication protocol.

**Status:** Draft, ready for engineering review
**Date:** 2026-05-28
**Audience:** AIKit core engineers, integrators building products on AIKit
**Out of scope for this document:** final implementation code, naming of public exports (decisions to be made during design review)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Background — Current State of AIKit](#3-background--current-state-of-aikit)
4. [Glossary](#4-glossary)
5. [High-Level Architecture](#5-high-level-architecture)
6. [Protocol Selection Requirements](#6-protocol-selection-requirements)
7. [Functional Requirements](#7-functional-requirements)
8. [Component Catalog & Registry Requirements](#8-component-catalog--registry-requirements)
9. [Streaming Requirements](#9-streaming-requirements)
10. [Interactivity & Round-Trip Requirements](#10-interactivity--round-trip-requirements)
11. [State Management Requirements](#11-state-management-requirements)
12. [Error Handling & Resilience Requirements](#12-error-handling--resilience-requirements)
13. [Security Requirements](#13-security-requirements)
14. [Performance Requirements](#14-performance-requirements)
15. [Backwards Compatibility Requirements](#15-backwards-compatibility-requirements)
16. [Testing Requirements](#16-testing-requirements)
17. [Documentation Requirements](#17-documentation-requirements)
18. [Phased Delivery Plan](#18-phased-delivery-plan)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Open Questions & Decisions to Make](#20-open-questions--decisions-to-make)
21. [References](#21-references)

---

## 1. Overview

Today, AIKit renders chat messages whose `content` is either a `string` or a discriminated union of typed content parts (`text`, `thinking`, `tool`, or a consumer-defined custom type). The mapping from a content part to a React component is performed via `MessageRendererRegistry` (`src/utils/messageTypeRegistry.ts`).

What is missing is a **standard, transport-agnostic protocol** between an LLM backend and AIKit that:

1. Lets the model decide _at inference time_ which component to render and with what data.
2. Streams partial component arguments without flicker or broken UI.
3. Lets the rendered component send a result back to the model so the conversation can continue.
4. Persists "what was rendered with what arguments" in the chat history so re-hydration is correct.
5. Works with the orchestration stacks our users already adopt (Vercel AI SDK, AG-UI, A2UI, assistant-ui), without locking AIKit to any single one.

This document specifies what engineers must build to deliver that capability.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- **G1.** Define a single, stable, _protocol-agnostic_ contract by which AIKit accepts tool-call/UI-call parts from any modern LLM streaming SDK and renders them as React components.
- **G2.** Ship at least one **first-party adapter** that implements that contract end-to-end against a well-known protocol (default candidate: Vercel AI SDK v5 `UIMessage.parts`).
- **G3.** Preserve AIKit's identity as an **SDK-agnostic presentation layer** — no hard dependency on any vendor SDK in the public API surface.
- **G4.** Make it trivial for an integrator to register a custom AIKit-styled component and have the LLM be able to call it, with full TypeScript inference.
- **G5.** Make rendering **safe by default**: no `eval`, no remote JSX, no HTML injection — the model can only request components from a pre-approved registry with schema-validated arguments.
- **G6.** Provide a working **round-trip interaction model** (button click, slider value, form submit) such that user input is delivered back to the agent with the original tool call's identity preserved.

### 2.2 Non-Goals

- **NG1.** Implementing or owning an LLM orchestration engine. Tool execution, agent loops, and prompt construction stay on the consumer's backend.
- **NG2.** Shipping a tool/component catalog comparable to assistant-ui Tool UI. AIKit provides the registry mechanism and a small set of building-block atoms; rich domain widgets remain consumer-owned.
- **NG3.** Auth, transport, retries, rate limiting. These are concerns of the AI SDK / network layer.
- **NG4.** Replacing the existing `MessageRendererRegistry`. The GenUI layer extends it, it does not deprecate it.
- **NG5.** Server-side rendering of generated components (no RSC streaming in v1 — keep the contract serializable JSON only).

---

## 3. Background — Current State of AIKit

The relevant building blocks already in the repo:

| Module                   | Path                                                                                                            | Role                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Message content type     | `src/types/messages.ts` — `TMessageContent<Type, Data>`                                                         | Discriminated-union shape every renderable part conforms to |
| Default content variants | `src/types/messages.ts` — `TextMessageContent`, `ThinkingMessageContent`, `ToolMessageContent`                  | Built-in content types                                      |
| Renderer registry        | `src/utils/messageTypeRegistry.ts` — `MessageRendererRegistry`, `registerMessageRenderer`, `getMessageRenderer` | Maps `content.type` → React component                       |
| Default registry         | `src/components/organisms/AssistantMessage/defaultMessageTypeRegistry.tsx`                                      | Ships default renderers for built-in types                  |
| Assistant message        | `src/components/organisms/AssistantMessage/AssistantMessage.tsx`                                                | Iterates `content[]` and renders each part via the registry |
| OpenAI adapters          | `src/adapters/openai/useOpenAIResponsesAdapter.ts`, `useOpenAIConversationsAdapter.ts`                          | Reference of how AIKit currently consumes a vendor SDK      |

The GenUI layer is therefore a **new content type family** (`tool-call`, `tool-result`, `ui`) plus an **adapter contract** that maps any inbound streaming protocol onto that family.

The shape `TMessageContent<Type, Data>` already gives us everything we need for the "data" side. What is missing is:

- A **typed tool/component descriptor** registry (separate from the renderer registry) so each renderable widget has a schema.
- A **partial-args lifecycle** so renderers can react to `input-streaming → input-available → output-available → output-error`.
- An **outbound channel** so a rendered component can send a `tool-result` back to the agent.

---

## 4. Glossary

| Term                      | Definition                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GenUI (Generative UI)** | The pattern in which an LLM emits structured, schema-validated data that a client maps to a React component, instead of (or in addition to) free-form text.                    |
| **Tool call**             | A model-emitted instruction to invoke a named capability with typed arguments. May be executed server-side (real tool) or used purely as a UI directive (UI-only tool).        |
| **UI-only tool**          | A tool whose only side effect is rendering a component on the client. The server registers the schema but does not execute logic.                                              |
| **Tool result**           | The payload sent back to the model after a tool call has been handled (executed on the server, or interacted-with on the client).                                              |
| **Part**                  | A typed element of an assistant message's `content[]`. Examples in AIKit today: `text`, `thinking`, `tool`. New under GenUI: `tool-call`, `tool-result`, `ui` (TBD — see §6).  |
| **Registry**              | A client-side map from a string name (content `type`, or tool name) to a renderer or schema.                                                                                   |
| **Catalog**               | The full set of components/widgets the model is permitted to call. The union of all registered tools.                                                                          |
| **Adapter**               | A thin layer (often a React hook) that translates between a specific upstream protocol (Vercel AI SDK, AG-UI, A2UI, OpenAI Responses) and AIKit's internal content-part shape. |
| **Round-trip / loop**     | The pattern `tool-call → user interaction → tool-result → next model turn` that lets the conversation continue based on user input through a rendered component.               |
| **AI state vs UI state**  | AI state = the serializable history the model sees (text + tool calls + tool results). UI state = client-side React state (current slider value, modal open, etc.).            |

---

## 5. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Consumer Backend                          │
│  (LLM provider + orchestration: AI SDK / AG-UI / A2UI / custom) │
│                                                                  │
│  - Registers UI-only tools with Zod/JSON schemas                │
│  - Streams structured response parts                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │  protocol-specific stream
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AIKit Adapter Layer                          │
│              (one adapter per upstream protocol)                 │
│                                                                  │
│  Normalizes inbound parts → AIKit TMessageContent[]              │
│  Normalizes outbound user actions → protocol-specific tool-result│
└───────────────────────────┬─────────────────────────────────────┘
                            │  AIKit-native types
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AIKit Core                                │
│                                                                  │
│  - GenUI Registry (tool-name → component + schema)              │
│  - MessageRendererRegistry (content.type → component)           │
│  - AssistantMessage iterates content[] and renders each part    │
│  - Components receive a typed `submitResult()` callback         │
└─────────────────────────────────────────────────────────────────┘
```

Two registries cooperate:

1. **`MessageRendererRegistry`** — existing; keyed by `content.type` (e.g. `text`, `thinking`, `tool-call`). Handles "how do we render _this kind of part_?"
2. **`GenUIToolRegistry`** _(new)_ — keyed by tool name. Handles "given a tool call to `getWeather`, which component renders it and what is the args schema?" This is what the _default_ `tool-call` renderer dispatches into.

The two-registry split keeps the core renderer flow unchanged while letting consumers register tools declaratively.

---

## 6. Protocol Selection Requirements

The chosen protocol determines our wire format, our adapter API, and our future interop story. Engineers must evaluate and pick one **primary** target before implementation begins.

### 6.1 Candidate protocols

| Protocol                                  | Maturity                   | Strengths                                                                                                                          | Risks for AIKit                                                              |
| ----------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Vercel AI SDK v5/v6 `UIMessage.parts`** | Stable, widely adopted     | Typed parts (`text`, `tool-{name}`, `tool-input-delta`, `tool-output-available`, etc.), `useChat` hook ergonomics, strong TS types | Ties our default adapter to Vercel; users on other SDKs must write their own |
| **AG-UI (CopilotKit)**                    | Stable, event-based        | Transport-level standard (events: messages, tool calls, state, UI surfaces), can carry A2UI payloads                               | Heavier; more concepts than most consumers need today                        |
| **Google A2UI**                           | v0.9 Public Preview (2026) | Framework-agnostic, declarative widget catalog, security-first, resilient streaming                                                | Spec still evolving; widget vocabulary may clash with Gravity UI vocabulary  |
| **assistant-ui Tools API**                | Stable                     | Primitives + rich component library                                                                                                | Opinionated; competes with AIKit at the UI layer                             |
| **OpenAI Responses tool-calling**         | Stable                     | Native to OpenAI/Azure OpenAI flows                                                                                                | Vendor-locked                                                                |

### 6.2 Selection requirements

- **P1.** A _primary_ protocol must be selected and shipped as a first-party adapter in v1.
- **P2.** The selection must be justified in writing against §6.1, with a paragraph per criterion: (a) ecosystem reach, (b) TypeScript ergonomics, (c) streaming model fit, (d) survival risk (will the spec be here in 18 months?), (e) interop with consumers' existing backends.
- **P3.** The chosen protocol's primitives must be representable as AIKit `TMessageContent` parts without lossy translation.
- **P4.** A non-goal: supporting all protocols equally in v1. _Other_ protocols ship later, as additional adapter packages.

### 6.3 Default recommendation (to be confirmed in design review)

**Primary:** Vercel AI SDK v5 `UIMessage.parts`. Rationale: largest install base, idiomatic React hooks, mature tool lifecycle, and AG-UI/A2UI are explicitly designed to interop with it.
**Watch:** A2UI v1.0 as a future second adapter once the spec stabilizes.

---

## 7. Functional Requirements

### 7.1 The model can call a registered component

- **F1.** A consumer can register a component as a "GenUI tool" by providing: a unique tool name, an args schema (Zod or JSON Schema), and a React component that receives parsed args as props.
- **F2.** When the LLM stream contains a tool call whose name matches a registered tool, AIKit renders the registered component inline at the position of that part in the assistant message.
- **F3.** If the tool name is **not** registered, AIKit must render a fallback (configurable per registry — default: a small "Unknown tool: `name`" stub in dev mode, hidden in production) and emit a console warning. Never throw.

### 7.2 The component receives validated args

- **F4.** Before mounting the component, AIKit validates the inbound args against the registered schema.
- **F5.** Validation failures must produce an `output-error` state (see §12) — the component must not be mounted with invalid props.
- **F6.** A component's props must be **typed end-to-end** from the schema. The integrator must not have to write `as MyArgs` casts when registering.

### 7.3 The component can mix LLM data and client data

- **F7.** A component receives, in addition to args, a typed `context` object (or a hook — `useGenUIContext()`) giving access to: the current message id, the original tool-call id, app-level providers (theme, i18n), and any consumer-supplied context value passed to the chat root.
- **F8.** A component is a regular React component — it can call hooks, fetch local data, look up dictionaries, dispatch to a store, etc. No restrictions beyond "be serializable in its inputs."

### 7.4 The component can send a result back

- **F9.** Each rendered GenUI component receives a `submitResult(payload)` callback. Calling it produces a `tool-result` part attached to the originating tool call's id, which the adapter translates into the protocol-specific format and forwards to the consumer's send pipeline.
- **F10.** `submitResult` is idempotent at the part level: calling it twice for the same tool-call id either replaces the prior result (with a warning) or no-ops, per a configurable policy. Default: replace + warn in dev.
- **F11.** Components that don't need to talk back to the model (pure visual widgets) simply ignore `submitResult`. No part is emitted.

### 7.5 The model can return text and components in the same turn

- **F12.** Renderable parts in `content[]` must keep their original order. A single assistant message may contain any sequence like `text → tool-call → text → tool-call → tool-result → text`.
- **F13.** Progressive rendering (text streams, then a tool call appears, then more text) must not cause layout shift beyond what is unavoidable for the inserted component's height. Use stable keys.

### 7.6 Multiple components per turn

- **F14.** A single assistant message may contain N tool calls. Each is rendered independently. Independent failures do not affect siblings.

---

## 8. Component Catalog & Registry Requirements

### 8.1 Registry API

- **R1.** A new `createGenUIToolRegistry()` factory returns an opaque registry instance.
- **R2.** A `registerGenUITool(registry, definition)` function adds a tool. The definition contains:
  - `name: string` — unique tool identifier the model emits.
  - `description: string` — for documentation generation and for echoing into prompts/tool catalogs sent to the model (optional helper).
  - `schema: ZodTypeAny | JSONSchema7` — args schema. **Zod must be supported as a first-class option** because it's the AI SDK norm. JSON Schema must also be supported because A2UI/AG-UI use it.
  - `component: React.ComponentType<{args, context, submitResult}>` — the renderer.
  - `loading?: React.ComponentType<{partialArgs, context}>` — optional renderer for the `input-streaming` lifecycle state.
  - `error?: React.ComponentType<{error, context}>` — optional renderer for the `output-error` lifecycle state.
- **R3.** Registration is **typed**: the schema parameter constrains the component's `args` prop type via inference. Misalignment between schema and component must be a compile error.
- **R4.** A `mergeGenUIToolRegistries(...)` helper composes registries (use case: a base "approval card / option list" registry merged with consumer-specific tools).

### 8.2 Registration conventions

- **R5.** All built-in GenUI tools shipped by AIKit must live under `src/genui/` (sibling to `src/utils/`, `src/adapters/`).
- **R6.** No GenUI tool may bypass the registry. Direct rendering of `<MyToolWidget />` from outside the registry path is **disallowed in chat surfaces** (it breaks AI state replay).
- **R7.** Component file structure follows the existing AIKit convention (`<Name>/<Name>.tsx`, `__stories__/`, `__tests__/`, `README.md`). The `aikit-new-component` skill applies unchanged.

### 8.3 Catalog hygiene

- **R8.** A registry should be a singleton per chat instance, not a module-level mutable global. The chat root component accepts `genUIRegistry` as a prop.
- **R9.** A debug helper `describeGenUIRegistry(registry)` returns a JSON Schema document describing all tools — useful for echoing into the model's tool list at request time.

---

## 9. Streaming Requirements

LLM tool args arrive over a stream as partial JSON. Mounting a complex interactive widget with half-parsed args produces flicker and runtime errors. The implementation must therefore expose the **tool-call lifecycle** to renderers.

### 9.1 Lifecycle states

The adapter must expose, for each tool-call part, a `status` with the following states (terminology aligned with Vercel AI SDK v5 for familiarity; mappable to AG-UI/A2UI events):

| State              | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `input-streaming`  | Args are being streamed; only partial JSON is available.       |
| `input-available`  | Args are complete and have parsed successfully.                |
| `output-available` | A `tool-result` for this call has been received.               |
| `output-error`     | The tool failed (validation, execution, or client-side error). |

### 9.2 Rendering policy

- **S1.** Default policy: **defer mounting** the component until `input-available`. During `input-streaming`, render the `loading` slot if provided (or a default skeleton).
- **S2.** A tool may opt into **progressive rendering** by providing a `streamingArgsSchema` (a relaxed/partial Zod schema). When provided, the component may be mounted in `input-streaming` and re-rendered as args fill in.
- **S3.** Renderers must never crash on partial args. Defensive defaults are the renderer author's responsibility; the registry must surface this expectation in types and docs.

### 9.3 Determinism

- **S4.** Re-streaming the same message must produce the same rendered tree. Renderers must not depend on `Date.now()`, `Math.random()`, or other non-deterministic values during initial render (they may use them in effects).
- **S5.** Each tool-call part must carry a stable `id` (the protocol-level tool-call id). This `id` is the React `key`.

---

## 10. Interactivity & Round-Trip Requirements

### 10.1 The submit-result channel

- **I1.** AIKit must expose, at the chat root, an outbound event source (callback prop: `onToolResult`) that fires whenever a registered component calls `submitResult`.
- **I2.** Each emitted event contains: `toolCallId`, `toolName`, `result` (the payload), and the originating `messageId`.
- **I3.** The first-party adapter must translate `onToolResult` into the protocol's native "tool result" message and append it to the outbound queue / next request. For Vercel AI SDK this is `addToolResult({ toolCallId, result })` on the `useChat` instance.

### 10.2 UI patterns to support

The contract must be expressive enough to support, without bespoke escape hatches:

- **I4.** **Approval card** — buttons "Approve" / "Reject" emit `{ approved: boolean, comment?: string }`.
- **I5.** **Option list** — user selects 1..N from a list; emits `{ selectedIds: string[] }`.
- **I6.** **Parameter slider** — user adjusts a numeric value; emits `{ value: number }` on "Apply" (not on every change — see §10.4).
- **I7.** **Form / multi-field input** — user fills several fields and submits; emits the whole object.
- **I8.** **Pure-visual widget** — chart, map, embed — no result emitted.

### 10.3 Local-only actions

- **I9.** A renderer is free to perform purely local side effects (navigate, call a client API, copy to clipboard) without emitting a tool result. The presence or absence of a `submitResult` call must not be confused with success/failure of local actions.

### 10.4 Debouncing and intermediate state

- **I10.** Renderers control when `submitResult` is called. AIKit does not auto-debounce. The implementation should document the pattern "store intermediate state in `useState`; emit on user commit."

### 10.5 Idempotency and replay

- **I11.** Once `submitResult` has been called for a tool-call id and the result is recorded in chat history, the component should re-render in a read-only / "receipt" state on subsequent renders (e.g., after page reload). Components must accept a `previousResult?: TResult` prop and render accordingly.
- **I12.** Replaying chat history must never re-trigger side effects. Renderers must not call `submitResult` from a `useEffect` based purely on args presence.

---

## 11. State Management Requirements

### 11.1 AI state

- **ST1.** The chat history (`TChatMessage[]`) must remain the canonical AI state. All tool calls, tool results, partial-args snapshots at completion, and `previousResult` data are part of it.
- **ST2.** A message containing tool-call parts must be **fully reconstructible from the persisted JSON alone**. No reliance on in-memory React state, refs, or closures.
- **ST3.** Persistence/storage of the AI state is out of scope for AIKit — but the JSON shape of `TMessageContent` for `tool-call` and `tool-result` parts must be documented and stable, so consumers can store it in any DB.

### 11.2 UI state

- **ST4.** Per-renderer ephemeral UI state (slider position before commit, modal open state) lives in the component itself via `useState`. AIKit does not provide a centralized UI state store for renderers.
- **ST5.** If a consumer needs cross-message UI state coordination, they wire it through their own context provider, which renderers may consume via `context` from §7.7.

### 11.3 Re-hydration

- **ST6.** Loading an existing chat into AIKit must reconstruct the visual state: previously rendered components appear in their "with previousResult" form. This is the primary acceptance criterion for ST1–ST2.

---

## 12. Error Handling & Resilience Requirements

- **E1.** Unknown tool name → render fallback (§7.1), no throw.
- **E2.** Schema validation failure on args → render the `error` slot with the validation error, no throw.
- **E3.** Renderer throws during render → caught by an error boundary scoped to that part. Other parts in the same message continue rendering. The error is visible to the user as an inline error component, and is reported to a configurable `onError` callback.
- **E4.** Tool-result delivery failure (adapter-level, e.g. network) → surfaced via `onError`. The component may retry by calling `submitResult` again with the same payload; the adapter must deduplicate by `toolCallId`.
- **E5.** Stream interruption during `input-streaming` → the part transitions to `output-error` with a synthetic error after a configurable timeout (default: 30s of inactivity).
- **E6.** All error states must be visually distinguishable from successful render and from loading.

---

## 13. Security Requirements

- **SEC1.** AIKit must never `eval`, `new Function`, or render arbitrary HTML provided by the model. Generated parts contain **only structured JSON consumed as React props**.
- **SEC2.** AIKit must never import or render a component identified by a _path_ or _URL_ supplied by the model. Only components pre-registered by the consumer are reachable.
- **SEC3.** When a tool's args include user-displayable strings (titles, descriptions), the consumer's renderer is responsible for treating them as untrusted input. AIKit documentation must call this out; built-in renderers must not render raw HTML from args.
- **SEC4.** Markdown rendering inside generated components, if used, must go through the same hardened markdown pipeline AIKit already uses for `text` parts.
- **SEC5.** The schema validation step is a security boundary, not a developer convenience. It must run before mount, in production builds, with no opt-out.
- **SEC6.** The `submitResult` payload sent back to the model must be serialized by AIKit (JSON.stringify with a structured-clone-safe replacer). The renderer cannot smuggle non-serializable values (functions, DOM nodes) into the AI state.

---

## 14. Performance Requirements

- **PF1.** The default registry lookup is O(1) (Map/object key access). No protocol parsing or schema compilation happens per render.
- **PF2.** Schemas are compiled once at registration time. Validation reuses the compiled validator.
- **PF3.** Lazy-loadable renderers: a tool definition may provide `component: () => import('./MyHeavyWidget')` (i.e. `React.lazy`-compatible). AIKit handles the `Suspense` boundary.
- **PF4.** Re-rendering one tool-call part must not re-render sibling parts. Memoization is mandatory for the default `tool-call` dispatcher.
- **PF5.** Streaming text adjacent to a tool call must not cause the tool call to re-mount on each text delta.

---

## 15. Backwards Compatibility Requirements

- **BC1.** No public AIKit API may change in a non-additive way. Specifically: `MessageRendererRegistry`, `registerMessageRenderer`, `TMessageContent`, and all `AssistantMessage` props must remain source-compatible.
- **BC2.** Consumers who do _not_ opt into GenUI must observe **zero behavior change**. The GenUI machinery is gated on the presence of a `genUIRegistry` prop (or equivalent) on the chat root.
- **BC3.** The new content type discriminators (`tool-call`, `tool-result`, `ui`) must be additive members of the `TDefaultMessageContent` union. Consumers' custom content types must continue to coexist.
- **BC4.** New exports are added to `src/index.ts` and a dedicated subpath export (`@gravity-ui/aikit/genui`) per the `aikit-new-component` checklist.
- **BC5.** The existing `tool` content type (`ToolMessageContent`) is preserved. The new `tool-call` type is _distinct_ and represents the **model-driven render directive**, while `tool` continues to represent an explicit, consumer-constructed tool message. A migration note documents the distinction.

---

## 16. Testing Requirements

Follow the existing AIKit Playwright Component Testing convention (`docs/guidelines/testing.md`, `aikit-testing` skill).

### 16.1 Unit / integration

- **T1.** The renderer registry has unit tests for: register, lookup, fallback on missing, override behavior, merge.
- **T2.** Schema validation has tests for: valid Zod schema, valid JSON Schema, validation failure path, partial-args path.
- **T3.** The `submitResult` channel has unit tests verifying that calling it from a mounted component yields exactly one `onToolResult` event with the correct `toolCallId`.

### 16.2 Visual / Playwright

- **T4.** One `*.visual.spec.tsx` per built-in renderer state: `input-streaming`, `input-available`, `output-available`, `output-error`. Run in Docker (`npm run playwright:docker`).
- **T5.** A round-trip story (Approval card → click "Approve" → assistant message with `tool-result` part appears) is covered end-to-end.
- **T6.** Re-hydration test: load a chat fixture containing both `tool-call` and matching `tool-result` parts; verify the component renders directly in "receipt" mode.

### 16.3 Adapter

- **T7.** The first-party adapter has unit tests covering: text-only message, single tool-call message, mixed `text + tool-call + text` ordering, partial-args streaming, tool-result outbound, error states.
- **T8.** Adapter tests use a recorded fixture stream for determinism. No live API calls in CI.

### 16.4 Storybook

- **T9.** Each built-in GenUI renderer ships with a `Docs.mdx` and a `*.stories.tsx` containing the standard story types (Playground, Default, Variants, Edge Cases) per `aikit-storybook`.
- **T10.** A top-level "GenUI" Storybook category provides a runnable demo chat with the reference adapter and a small mock backend (or recorded stream).

---

## 17. Documentation Requirements

- **D1.** A new top-level doc `docs/GENERATIVE_UI.md` covers concepts, the chosen protocol, and quickstart for consumers.
- **D2.** Each built-in GenUI renderer has a `README.md` per `aikit-readme` (Features, Usage, Props, Styling with CSS variables).
- **D3.** `docs/COMPONENTS.md` and `llms.txt` are updated to list new components.
- **D4.** `docs/ARCHITECTURE.md` gains a "Generative UI" section describing the two-registry architecture and adapter contract.
- **D5.** An `examples/` story shows a complete end-to-end integration with the reference adapter, including how to wire backend tool definitions to client renderers (without shipping any backend code in the library itself).
- **D6.** A migration guide for consumers already using the `tool` content type, clarifying when to keep that vs. when to register a GenUI tool.

---

## 18. Phased Delivery Plan

Engineers should deliver in three phases. Each phase has its own DoD; later phases are scoped _after_ the prior is shipped, reviewed, and used by at least one internal consumer.

### Phase 1 — Foundation (no UI loop yet)

Goal: registry + rendering + read-only `tool-call` parts. No `submitResult`.

Deliverables:

- `createGenUIToolRegistry`, `registerGenUITool`, `mergeGenUIToolRegistries`.
- New content types: `tool-call`, `tool-result`.
- Default `tool-call` renderer that dispatches into the GenUI registry.
- Schema validation (Zod first; JSON Schema deferred to Phase 2).
- Error boundary per part.
- Reference adapter for the chosen protocol — _inbound only_.
- Storybook + Playwright coverage for the lifecycle states.

### Phase 2 — Interactivity

Goal: full round-trip.

Deliverables:

- `submitResult` callback wiring through `onToolResult` chat-root prop.
- Adapter _outbound_ translation (e.g. `addToolResult` in AI SDK).
- `previousResult` prop on renderers; receipt-mode rendering.
- Re-hydration test fixture.
- Two reference built-in renderers: ApprovalCard, OptionList.
- JSON Schema support added alongside Zod.

### Phase 3 — Hardening & second adapter

Goal: production-grade resilience and protocol coverage.

Deliverables:

- Streaming-args progressive rendering opt-in.
- `React.lazy`-friendly registry.
- Timeout handling for stalled `input-streaming`.
- Second adapter (A2UI or AG-UI — choose based on §6 evaluation and market signal at the time).
- Performance benchmarks (re-render counts, mount cost) tracked over time.

---

## 19. Acceptance Criteria

A reasonable reviewer should sign off when **all** of the following hold:

1. A consumer can `registerGenUITool` with a Zod schema and a React component, pass the registry to AIKit's chat root, and see the component render when the model emits a matching tool call — using only public AIKit API.
2. The reference adapter translates the chosen protocol's tool-call stream into rendered parts with no consumer glue code beyond a single `useReferenceAdapter()` hook (or equivalent).
3. A user interacting with a built-in ApprovalCard sees their result reflected in the next assistant message after the model continues.
4. Reloading the page mid-conversation reconstructs the chat including all previously rendered components and their results, with no side effects re-fired.
5. An invalid schema match (model sends bad args) renders an inline error, does not crash the chat, and surfaces the error via `onError`.
6. An unknown tool name renders the fallback, does not crash the chat, and logs a single warning.
7. The Playwright suite (including new GenUI tests) passes in Docker on CI.
8. The public API surface diff vs. previous release is **purely additive**.
9. The bundle-size delta for consumers who do not opt in is **≤ 1 KB gzipped** (registry skeleton + types only; renderers are tree-shakable).
10. `docs/GENERATIVE_UI.md` and component READMEs are merged and link-validated.

---

## 20. Open Questions & Decisions to Make

The following must be resolved during design review before Phase 1 starts.

1. **Q1.** Final protocol selection (§6). Default proposal: Vercel AI SDK v5 — confirm or override.
2. **Q2.** Naming. `genUIRegistry` vs. `toolRegistry` vs. `componentRegistry`? Public API names matter; bikeshed once, in design review.
3. **Q3.** Should the GenUI registry be merged into `MessageRendererRegistry` or kept separate? Recommendation: separate (§5). Confirm.
4. **Q4.** Zod-only vs. Zod + JSON Schema in Phase 1? Recommendation: Zod-first to keep velocity, JSON Schema in Phase 2 once we have a second adapter that needs it.
5. **Q5.** How to expose tool descriptions to the _backend_ so the model "knows" the catalog? Two options: (a) AIKit ships a helper that serializes the registry to OpenAI tool format / JSON Schema for the consumer to include in their prompt; (b) AIKit stays purely client-side and the consumer maintains the schema in both places. Recommendation: (a), low-cost.
6. **Q6.** Lifecycle state for a tool-call whose model "decided to call" but server "rejected to execute" — do we render `output-error` or a distinct `denied` state?
7. **Q7.** Should multiple `submitResult` calls per tool-call be allowed (e.g. for slider live updates)? Default: no (one final result). Confirm.
8. **Q8.** Boundaries of "UI-only" vs. "server-executed" tools — does AIKit need to model this difference, or is it purely a backend concern? Recommendation: purely backend; AIKit only cares about the inbound part shape.
9. **Q9.** Error boundary granularity — per part, per message, or per chat? Recommendation: per part (§12 E3). Confirm.
10. **Q10.** Telemetry — do we emit AIKit-level events (`onGenUIEvent`) for analytics, or leave it to consumers' adapters? Recommendation: emit a single typed `onGenUIEvent` for major lifecycle transitions, low-overhead.

---

## 21. References

Internal AIKit:

- `src/types/messages.ts` — message and content type definitions.
- `src/utils/messageTypeRegistry.ts` — existing renderer registry.
- `src/components/organisms/AssistantMessage/AssistantMessage.tsx` — content-part iteration.
- `src/components/organisms/AssistantMessage/defaultMessageTypeRegistry.tsx` — default renderers.
- `src/adapters/openai/` — current adapter pattern.
- `docs/ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/guidelines/`.
- `docs/genui/GENERATIVE_UI_LANDSCAPE.md` — landscape report.
- `docs/genui/links.md` — research bibliography.

External protocols and libraries:

- Vercel AI SDK — Generative User Interfaces: https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
- Vercel AI SDK — UIMessage reference: https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message
- Vercel AI SDK — Chatbot Tool Usage: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
- assistant-ui — Tool Calling: https://www.assistant-ui.com/docs/guides/tools
- assistant-ui — Tool UI: https://www.tool-ui.com/docs/quick-start
- Google A2UI: https://github.com/google/A2UI
- Google A2UI v0.9 announcement: https://developers.googleblog.com/a2ui-v0-9-generative-ui/
- AG-UI (CopilotKit) — protocol and A2UI interop: https://blogs.oracle.com/ai-and-datascience/announcing-agent-spec-for-a2ui-copilotkit-ag-ui
