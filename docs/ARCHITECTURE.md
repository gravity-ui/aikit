# AIKit Library Architecture

## Atomic Design Principles

The library is built on **Atomic Design** principles, which ensure:

- Clear component hierarchy
- Element reusability
- Easy maintenance
- Flexible customization

## Component Levels

### 1. Atoms

Minimal indivisible UI elements without business logic.

**Characteristics:**

- Do not contain business logic
- Stateless
- Unaware of usage context
- Accept data only through props

**Examples:** `ActionButton`, `Alert`, `Loader`, `Shimmer`, `MarkdownRenderer`

### 2. Molecules

Simple groups of atoms forming basic UI blocks.

**Characteristics:**

- Combine multiple atoms
- Minimal internal logic
- Reusable blocks

**Examples:** `ButtonGroup`, `Tabs`, `Suggestions`, `BaseMessage`, `PromptInputBody`

### 3. Organisms

Complex self-sufficient components with internal logic.

**Characteristics:**

- Contain business logic
- Have internal state
- Can be used independently

**Examples:** `Header`, `MessageList`, `PromptInput`, `UserMessage`, `AssistantMessage`, `ToolMessage`, `ThinkingMessage`, `FileUploadDialog`

### 4. Templates

Complete layouts combining organisms.

**Characteristics:**

- Define page structure
- Coordinate organism interactions
- Work with abstract data

**Examples:** `History`, `EmptyContainer`, `ChatContent`

### 5. Pages

Full integrations with specific data.

**Characteristics:**

- Highest level of abstraction
- Manage data and state
- Connect all components together

**Examples:** `ChatContainer`, `AIStudioChat`

### 6. Server

Code that runs exclusively on the server side and is responsible for interacting with external APIs, primarily neural network services.

**Characteristics:**

- Runs only on the server
- Contains no UI and is not involved in component rendering
- Serves as a middleware layer between the application and external services (such as neural network APIs)

**Examples:** `OpenAIService` (`@gravity-ui/aikit/server/openai`)

## Two-Level Approach

The library offers two ways to integrate a chat:

### 1. Ready Page Component

`ChatContainer` (or `AIStudioChat`) — a fully assembled chat with header, history, message list, and prompt input:

```tsx
import {ChatContainer} from '@gravity-ui/aikit';

<ChatContainer
  chats={chats}
  activeChat={activeChat}
  messages={messages}
  onSendMessage={handleSend}
  onSelectChat={setActiveChat}
  onCreateChat={createChat}
  onDeleteChat={deleteChat}
/>;
```

### 2. Compose from Organisms

Drop down to individual organisms when you need a custom layout:

```tsx
import {Header, MessageList, PromptInput} from '@gravity-ui/aikit';

function CustomChat() {
  return (
    <div className="custom-chat">
      <Header title="AI Assistant" onNewChat={createChat} />
      <MessageList messages={messages} status="ready" />
      <PromptInput onSubmit={handleSend} placeholder="Enter message…" />
    </div>
  );
}
```

Composition-level hooks (`useToolMessage`, `useSmartScroll`, `useFileUploadStore`, etc.) are documented in [HOOKS.md](./HOOKS.md).

## State Management

### Data Handling Principle

- The library is **state-agnostic**: it does not own messages, chats, or upload state
- All data flows through props
- The library invokes callbacks (`onSendMessage`, `onSelectChat`, `onCreateChat`, `onDeleteChat`, …) and lets the host application manage requests, persistence, and errors

### Data Flow Example

```tsx
const [messages, setMessages] = useState<TChatMessage[]>([]);
const [status, setStatus] = useState<ChatStatus>('ready');

<ChatContainer
  messages={messages}
  status={status}
  onSendMessage={async (data) => {
    setStatus('streaming');
    const reply = await fetchAssistantReply(data.content);
    setMessages((prev) => [...prev, reply]);
    setStatus('ready');
  }}
/>;
```

## Type System

### Message Types

```typescript
export type TMessageRole = 'user' | 'assistant' | 'system';

export type TUserMessage = {
  role: 'user';
  content: string;
  timestamp?: string;
  format?: 'plain' | 'markdown';
  images?: string[];
  fileAttachments?: FileAttachment[];
};

export type TAssistantMessage<TCustomContent = never> = {
  role: 'assistant';
  content: string | TMessageContent | TMessageContent[];
  timestamp?: string;
  userRating?: 'like' | 'dislike';
};

export type TChatMessage<TCustomContent = never> = TUserMessage | TAssistantMessage<TCustomContent>;
```

