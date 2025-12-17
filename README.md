# AIKit &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/aikit?logo=npm)](https://www.npmjs.com/package/@gravity-ui/aikit) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/aikit/.github/workflows/ci.yml?branch=main&label=CI&logo=github)](https://github.com/gravity-ui/aikit/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685?logo=storybook)](https://preview.gravity-ui.com/aikit/?path=/docs/pages-chatcontainer--docs)

UI component library for AI chats built with Atomic Design principles.

<!--GITHUB_BLOCK-->

![Cover image](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/aikit_cover.png)

## Resources

### ![Globe Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/globe_light.svg#gh-light-mode-only) ![Globe Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/globe_dark.svg#gh-dark-mode-only) [Website](https://gravity-ui.com/libraries/aikit)

### ![Storybook Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/storybook_light.svg#gh-light-mode-only) ![Storybook Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/storybook_dark.svg#gh-dark-mode-only) [Storybook](https://preview.gravity-ui.com/aikit/)

### ![Community Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/telegram_light.svg#gh-light-mode-only) ![Community Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/telegram_dark.svg#gh-dark-mode-only) [Community](https://t.me/gravity_ui)

<!--/GITHUB_BLOCK-->

## Description

**@gravity-ui/aikit** is a flexible and extensible React component library for building AI chats of any complexity. The library provides a set of ready-made components that can be used as-is or customized to fit your needs.

### Key Features

- 🎨 **Atomic Design** — clear component hierarchy from atoms to pages
- 🔧 **SDK Agnostic** — independent of specific AI SDKs
- 🎭 **Two-Level Approach** — ready-made components + hooks for customization
- 🎨 **CSS Variables** — easy theming without component overrides
- 📦 **TypeScript** — full type safety out of the box
- 🔌 **Extensible** — custom message type registration system

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Basic indivisible UI elements
│   ├── molecules/      # Simple groups of atoms
│   ├── organisms/      # Complex components with logic
│   ├── templates/      # Complete layouts
│   └── pages/          # Full integrations with data
├── hooks/              # General purpose hooks
├── types/              # TypeScript types
├── utils/              # Utilities
└── themes/             # CSS themes and variables
```

## Installation

```bash
npm install @gravity-ui/aikit
```

## Quick Start

```typescript
import { ChatContainer } from '@gravity-ui/aikit';
import type { ChatType, TChatMessage } from '@gravity-ui/aikit';

function App() {
    const [messages, setMessages] = useState<TChatMessage[]>([]);
    const [chats, setChats] = useState<ChatType[]>([]);
    const [activeChat, setActiveChat] = useState<ChatType | null>(null);

    return (
        <ChatContainer
            chats={chats}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={async (data) => {
                // Your sending logic
                console.log('Message:', data.content);
            }}
            onSelectChat={setActiveChat}
            onCreateChat={() => {
                // Create new chat
            }}
            onDeleteChat={(chat) => {
                // Delete chat
            }}
        />
    );
}
```

## Architecture

The library is built on **Atomic Design** principles:

### 🔹 Atoms

Basic indivisible UI elements without business logic:

- `ActionButton` — button with integrated tooltip
- `Alert` — alert messages with variants
- `ChatDate` — date formatting with relative dates
- `ContextIndicator` — token context usage indicator
- `ContextItem` — context label with remove action
- `DiffStat` — code change statistics display
- `Disclaimer` — disclaimer text component
- `InlineCitation` — text citations
- `Loader` — loading indicator
- `MarkdownRenderer` — Yandex Flavored Markdown renderer
- `MessageBalloon` — message wrapper
- `Shimmer` — loading animation effect
- `SubmitButton` — submit button with states
- `ToolIndicator` — tool execution status indicator

### 🔸 Molecules

Simple combinations of atoms:

- `BaseMessage` — base wrapper for all message types
- `ButtonGroup` — button group with orientation support
- `InputContext` — context management
- `PromptInputBody` — textarea with auto-growing
- `PromptInputFooter` — footer with action icons and submit button
- `PromptInputHeader` — header with context items and indicator
- `PromptInputPanel` — panel container for custom content
- `Suggestions` — clickable suggestion buttons
- `Tabs` — navigation tabs with delete functionality
- `ToolFooter` — tool message footer with actions
- `ToolHeader` — tool message header with icon and actions

### 🔶 Organisms

Complex components with internal logic:

- `AssistantMessage` — AI assistant message
- `Header` — chat header
- `MessageList` — message list
- `PromptInput` — message input field
- `ThinkingMessage` — AI thinking process
- `ToolMessage` — tool execution
- `UserMessage` — user message

### 📄 Templates

Complete layouts:

- `ChatContent` — main chat content
- `EmptyContainer` — empty state
- `History` — chat history

### 📱 Pages

Full integrations:

- `ChatContainer` — fully assembled chat

## Documentation

- [Quick Start Guide](./docs/GETTING_STARTED.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Testing Guide](./docs/TESTING.md)
- [Playwright Guide](./playwright/README.md)

## Testing

The project uses Playwright Component Testing for visual regression testing.

### Run tests

**Important**: All tests must be run via Docker to ensure consistent screenshots across different environments.

```bash
# Run all component tests in Docker (recommended)
npm run playwright:docker

# Update screenshot baselines in Docker
npm run playwright:docker:update

# Run specific test by grep pattern in Docker
npm run playwright:docker -- --grep "@ComponentName"

# Clear Docker cache if needed
npm run playwright:docker:clear-cache
```

### Local testing (Linux only)

If you're on Linux, you can run tests locally:

```bash
# Install Playwright browsers (run once)
npm run playwright:install

# Run all component tests
npm run playwright

# Update screenshot baselines
npm run playwright:update
```

For detailed testing documentation, see [Playwright Guide](./playwright/README.md).

## Development

Development and contribution instructions are available in [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
