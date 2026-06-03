# Review: `feat/genui-phase-1` vs `main`

Scope: `src/utils/toolset.tsx`, `src/hooks/useToolset.ts`, `src/components/organisms/AssistantMessage/__stories__/CustomToolRenderer.stories.tsx`, `docs/GENUI.md`, and the barrel updates in `src/hooks/index.ts` / `src/utils/index.ts`.

## Correctness / minor bugs

1. **`createToolsetRenderer` mutates the input `registry`** (`src/utils/toolset.tsx:130`). It calls `registerMessageRenderer`, which `Object.assign`s into the passed object — so a caller who composes their own registry will see the `tool` renderer silently appear on their reference. Either clone first (`{...registry}`) or rename to make the mutation explicit. The doc claims "other types are preserved" but doesn't say "we mutate yours".

2. **Spread leak in error fallback** (`src/utils/toolset.tsx:137-160`). `<ToolMessage {...toolPart} ...>` spreads `toolCallId`, `args`, `result` into a `ToolMessageProps`-typed component. TS doesn't catch it (excess props aren't checked on spread), and they end up as unknown attrs. Spread only the fields `ToolMessage` actually accepts, or destructure first.

3. **Hardcoded English in fallbacks** (`Unknown tool: ${toolName}`, validation error message at lines 144, 157). AIKit has i18n infra (every other organism has `i18n/` JSONs); these strings should run through it or be configurable.

4. **`applyToolResult` always sets `status: 'success'`** (`src/utils/toolset.tsx:231`). For a "rejected" approval the tool _executed_ successfully so that's defensible — but worth documenting, otherwise users will wonder how to surface failed executions distinctly. Consider letting `execute` return `{status, result}` (or use a sentinel) so the tool can signal `error`/`cancelled`.

## API ergonomics

5. **Toolset key/name duplication** (story line 97-117, doc line 76-103). `'approval.request': defineTool({name: 'approval.request', ...})` — typo-prone. Add a `createToolset(...tools): Toolset` that keys off `definition.name`. Cuts a class of bugs and makes call sites shorter.

6. **`Toolset` is `Record<string, RuntimeToolDefinition>` — fully erased.** Tool authors lose type info at the call site. A variadic `createToolset<T extends readonly ToolDefinition<any, any>[]>(...t): Record<T[number]['name'], RuntimeToolDefinition>` would give name autocomplete on lookups and keep the dispatch table accurate.

7. **`useToolset(toolset, setMessages, options?)` positional API**. Mixing required positional + options is awkward and won't scale as more hooks land. Single options object: `useToolset({toolset, setMessages, onAfterResult, registry})`.

8. **`defineTool` carries `description`/`parameters` that the renderer never uses** — they're for building OpenAI `tools[]`. Ship a `toolsetToOpenAIDefinitions(toolset)` helper so every user doesn't reimplement the `Object.values(...).map(...)` snippet shown in `docs/GENUI.md:363-368`.

## Tests / coverage

9. **No unit tests** for `applyToolResult`, `defineTool` erasure, validation, "unknown tool" fallback, or the `useToolset` reducer (microtask deferral, no-op when nothing matched). The story covers only the happy path. At least `applyToolResult` is pure and trivial to cover.

10. **Story rolls its own merge** (`CustomToolRenderer.stories.tsx:156-187`) instead of using `useToolset`. That's the _opposite_ of what consumers should do. Add a second story (or replace the existing one) that shows `useToolset` end-to-end with a mock `sendTurn`, since `useToolset` is the recommended path per the docs.

## Docs

11. **`docs/GENUI.md` has transient context that will rot**: `Date: 2026-06-02`, `Status: Shipped in @gravity-ui/aikit`, and the "Removed from the repo (do not look for them): `src/genui/*`, ElegantLive stories, `examples/genui-live-proxy/`" block (lines 7-25). That's a PR description, not evergreen reference material. Strip it.

12. **No cross-links from existing docs**: `docs/HOOKS.md` doesn't list `useToolset` in its index table, `docs/COMPONENTS.md` has no toolset row, `llms.txt` has no entry. Without these, the new feature is undiscoverable from the canonical entry points (per `CLAUDE.md` / `aikit-new-component` skill conventions).

13. **No subpath export** in `package.json#exports`. Sibling utils (`./utils/chatUtils`, `./utils/messageUtils`, `./utils/validation`, `./utils/messageTypeRegistry`, `./utils/clipboardUtils`) all have dedicated exports; `./utils/toolset` deserves its own subpath for consistency and tree-shaking.

## Small nits

14. **`useToolset.ts:51` `queueMicrotask` deferral has no comment.** This is exactly the "non-obvious WHY" carve-out: it exists to avoid re-entrant setState during the reducer pass. One line.

15. **`useToolset.ts:42` effect with no deps**, just to mirror `onAfterResult` into a ref — fine but `useRef(options?.onAfterResult)` only captures the _initial_ value; the effect runs every render to sync. A short comment ("keep latest callback without rerunning the registry memo") would make it self-explanatory.

16. **`RuntimeToolDefinition.render` returns `ReactNode` from a plain function**, not a `ComponentType`. Hooks placed at the top of `render` will silently break (only the wrapped `Component` is a real React component). Worth a JSDoc warning or just rename to `Renderer` and type as `ComponentType` so the boundary is enforced.

## Suggested order

Start with #1, #2, #5, and #11–13 — quick wins with the highest leverage.
