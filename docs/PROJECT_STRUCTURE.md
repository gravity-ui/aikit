# AIKit Project Structure

This document describes the layout of the `@gravity-ui/aikit` source tree.

## File Tree

```
aikit/
├── .storybook/              # Storybook configuration
├── .claude/                 # Claude Code skills for contributors
├── .cursor/                 # Cursor rules for contributors
├── docs/                    # Documentation (this directory)
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── COMPONENTS.md
│   ├── THEMING.md
│   ├── HOOKS.md
│   ├── I18N.md
│   ├── EXAMPLES.md
│   ├── TROUBLESHOOTING.md
│   ├── AI_AGENTS.md
│   ├── TESTING.md
│   ├── PLAYWRIGHT.md
│   ├── assets/              # Logos and cover image
│   └── guidelines/          # Internal contributor guidelines (storybook, testing, readme, code-style)
│
├── src/
│   ├── adapters/            # SDK adapters (OpenAI)
│   │   └── openai/
│   │
│   ├── components/
│   │   ├── atoms/           # 16 atoms
│   │   │   ├── ActionButton/   ChatDate/         ContextItem/
│   │   │   ├── Alert/          ContextIndicator/ DiffStat/
│   │   │   ├── Disclaimer/     FileIcon/         InlineCitation/
│   │   │   ├── IntersectionContainer/  Loader/   MarkdownRenderer/
│   │   │   ├── MessageBalloon/ Shimmer/          SubmitButton/
│   │   │   └── ToolIndicator/
│   │   │
│   │   ├── molecules/       # 19 molecules
│   │   │   ├── ActionPopup/    BaseMessage/      ButtonGroup/
│   │   │   ├── FeedbackForm/   FileDropZone/     FileItem/
│   │   │   ├── InputContext/   PromptInputBody/  PromptInputFooter/
│   │   │   ├── PromptInputHeader/  PromptInputPanel/   RatingBlock/
│   │   │   ├── StarRating/     Suggestions/      Tabs/
│   │   │   ├── ToolFooter/     ToolHeader/       ToolStatus/
│   │   │
│   │   ├── organisms/       # 9 organisms
│   │   │   ├── AssistantMessage/   AttachmentPicker/
│   │   │   ├── FileUploadDialog/   Header/        MessageList/
│   │   │   ├── PromptInput/        ThinkingMessage/
│   │   │   ├── ToolMessage/        UserMessage/
│   │   │
│   │   ├── templates/       # 3 templates
│   │   │   ├── ChatContent/        EmptyContainer/   History/
│   │   │
│   │   └── pages/           # 2 pages
│   │       ├── AIStudioChat/       ChatContainer/
│   │
│   ├── hooks/               # 7 public hooks (see docs/HOOKS.md)
│   │   ├── useDateFormatter/
│   │   ├── useToolMessage.tsx
│   │   ├── useSmartScroll.tsx
│   │   ├── useScrollPreservation.ts
│   │   ├── useAutoCollapseOnSuccess.ts
│   │   ├── useAutoCollapseOnCancelled.ts
│   │   └── useFileUploadStore.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── messages.ts      # TUserMessage, TAssistantMessage, TChatMessage, content types
│   │   ├── chat.ts          # ChatType, ChatStatus, list items
│   │   ├── tool.ts          # ToolMessageProps, statuses
│   │   └── common.ts        # ActionConfig, SuggestionsItem, shared types
│   │
│   ├── utils/               # Public utility modules
│   │   ├── chatUtils.ts
│   │   ├── messageUtils.ts
│   │   ├── validation.ts
│   │   ├── messageTypeRegistry.ts   # MessageRendererRegistry + helpers
│   │   ├── clipboardUtils.ts
│   │   ├── actionUtils.ts
│   │   └── cn.ts            # bem-react classname wrapper
│   │
│   ├── themes/              # Compiled CSS themes
│   │   ├── common.css       # Base CSS variables (always import)
│   │   ├── light.css        # [data-theme='light'] overrides
│   │   ├── dark.css         # [data-theme='dark'] overrides
│   │   └── variables.css    # Deprecated — use common.css
│   │
│   ├── server/              # Server-only code (Node.js)
│   │   └── openai/          # OpenAIService — Responses API wrapper, streaming, summarization
│   │
│   └── index.ts             # Main barrel export
│
├── playwright/              # Docker-backed Playwright runner
├── test-utils/              # Shared test helpers
├── build-utils/             # Build scripts (gulp tasks)
├── build/                   # Compiled output (esm/, cjs/, types)
├── llms.txt                 # LLM agent index (Mantine-style)
├── llms-full.txt            # Concatenated docs for LLM context
├── package.json
├── tsconfig.json
├── playwright-ct.config.ts
├── gulpfile.js
├── README.md / README-ru.md / CLAUDE.md / CONTRIBUTING.md
└── .gitignore / .eslintrc / .prettierrc / …
```

