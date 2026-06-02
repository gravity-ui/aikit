# Simplifying Consumer API for Custom Tool Components

> Follow-up to [APPROACH_DECISION.md](./APPROACH_DECISION.md) — how much further
> can we shrink the consumer-side code for plugging in a custom tool component
> on top of the elegant pattern (`type: 'tool'` + `MessageRendererRegistry` +
> toolset lookup)?

**Date:** 2026-06-02
**Status:** Design note — two targeted refactors proposed.

---

## TL;DR

The elegant pattern is already lean, but ~80 lines of registry/wiring
boilerplate in `ElegantLive.stories.tsx` are **identical across products** and
belong in the library. Pulling them into aikit gives consumers a 3-line wiring
step with zero new dependencies.

A Zod-first `defineTool` collapses per-tool boilerplate by another ~30–40 lines
but reintroduces the schema dependency we just rejected from core. Ship it as
optional sugar in a subpackage or docs example only.

---

## Where the boilerplate lives today

In `src/genui/__stories__/ElegantLive.stories.tsx`:

| Block                                                                          | Lines                 | Reusable?                   |
| ------------------------------------------------------------------------------ | --------------------- | --------------------------- |
| `defineTool` factory                                                           | 250–276               | Yes — same in every product |
| `createElegantToolRegistry`                                                    | 303–365               | Yes — same in every product |
| `handleToolResult` merge logic                                                 | 615–651               | Yes — same in every product |
| Per-tool: types, JSON Schema, validate, component, `execute`                   | ~30–50 lines per tool | Per product                 |
| LLM adapter (`messagesToChatCompletions`, `chatCompletionsToAssistantMessage`) | ~100 lines            | Per provider (stays in app) |

The first three rows (~120 lines) are the **same in every consumer** and the
natural candidates for promotion into `@gravity-ui/aikit`.

---

## Option 1 — Promote wiring helpers into aikit (recommended)

Export three small primitives from aikit. No new deps. Reuses existing
`MessageRendererRegistry`.

```ts
// @gravity-ui/aikit
export function defineTool<TArgs, TResult>(
  def: ToolDefinition<TArgs, TResult>,
): RuntimeToolDefinition;
export function createToolsetRenderer(
  toolset: Record<string, RuntimeToolDefinition>,
  options: {onToolResult: (event: ToolResultEvent) => void},
): MessageRendererRegistry;
export function useToolset(
  toolset: Record<string, RuntimeToolDefinition>,
  setMessages: Dispatch<SetStateAction<TChatMessage[]>>,
  options?: {onAfterResult?: (messages: TChatMessage[]) => void},
): {registry: MessageRendererRegistry; handleToolResult: (event: ToolResultEvent) => void};
```

**Consumer code after the change:**

```tsx
const toolset = {
    weather_show: defineTool<WeatherArgs, WeatherResult>({
        name: 'weather_show',
        description: 'Render a weather card.',
        parameters: weatherParameters,
        schema: {validate: validateWeatherArgs},
        component: WeatherCard,
        execute: ({args, result}) => ({...}),
    }),
};

const {registry, handleToolResult} = useToolset(toolset, setMessages, {
    onAfterResult: (next) => sendTurn(next),
});

<ChatContainer
    messageListConfig={{messageRendererRegistry: registry}}
    ...
/>
```

The 80+ lines of `createElegantToolRegistry` / `handleToolResult` merge logic
disappear from app code.

**What stays in app code (by design):**

- Tool definition (types, JSON Schema, validate, component, execute)
- LLM adapter (provider format ↔ aikit content parts)
- `sendTurn` / `onToolResult` round-trip to the API

### Trade-offs

| Pro                                              | Con                                                    |
| ------------------------------------------------ | ------------------------------------------------------ |
| ~80 fewer boilerplate lines per consumer         | +3 small exports on aikit's surface                    |
| No new dependencies                              | Library now ships an opinion about toolset shape       |
| Same elegant mental model — just packaged        | Future tool-definition changes become breaking changes |
| Composes with existing `MessageRendererRegistry` | —                                                      |

