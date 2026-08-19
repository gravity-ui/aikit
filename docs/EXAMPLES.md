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

## 2. File Upload with `AttachmentPicker` + `useFileUploadStore`

`AttachmentPicker` is a paperclip button that renders `FileUploadDialog` internally — you never
mount the dialog yourself. Neither component owns upload state: `useFileUploadStore` holds the
queue and you hand its data to the picker through `fileDialogProps`.

The hook takes an `upload` callback (one file in, metadata out) and returns `entries`, `addFiles`,
`removeFile`, `reset`, `uploadedMetas`, and `isLoading`:

```tsx
import {AttachmentPicker, useFileUploadStore} from '@gravity-ui/aikit';

type UploadMeta = {id: string; name: string; mimeType?: string};

function useAttachmentPicker() {
  const {entries, addFiles, removeFile, reset, uploadedMetas} = useFileUploadStore<UploadMeta>({
    // Called once per file; return whatever metadata your backend responds with.
    upload: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {method: 'POST', body: form});
      return (await res.json()) as UploadMeta;
    },
  });

  const attachmentPicker = (
    <AttachmentPicker
      uploadOnly
      fileDialogProps={{
        title: 'Attach files',
        multiple: true,
        onAdd: addFiles,
        onCancel: reset,
        files: entries.map((entry) => ({
          id: entry.id,
          name: entry.file.name,
          size: entry.file.size,
          mimeType: entry.file.type || undefined,
          status: (() => {
            if (entry.status === 'uploading') return 'loading';
            if (entry.status === 'done') return 'success';
            if (entry.status === 'error') return 'error';
            return undefined;
          })(),
          onRemove: () => removeFile(entry.id),
        })),
      }}
    />
  );

  return {attachmentPicker, entries, removeFile, reset, uploadedMetas};
}
```

Mount the picker in the prompt input footer and mirror the queue as removable chips in the header:

```tsx
function ChatWithAttachments() {
  const {attachmentPicker, entries, removeFile, reset, uploadedMetas} = useAttachmentPicker();

  const handleSendMessage = async (data: TSubmitData) => {
    // `uploadedMetas` holds the backend metadata of successfully uploaded files.
    const fileAttachments = uploadedMetas.map((meta) => ({
      id: meta.id,
      name: meta.name,
      mimeType: meta.mimeType,
    }));
    reset();
    await sendToBackend({content: data.content, fileAttachments});
  };

  return (
    <ChatContainer
      messages={messages}
      status={status}
      onSendMessage={handleSendMessage}
      promptInputProps={{
        view: 'full',
        headerProps: {
          contextItems: entries.map((entry) => ({
            id: entry.id,
            content: entry.file.name,
            onRemove: () => removeFile(entry.id),
          })),
        },
        footerProps: {attachmentContent: attachmentPicker},
      }}
    />
  );
}
```

`entries` (not `files`) lists every queued / uploading / done / errored entry, each carrying its
`status`, `id`, and original `File`; `uploadedMetas` narrows that to the metadata of entries that
finished uploading. A runnable version of this wiring is in
[`WithAttachmentInput`](../src/components/pages/ChatContainer/__stories__/parts/attachments.tsx),
and `InputContextProvider` packages the same logic behind a context — see
[src/components/molecules/InputContext/InputContextProvider.tsx](../src/components/molecules/InputContext/InputContextProvider.tsx).

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
