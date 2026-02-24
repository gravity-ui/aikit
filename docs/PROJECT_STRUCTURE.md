# Aikit Project Structure

## File Tree

```
aikit/
├── 📁 .storybook/              # Storybook configuration
│   ├── main.ts
│   └── preview.ts
│
├── 📁 docs/                    # Documentation
│   ├── ARCHITECTURE.md         # Library architecture
│   ├── GETTING_STARTED.md      # Quick start guide
│   ├── TESTING.md              # Testing guide
│   ├── PLAYWRIGHT.md           # Playwright commands reference
│   └── PROJECT_STRUCTURE.md    # This file
│
├── 📁 src/                     # Library source code
│   ├── 📁 components/          # All components
│   │   │
│   │   ├── 📁 atoms/           # ⚛️ Atoms - basic elements
│   │   │   ├── 📁 Loader/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ContextIndicator/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ToolIndicator/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 MessageBalloon/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 SubmitButton/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 DiffStat/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 Shimmer/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 InlineCitation/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ChatDate/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 molecules/       # 🧩 Molecules - groups of atoms
│   │   │   ├── 📁 ButtonGroup/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 Tabs/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 Suggestions/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 InputContext/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 BaseMessage/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 organisms/       # 🦠 Organisms - complex components
│   │   │   ├── 📁 Header/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 Footer/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 UserMessage/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ThinkingMessage/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ToolMessage/
│   │   │   │   ├── 📁 ToolHeader/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── 📁 ToolFooter/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 PromptBox/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 MessageList/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 templates/       # 📄 Templates - complete layouts
│   │   │   ├── 📁 History/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 EmptyContainer/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 ChatContent/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 pages/           # 📱 Pages - full integrations
│   │   │   ├── 📁 ChatContainer/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── 📁 hooks/               # 🪝 General purpose hooks
│   │   └── index.ts
│   │
│   ├── 📁 types/               # 📝 TypeScript types
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   ├── atoms.ts
│   │   ├── molecules.ts
│   │   ├── organisms.ts
│   │   ├── templates.ts
│   │   └── pages.ts
│   │
│   ├── 📁 utils/               # 🛠️ Utilities
│   │   ├── index.ts
│   │   ├── chatUtils.ts
│   │   ├── messageUtils.ts
│   │   └── validation.ts
│   │
│   ├── 📁 themes/              # 🎨 CSS themes and variables
│   │   ├── variables.css
│   │   ├── light.css
│   │   └── dark.css
│   │
│   ├── 📁 server/              # 🗄️ Server utilites for interacting with neural network services
│   │   └── openai
│   │
│   └── index.ts                # Main export
│
├── 📄 .gitignore
├── 📄 commitlint.config.js
├── 📄 jest.config.js
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 playwright-ct.config.ts
├── 📄 README.md
├── 📄 CONTRIBUTING.md
├── 📄 LICENSE
└── 📄 plan.md                  # Full specification
```

## Directory Description

### 📁 `.storybook/`

Storybook configuration for interactive component documentation.

### 📁 `docs/`

Project documentation:

- `ARCHITECTURE.md` — architectural decisions and principles
- `GETTING_STARTED.md` — quick start guide
- `TESTING.md` — testing guide with Playwright
- `PLAYWRIGHT.md` — Playwright commands quick reference
- `PROJECT_STRUCTURE.md` — this file

### 📁 `src/components/`

All library components organized by Atomic Design levels:

#### ⚛️ `atoms/`

Basic indivisible UI elements without business logic:

- **Loader** — loading indicator
- **ContextIndicator** — context usage indicator
- **ToolIndicator** — tool execution status
- **MessageBalloon** — message wrapper
- **SubmitButton** — submit button
- **DiffStat** — code change statistics
- **Shimmer** — loading animation
- **InlineCitation** — text citations
- **ChatDate** — date formatting

#### 🧩 `molecules/`

Simple combinations of atoms:

- **ButtonGroup** — button group
- **Tabs** — navigation tabs
- **Suggestions** — input suggestions
- **InputContext** — input context management
- **BaseMessage** — base wrapper for all messages

#### 🦠 `organisms/`

Complex self-sufficient components with internal logic:

- **Header** — chat header with navigation
- **Footer** — footer with links
- **UserMessage** — user message
- **ThinkingMessage** — AI thinking process
- **ToolMessage** — tool execution
  - **ToolHeader** — tool message header
  - **ToolFooter** — footer with confirmation buttons
- **PromptBox** — message input field
- **MessageList** — message list

#### 📄 `templates/`

Complete layouts:

- **History** — chat history
- **EmptyContainer** — empty chat state
- **ChatContent** — main chat content

#### 📱 `pages/`

Full integrations with data:

- **ChatContainer** — fully assembled chat

### 📁 `src/hooks/`

General purpose hooks:

- `useChat` — chat and message management
- `useMessages` — message operations

### 📁 `src/types/`

TypeScript types and interfaces:

- `messages.ts` — message types
- `atoms.ts` — atom types
- `molecules.ts` — molecule types
- `organisms.ts` — organism types
- `templates.ts` — template types
- `pages.ts` — page types

### 📁 `src/utils/`

Utility functions:

- `chatUtils.ts` — chat utilities
- `messageUtils.ts` — message utilities
- `validation.ts` — validation functions

### 📁 `src/themes/`

CSS themes and variables:

- `variables.css` — base CSS variables
- `light.css` — light theme
- `dark.css` — dark theme

## Organization Principles

### 1. Each Component in Its Own Folder

Each component has its own folder with an `index.ts` file for export.

### 2. Export Hierarchy

```
Component/index.ts → atoms/index.ts → components/index.ts → src/index.ts
```

### 3. Naming Conventions

- Component folders: `PascalCase`
- Component files: `ComponentName.tsx`
- Style files: `ComponentName.scss`
- Type files: `camelCase.ts`
- Hooks: `useHookName.ts`

### 4. Component Structure

```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.scss      # Styles
├── ComponentName.test.tsx  # Tests
├── ComponentName.stories.tsx # Storybook
├── useComponentName.ts     # Hook (for organisms)
└── index.ts               # Export
```

## Next Steps

1. **Atom Implementation** — start with the simplest components
2. **Molecule Creation** — combine atoms
3. **Organism Development** — add logic and hooks
4. **Template Assembly** — create complete layouts
5. **Page Integration** — bring everything together

## Useful Links

- [Full Specification](../plan.md)
- [Architecture](./ARCHITECTURE.md)
- [Quick Start](./GETTING_STARTED.md)
- [Testing Guide](./TESTING.md)
- [Playwright Commands](./PLAYWRIGHT.md)
- [Contributing](../CONTRIBUTING.md)
