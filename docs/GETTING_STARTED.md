# Quick Start

This guide walks you through installing `@gravity-ui/aikit` and rendering your first chat.

## Installation

```bash
npm install @gravity-ui/aikit
```

You also need to install the peer dependencies (most likely already in your app if you use Gravity UI):

```bash
npm install @gravity-ui/uikit @gravity-ui/icons @gravity-ui/i18n @diplodoc/transform highlight.js react react-dom
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if `Module not found` errors appear after install.

## Theme CSS

AIKit ships compiled CSS that you must import once at the application root:

```typescript
import '@gravity-ui/aikit/themes/common';
import '@gravity-ui/aikit/themes/light'; // or '/dark'
```

The component tree must be rendered inside Gravity UI's `<ThemeProvider>` (from `@gravity-ui/uikit`) so that `data-theme="light"` / `data-theme="dark"` is set on the root.

## 1. Simple Chat Out of the Box

The fastest path is the `ChatContainer` page component:

```tsx
import {useState} from 'react';
import {ChatContainer} from '@gravity-ui/aikit';
import type {ChatType, TChatMessage, TSubmitData} from '@gravity-ui/aikit';

function App() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<TChatMessage[]>([]);

  const handleSendMessage = async (data: TSubmitData) => {
    // Append the user message immediately
    setMessages((prev) => [...prev, {role: 'user', content: data.content}]);

    // Call your backend, then append the assistant message
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({message: data.content}),
    });
    const assistant = await response.json();
    setMessages((prev) => [...prev, {role: 'assistant', content: assistant.content}]);
  };

  return (
    <ChatContainer
      chats={chats}
      activeChat={activeChat}
      messages={messages}
      onSendMessage={handleSendMessage}
      onSelectChat={setActiveChat}
      onCreateChat={() => {
        /* create chat */
      }}
      onDeleteChat={(chat) => {
        /* delete chat */
      }}
    />
  );
}
```

## 2. Composing from Organisms

For more control, compose `Header`, `MessageList`, and `PromptInput` directly:

```tsx
import {Header, MessageList, PromptInput} from '@gravity-ui/aikit';

function CustomChat() {
  return (
    <div className="custom-chat">
      <Header
        title="AI Assistant"
        onNewChat={() => {
          /* ... */
        }}
      />
      <MessageList messages={messages} status="ready" />
      <PromptInput onSubmit={handleSend} placeholder="Enter message…" />
    </div>
  );
}
```

Each organism has its own README in `src/components/organisms/<Name>/README.md` with the full props table.

## 3. Hooks

AIKit exports a small set of hooks for advanced composition (date formatting, smart scrolling, tool-message state, file-upload store, etc.). See [HOOKS.md](./HOOKS.md) for the catalog and signatures.

## Working with Message Types

Messages are typed by `role` (`'user'` | `'assistant'` | `'system'`). Assistant content supports multi-part rendering — a string, a single `TMessageContent` object, or an array of parts.

### Built-in content types

| Type       | Description                       |
| ---------- | --------------------------------- |
| `text`     | Plain text or markdown            |
| `thinking` | AI thinking process (collapsible) |
| `tool`     | Tool execution with status        |

```tsx
import type {TAssistantMessage} from '@gravity-ui/aikit';

const message: TAssistantMessage = {
  role: 'assistant',
  timestamp: new Date().toISOString(),
  content: [
    {type: 'text', data: {text: 'Let me think…'}},
    {type: 'thinking', data: {content: 'Analyzing the request', status: 'thinking'}},
    {type: 'text', data: {text: 'Here is the answer.'}},
  ],
};
```

### Custom message content types

Register a custom renderer with `MessageRendererRegistry`:

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

See [src/components/organisms/MessageList/README.md](../src/components/organisms/MessageList/README.md) for the full registry API.

## Theming

Theme switching is done via Gravity UI's `<ThemeProvider>` (sets `data-theme` on the root). AIKit ships per-theme CSS files; import them at the application root.

CSS variables follow the `--g-aikit-*` convention and are documented in [THEMING.md](./THEMING.md).

## Streaming Responses

Stream tokens by mutating an in-flight assistant message with `status: 'streaming'` on `MessageList`:

```tsx
const handleSendMessage = async (data: TSubmitData) => {
  setMessages((prev) => [...prev, {role: 'user', content: data.content}]);

  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({message: data.content}),
  });
  const reader = response.body!.getReader();
  let accumulated = '';

  // Insert a placeholder assistant message
  setMessages((prev) => [...prev, {role: 'assistant', content: ''}]);

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    accumulated += new TextDecoder().decode(value);
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = {role: 'assistant', content: accumulated};
      return next;
    });
  }
};
```

For an end-to-end working example with OpenAI on the server side, see [EXAMPLES.md](./EXAMPLES.md).

## Server-Side: OpenAI Adapter

A server-side helper (`@gravity-ui/aikit/server/openai`) wraps the OpenAI Responses API:

```typescript
const service = new OpenAIService({
  /* config */
});

const stream = await service.createResponseStream({input: 'Hello world'});
stream.start();
stream.onEventChunk(console.log); // typed event chunks
stream.onBufferChunk(console.log); // raw chunks (e.g. to forward over HTTP)
stream.abort(); // cancel
```

`openai` and `semver` are listed as `optionalDependencies` — install them only if you use the server adapter.

## Next Steps

- Component catalog: [COMPONENTS.md](./COMPONENTS.md)
- Theming and CSS variables: [THEMING.md](./THEMING.md)
- Hooks reference: [HOOKS.md](./HOOKS.md)
- Real-world examples: [EXAMPLES.md](./EXAMPLES.md)
- Architecture deep dive: [ARCHITECTURE.md](./ARCHITECTURE.md)
- AI agent integration in your project: [AI_AGENTS.md](./AI_AGENTS.md)