This is a **net win** as long as we keep the helpers thin (no Ajv, no lifecycle,
no streaming-args sugar) — anything beyond pure wiring drifts back toward the
branch's `src/genui/` scope that we already rejected.

---

## Option 2 — Zod-first `defineTool` (optional sugar)

Collapse per-tool boilerplate by accepting a Zod schema as the single source of
truth for TypeScript types, runtime validation, **and** JSON Schema (via
`zod-to-json-schema`).

**Before:**

```tsx
type WeatherArgs = {city: string; value: number; units?: 'c' | 'f'};
const weatherParameters: JSONSchemaObject = {/* hand-written JSON Schema */};
function validateWeatherArgs(input: unknown): SchemaResult<WeatherArgs> {/* … */}

defineTool<WeatherArgs, WeatherResult>({
    name: 'weather_show',
    description: 'Render a weather card.',
    parameters: weatherParameters,
    schema: {validate: validateWeatherArgs},
    component: WeatherCard,
    execute: ({args, result}) => ({...}),
});
```

**After:**

```tsx
const WeatherSchema = z.object({
    city: z.string(),
    value: z.number(),
    units: z.enum(['c', 'f']).optional(),
});

defineTool({
    name: 'weather_show',
    description: 'Render a weather card.',
    schema: WeatherSchema,           // types + validation + JSON schema
    component: WeatherCard,          // props inferred from z.infer<typeof WeatherSchema>
    execute: ({args, result}) => ({...}),
});
```

Per-tool savings: ~30–40 lines (types, JSON Schema, validator).

### Trade-offs

| Pro                                                 | Con                                                             |
| --------------------------------------------------- | --------------------------------------------------------------- |
| Drastically shorter per-tool definition             | Requires `zod-to-json-schema` peer dep                          |
| Type inference from schema (single source of truth) | Reintroduces the Ajv/Zod story we explicitly rejected from core |
| Familiar pattern (matches Vercel AI SDK / Tool UI)  | Adds an opinion about validation library                        |

**Where to ship it:** **not** in aikit core. Options:

- `@gravity-ui/aikit/zod` optional subpath — peer dep, opt-in
- Plain docs example showing how a consumer can wire Zod themselves in ~10 lines
- A separate companion package

Keeping core dependency-free preserves the "elegant default" promise. Consumers
who want Zod can opt in; consumers who don't pay zero cost.

---

## Recommendation

1. **Do Option 1.** Promote `defineTool`, `createToolsetRenderer`, and
   `useToolset` (or equivalent) into aikit. Pure wiring, no deps, same mental
   model. Consumer-side wiring drops to ~3 lines.
2. **Defer Option 2** to docs / an optional subpackage. Don't bundle Zod or
   `zod-to-json-schema` into core. Show one Zod adapter example in the GenUI
   guide so teams that want it can copy it.
3. **Keep the LLM adapter (`messagesToChatCompletions` etc.) in app code.** It
   is provider-specific and not the library's concern. If we ever want to
   centralize it, ship it as `@gravity-ui/aikit/openai-adapter` separately.

### What the consumer ends up writing for a new tool

After Option 1 (no Zod):

- A type for args + result (~5 lines)
- A JSON Schema parameters object (~10 lines) **or** a `validate` function (~10 lines)
- A React component receiving `{args, result, submitResult}` (~20 lines)
- One `defineTool({…})` entry in the toolset map (~10 lines)

≈ **45 lines per tool, zero wiring code.**

After Option 2 (with optional Zod):

- One Zod schema (~5 lines)
- A React component (~20 lines)
- One `defineTool({schema, component, execute})` entry (~6 lines)

≈ **30 lines per tool, zero wiring code, one opt-in peer dep.**

---

## See Also

- [APPROACH_DECISION.md](./APPROACH_DECISION.md) — why the elegant pattern over the branch GenUI module
- [INSIGHTS.md](./INSIGHTS.md) — full branch review and layer model
- `src/genui/__stories__/ElegantLive.stories.tsx` — reference implementation today
