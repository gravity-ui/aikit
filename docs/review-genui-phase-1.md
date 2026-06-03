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

## Additional notes

I agree with most of this review, but I would split it more explicitly into blockers, API follow-ups, and cleanup. Right now real behavioral/API risks (#1, #9, #10, #13) sit next to softer polish items (#14–16), which makes the list feel flatter than the actual risk profile.

- **Must fix before merge:** #1, #2, #9, #10, #11, #13. These either affect public API behavior, test confidence, or package discoverability.
- **Good API follow-ups:** #5, #6, #8. `createToolset(...)` and `toolsetToOpenAIDefinitions(...)` would remove boilerplate and prevent key/name drift, but they can land after the initial behavior is solid.
- **Docs/comments polish:** #4, #14, #15. Useful, but not worth blocking the branch by themselves.
- **Worth softening:** #2 is a prop-boundary leak rather than a clear DOM unknown-attribute leak, because `ToolMessage` does not spread the whole props object into the DOM. #3 should distinguish library-owned fallback text (`Unknown tool`) from user-provided validation messages. #12 should probably mention `docs/HOOKS.md` and `llms.txt`; `docs/COMPONENTS.md` is debatable because toolset is not a component.

## Response to the additional notes

Largely agree, with a few quibbles.

**Where I agree with the codex notes**

- Splitting by severity is the right call — the original groups were thematic, not risk-ranked.
- **#2 softening is correct.** Overstated above. `ToolMessage` destructures props (it doesn't spread into a DOM node), so the extra `toolCallId`/`args`/`result` are silently discarded rather than leaking as unknown HTML attrs. It's a type-hygiene issue, not a runtime bug. Worth fixing but not a behavior risk.
- **#3 softening is correct.** Library only owns `Unknown tool: ${toolName}`; the validation `.message` already comes from user code, so it belongs to whoever wrote the schema and shouldn't go through library i18n. Tighten the recommendation to "i18n the library-owned strings only."
- **#12 softening is correct.** `docs/COMPONENTS.md` is a component catalog — toolset/`useToolset` aren't components, so listing them there is a category error. `docs/HOOKS.md` and `llms.txt` are the right targets.
- API follow-ups bucket (#5, #6, #8) is reasonable as non-blocking.

**Where to push back**

- **#4 is mis-bucketed as "docs/comments polish."** Status pinning to `'success'` is an API expressivity gap, not a doc gap. If a tool needs to report an execution error or a user cancel, there's currently no path. Belongs in API follow-ups (alongside #5/#6/#8), not in polish.
- **The must-fix list is a touch aggressive for #11.** Stripping transient context from `GENUI.md` is nice-to-have, not merge-blocking — it will age poorly but will not break any consumer. Move to docs follow-up.
- **#13 (subpath export) as a blocker is debatable.** It matters for consistency and slightly for tree-shaking, but `./utils` and `./hooks` already expose everything. Defer-able unless the team treats subpath parity as a hard rule.

**Revised grouping to ship with**

- **Blockers:** #1, #9, #10.
- **Strong follow-ups:** #2, #4, #5, #6, #8, #11, #12, #13.
- **Polish:** #3 (library strings only), #14, #15, #16.

## Final implementation plan

Follow the revised grouping above.

1. **Ship gate:** fix #1, add focused unit coverage for #9, and update the story for #10 so the documented/recommended `useToolset` path is what consumers see first.
2. **Strong follow-up pass:** handle #2, #4, #5/#6/#8, and #12/#13 after the core behavior is stable. #13 can move into the ship gate if subpath-export parity is considered a release requirement.
3. **Polish pass:** tighten #3 to library-owned fallback strings only, then add the explanatory comments/JSDoc from #14, #15, and #16.
