# @gravity-ui/aikit

UI component library for AI chats built with Atomic Design principles.

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
import type { ChatType, MessageType } from '@gravity-ui/aikit';

function App() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [chats, setChats] = useState<ChatType[]>([]);
    const [activeChat, setActiveChat] = useState<ChatType | null>(null);

    return (
        <ChatContainer
            chats={chats}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={async (content) => {
                // Your sending logic
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

- `Loader` — loading indicator
- `ContextIndicator` — token context indicator
- `ToolIndicator` — tool execution status
- `MessageBalloon` — message wrapper
- `SubmitButton` — submit button
- `DiffStat` — change statistics
- `Shimmer` — loading animation
- `InlineCitation` — text citations
- `ChatDate` — date formatting

### 🔸 Molecules

Simple combinations of atoms:

- `ButtonGroup` — button group
- `Tabs` — navigation tabs
- `Suggestions` — input suggestions
- `InputContext` — context management
- `BaseMessage` — wrapper for all message types

### 🔶 Organisms

Complex components with internal logic:

- `Header` — chat header
- `Footer` — chat footer
- `UserMessage` — user message
- `ThinkingMessage` — AI thinking process
- `ToolMessage` — tool execution
- `PromptBox` — message input field
- `MessageList` — message list

### 📄 Templates

Complete layouts:

- `History` — chat history
- `EmptyContainer` — empty state
- `ChatContent` — main chat content

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

```bash
# Install Playwright browsers (run once)
npm run playwright:install

# Run all component tests
npm run playwright

# Update screenshot baselines
npm run playwright:update

# Run tests via Docker (for non-Linux systems)
npm run playwright:docker
```

For detailed testing documentation, see [Playwright Guide](./playwright/README.md).

## Development

Development and contribution instructions are available in [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