Assistant content can be a plain string, a single typed part (`'text'` | `'thinking'` | `'tool'`), or an array of parts. Custom part types extend via the `TCustomContent` generic.

### Chat Types

```typescript
export type ChatType = {
  id: string;
  name: string;
  createTime: string | null;
  lastMessage?: string;
  metadata?: Record<string, unknown>;
};

export type ChatStatus = 'submitted' | 'streaming' | 'streaming_loading' | 'ready' | 'error';
```

Full type catalog: `src/types/{messages,chat,tool,common}.ts`.

## Extensibility

### Custom Message Content Renderers

Register custom content types via `MessageRendererRegistry`:

```tsx
import {
  createMessageRendererRegistry,
  registerMessageRenderer,
  type MessageRendererRegistry,
} from '@gravity-ui/aikit';

type ChartMessageContent = {
  type: 'chart';
  data: {points: number[]};
};

const renderers: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartMessageContent>(renderers, 'chart', {
  render: ({content}) => <Chart points={content.data.points} />,
});

<MessageList messages={messages} messageRendererRegistry={renderers} />;
```

See [src/components/organisms/MessageList/README.md](../src/components/organisms/MessageList/README.md) for the full registry API and validators.

### Adapters

`src/adapters/` houses pre-built integrations (e.g. `openai`). They are imported through the main package entry: `import {…} from '@gravity-ui/aikit'`.

### Generative UI

`src/genui/` adds a second registry (`GenUIToolRegistry`) keyed by **tool name** that maps model-emitted `tool-call` parts to interactive React components and gives them a typed round-trip back to the model.

```tsx
import {createGenUIToolRegistry, registerGenUITool} from '@gravity-ui/aikit';

const registry = createGenUIToolRegistry();
registerGenUITool(registry, {
  name: 'weather.show',
  schema: z.object({city: z.string()}),
  component: ({args, submitResult}) => (
    <WeatherCard city={args.city} onAcknowledge={() => submitResult({acknowledged: true})} />
  ),
});

<ChatContainer
  messageListConfig={{
    genUIRegistry: registry,
    onToolResult: (event) => appendPart(event.part),
  }}
/>;
```

Key properties:

- Opt-in — omit `genUIRegistry` and AIKit behaves exactly as before.
- Zod and JSON Schema are both first-class; Zod is an optional peer dep.
- The default `tool-call` renderer dispatches per-tool, validates args, and shows a per-tool loading / error slot.
- A per-part error boundary isolates render failures from sibling parts.
- AIKit never mutates `content[]`; consumers append the `tool-result` part themselves.

See [docs/GENERATIVE_UI.md](./GENERATIVE_UI.md) for details and the BC5 migration note about the existing `tool` content type.

## Theming

### CSS Variables

All styles are controlled through CSS variables in the `--g-aikit-*` namespace, with fallbacks to Gravity UI's `--g-color-*` system:

```css
.g-root {
  --g-aikit-color-bg-primary: var(--g-aikit-bg-primary, var(--g-color-base-float));
}

[data-theme='dark'] {
  --g-aikit-bg-message-user: #0066cc;
}
```

### Applying a Theme

Wrap the application in Gravity UI's `<ThemeProvider>` and import the matching theme CSS:

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';
import '@gravity-ui/aikit/themes/common';
import '@gravity-ui/aikit/themes/dark';

<ThemeProvider theme="dark">
    <ChatContainer …/>
</ThemeProvider>;
```

Full CSS variable reference: [THEMING.md](./THEMING.md).

## Performance

### Optimizations

- `React.memo` on heavy renderers
- `react-window` virtualization for long message lists
- Lazy hooks (`useSmartScroll`, `useScrollPreservation`) to avoid layout thrash
- Markdown transform cache (`useMarkdownTransform`)

## Accessibility

### ARIA Attributes

All interactive elements expose:

- `aria-label` for screen readers
- `role` for semantics
- `aria-live` for streaming/loading regions

### Keyboard Navigation

- `Enter` — send message
- `Shift+Enter` — newline
- `Escape` — cancel / close
- `Tab` — navigation

## Testing

Component tests run under Playwright Component Testing — see [TESTING.md](./TESTING.md). For developer guidelines specific to writing components, stories, and tests inside this repo, see [guidelines/](./guidelines/).
