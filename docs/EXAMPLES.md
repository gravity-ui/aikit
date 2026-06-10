# Examples

Practical patterns for common AIKit integrations.

## 1. Streaming Assistant Responses

Append a placeholder assistant message and mutate it as tokens arrive.

```tsx
import {useState} from 'react';
import {ChatContainer} from '@gravity-ui/aikit';
import type {ChatStatus, TChatMessage, TSubmitData} from '@gravity-ui/aikit';

function StreamingChat() {
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');

  const handleSend = async (data: TSubmitData) => {
    setMessages((prev) => [
      ...prev,
      {role: 'user', content: data.content, timestamp: new Date().toISOString()},
      {role: 'assistant', content: '', timestamp: new Date().toISOString()},
    ]);
    setStatus('streaming');

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({message: data.content}),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, {stream: true});
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {...next[next.length - 1], content: accumulated};
        return next;
      });
    }

    setStatus('ready');
  };

  return (
    <ChatContainer
      chats={[]}
      activeChat={null}
      messages={messages}
      status={status}
      onSendMessage={handleSend}
      onSelectChat={() => {}}
      onCreateChat={() => {}}
      onDeleteChat={() => {}}
    />
  );
}
```

Server-side: AIKit ships an OpenAI streaming wrapper — see [§4](#4-server-side-openai-via-server-openai).

## 2. File Upload with `FileUploadDialog` + `AttachmentPicker`

`AttachmentPicker` is a button that opens `FileUploadDialog`. State is managed by `useFileUploadStore`:

```tsx
import {AttachmentPicker, FileUploadDialog, useFileUploadStore} from '@gravity-ui/aikit';

function PromptWithAttachments() {
  const upload = useFileUploadStore({
    async uploader(file, onProgress) {
      // POST to your backend, return some metadata
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {method: 'POST', body: form});
      return await res.json(); // {id, name}
    },
  });

  return (
    <>
      <AttachmentPicker store={upload} />
      <FileUploadDialog store={upload} />
    </>
  );
}
```

`store.files` lists every queued / uploading / uploaded / errored entry; pass it down or read from it when constructing the user message's `fileAttachments`.

## 3. Custom Message Content Renderer

Add a custom assistant content part (e.g. interactive chart) via `MessageRendererRegistry`:

```tsx
import {
  createMessageRendererRegistry,
  registerMessageRenderer,
  MessageList,
  type MessageRendererRegistry,
  type TMessageContent,
} from '@gravity-ui/aikit';

type ChartContent = TMessageContent<'chart', {points: number[]; label?: string}>;

const renderers: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartContent>(renderers, 'chart', {
  render: ({content}) => <Chart points={content.data.points} title={content.data.label} />,
});

function ChatView({messages}: {messages: TChatMessage<ChartContent>[]}) {
  return <MessageList messages={messages} messageRendererRegistry={renderers} status="ready" />;
}
```

A produced assistant message may now mix text and custom parts:

```typescript
const msg: TAssistantMessage<ChartContent> = {
  role: 'assistant',
  content: [
    {type: 'text', data: {text: 'Here is the trend:'}},
    {type: 'chart', data: {points: [1, 4, 9, 16, 25], label: 'Squares'}},
  ],
};
```

## 4. Server-Side OpenAI via `server/openai`

A Node-only wrapper for OpenAI's Responses API. Install the optional `openai` dependency:

```bash
npm install openai
```

```typescript
import {OpenAIService} from '@gravity-ui/aikit/server/openai';

const service = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY!,
  // Other OpenAI client options
});

// Streaming response
app.post('/api/chat/stream', async (req, res) => {
  const stream = await service.createResponseStream({input: req.body.message});

  stream.onBufferChunk((chunk) => res.write(chunk));
  stream.onEventChunk((event) => {
    if (event.type === 'response.completed') res.end();
  });

  stream.start();

  req.on('close', () => stream.abort());
});

// Conversation title summarization
app.post('/api/chat/title', async (req, res) => {
  const title = await service.summarizeConversationTitle({
    conversation: req.body.conversationId,
    byLastItems: 5, // or `byFirstItems`
  });
  res.json({title});
});
```

The `optionalDependencies` field in `package.json` lists `openai` and `semver` — install them only on the server side.

## 5. Drop-in `AIStudioChat`

If you have an AI Studio compatible endpoint, `AIStudioChat` wraps `ChatContainer` and handles streaming/state internally:

```tsx
import {AIStudioChat} from '@gravity-ui/aikit';

<AIStudioChat apiUrl="https://api.example.com/ai-studio" />;
```

See `src/components/pages/AIStudioChat/README.md` for the full prop list.

## 6. Custom Composition: Header + MessageList + PromptInput

When `ChatContainer` is too opinionated, build your own layout from organisms:

```tsx
import {Header, MessageList, PromptInput} from '@gravity-ui/aikit';

function MyChat() {
  return (
    <div className="my-chat">
      <Header title="AI Assistant" onNewChat={createChat} onHistory={openHistory} />
      <MessageList messages={messages} status={status} />
      <PromptInput onSubmit={handleSend} placeholder="Ask me anything…" />
    </div>
  );
}
```

Each organism exposes its full prop surface through its own README; combine them however you need.