## Source Code: `src/`

### `src/components/`

Components organized by Atomic Design level. Each component lives in its own directory and follows the structure:

```
ComponentName/
├── ComponentName.tsx        # Implementation
├── ComponentName.scss       # Styles (optional)
├── types.ts                 # Component types (optional)
├── README.md                # Public API documentation
├── i18n/                    # Localization (optional)
│   ├── index.ts
│   ├── en.json
│   └── ru.json
├── __stories__/
│   ├── ComponentName.stories.tsx
│   └── Docs.mdx
├── __tests__/
│   ├── ComponentName.visual.spec.tsx
│   ├── helpersPlaywright.tsx
│   └── __snapshots__/
└── index.ts                 # Barrel export
```

Full component catalog: [COMPONENTS.md](./COMPONENTS.md).

### `src/hooks/`

Public hooks exported through both the root entry (`from '@gravity-ui/aikit'`) and the subpath `from '@gravity-ui/aikit/hooks'`. Internal helpers like `useMarkdownTransform` and `useRemend` live in `src/hooks/` but are not re-exported.

Full hooks reference: [HOOKS.md](./HOOKS.md).

### `src/types/`

Type definitions split by concern: messages, chats, tool messages, common (action configs, suggestions). All re-exported from the root via `src/types/index.ts` and accessible as `import type {…} from '@gravity-ui/aikit'` or `from '@gravity-ui/aikit/types'`.

### `src/utils/`

Each utility is exposed both via the root barrel and a dedicated subpath: `@gravity-ui/aikit/utils/chatUtils`, `/messageUtils`, `/validation`, `/messageTypeRegistry`, `/clipboardUtils`.

### `src/themes/`

CSS theming files. Import via subpaths:

```typescript
import '@gravity-ui/aikit/themes/common';
import '@gravity-ui/aikit/themes/light'; // or '/dark'
```

`variables.css` is deprecated — keep `common.css` only.

### `src/server/openai/`

Server-side only code, builds into a separate CommonJS/ESM target via `tsconfig.{esm,cjs}.json` and is exposed as the subpath `@gravity-ui/aikit/server/openai`. Pulls in `openai` and `semver` from `optionalDependencies`.

## Naming Conventions

- Component folders & files: `PascalCase` (e.g. `PromptInput/PromptInput.tsx`)
- Hooks: `useThing.ts` (or `.tsx` when JSX is present)
- Types files: `camelCase.ts`
- Test files: `<Name>.visual.spec.tsx` (Playwright), `<Name>.unit.test.ts` (Jest)
- Story files: `<Name>.stories.tsx`

## Export Hierarchy

```
ComponentName/index.ts
  → src/components/<level>/index.ts
    → src/components/index.ts (implicit via src/index.ts re-exports each level)
      → src/index.ts
```

Each component additionally has a dedicated subpath in `package.json#exports` (`@gravity-ui/aikit/ComponentName`) for tree-shaken imports.

## Useful Links

- [Quick Start](./GETTING_STARTED.md)
- [Architecture](./ARCHITECTURE.md)
- [Component Catalog](./COMPONENTS.md)
- [Theming](./THEMING.md)
- [Hooks](./HOOKS.md)
- [Examples](./EXAMPLES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [AI Agent Integration](./AI_AGENTS.md)
- [Testing Guide](./TESTING.md)
- [Contributor Guidelines](./guidelines/)
