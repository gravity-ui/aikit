# Using AIKit with AI Agents (Claude Code / Cursor)

When you install `@gravity-ui/aikit` in a downstream project, you can teach Claude Code and Cursor about it so they write correct code without you spelling out the API every time.

After install, two files are available locally:

- `node_modules/@gravity-ui/aikit/llms.txt` — concise index (component catalog + key links)
- `node_modules/@gravity-ui/aikit/llms-full.txt` — full documentation concatenated

The patterns below point your agent at those files.

## Cursor: drop-in rule

Create `.cursor/rules/aikit.mdc` in your project:

```
---
description: Gravity UI AIKit (@gravity-ui/aikit) component library
globs: src/**/*.{ts,tsx,jsx,js}
alwaysApply: false
---

The project uses @gravity-ui/aikit for AI chat components.

Reference:
- `node_modules/@gravity-ui/aikit/llms.txt` — catalog of components, hooks, peer deps, theming
- `node_modules/@gravity-ui/aikit/llms-full.txt` — full docs (read on demand)

Conventions when using @gravity-ui/aikit:
- Prefer the page-level `ChatContainer` for quick integration; drop to organisms (`PromptInput`, `MessageList`, `Header`) for custom layouts.
- Custom assistant content parts go through `MessageRendererRegistry` via `createMessageRendererRegistry` + `registerMessageRenderer<T>`. There is no `messageTypeRegistry` prop.
- Theme CSS must be imported at the app root: `@gravity-ui/aikit/themes/common` + one of `/light` or `/dark`. Render inside `<ThemeProvider>` from `@gravity-ui/uikit`.
- Subpath imports (`@gravity-ui/aikit/Header`, etc.) are tree-shakable and preferred over the barrel entry for production code.
- Peer deps required: @gravity-ui/uikit, @gravity-ui/icons, @gravity-ui/i18n, @diplodoc/transform, highlight.js, react>=18.
```

This rule auto-attaches when you edit anything under `src/`. The agent reads `llms.txt` on first use and consults `llms-full.txt` for deeper questions.

## Claude Code: drop-in skill

Create `.claude/skills/aikit/SKILL.md` in your project:

```markdown
---
name: aikit
description: Gravity UI AIKit (@gravity-ui/aikit) React component library for building AI chats. Use when the user works with @gravity-ui/aikit components, hooks, types, theming, or examples.
---

Read `node_modules/@gravity-ui/aikit/llms.txt` for the component catalog and `node_modules/@gravity-ui/aikit/llms-full.txt` for full documentation.

Key conventions:

- `ChatContainer` is the quickest integration; drop to organisms (`PromptInput`, `MessageList`, `Header`) for custom layouts.
- Custom message content parts: `createMessageRendererRegistry` + `registerMessageRenderer<T>(reg, 'type', {render: …})`; pass via `messageRendererRegistry` prop on `MessageList`.
- Theme CSS at app root: `@gravity-ui/aikit/themes/common` plus `/light` or `/dark`. Wrap tree in `<ThemeProvider>` from `@gravity-ui/uikit`.
- Subpath imports (`@gravity-ui/aikit/Header`, etc.) for tree-shaking.
- Peer deps required: @gravity-ui/uikit, @gravity-ui/icons, @gravity-ui/i18n, @diplodoc/transform, highlight.js, react>=18.
```

Claude Code surfaces the skill in its registry; it will load it when your prompts touch AIKit.

## Without npm install (raw GitHub access)

If the agent can fetch URLs and you don't have the package installed locally yet, point at the raw files on GitHub:

```
https://raw.githubusercontent.com/gravity-ui/aikit/main/llms.txt
https://raw.githubusercontent.com/gravity-ui/aikit/main/llms-full.txt
```

## Verifying the setup

After dropping in the snippet:

- **Cursor**: open any `src/**/*.tsx` file; in the chat panel the rule `aikit` should appear in the attached-rules list. Ask "what's the right way to render a streaming assistant message with @gravity-ui/aikit?" — the agent should cite the streaming example from `llms-full.txt`.
- **Claude Code**: start a new session and ask "give me a minimal `ChatContainer` usage example." The agent should invoke the `aikit` skill and reproduce the code from the docs.

If neither happens, double-check that the rule/skill file is in the right location and that `node_modules/@gravity-ui/aikit/llms.txt` actually exists (run `cat node_modules/@gravity-ui/aikit/llms.txt | head` to verify).
