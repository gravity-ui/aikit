# OpenAI Adapters

React hooks to adapt [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) and conversations list to the library types: `TChatMessage[]` for ChatContainer/MessageList and `ChatType[]` for History.

Requires `openai` as an optional peer dependency (`openai ^6.x`).

## Hooks

### useOpenAIConversationsAdapter

Use for **conversations list**: accepts an array of conversations or a response object with `data` and returns `ChatType[]` for the History component (sidebar chat list).

**Input:** `OpenAIConversationLike[]` or `OpenAIConversationsListResponseLike` (e.g. `{ data: conversations }`) or `null` / `undefined`.

**Result:** `{ chats: ChatType[] }` — each chat has `id`, `name` (from `metadata.title` or `metadata.name`, fallback `"Chat"`), `createTime` (ISO string from `created_at`), `lastMessage` (from `metadata.last_message`), and `metadata`.

Use with ChatContainer's History: pass `chats` from the result into the `chats` prop.

### useOpenAIStreamAdapter

Use for **streaming** responses: consumes an SSE stream or an `AsyncIterable` of stream events and returns messages, status, and error.

**Sources:**

- `fetch()` Response with `Content-Type: text/event-stream` (e.g. from a proxy or custom endpoint)
- `AsyncIterable<OpenAIStreamEventLike>` (e.g. `openai.responses.create({ stream: true })`)

**Options:** `initialMessages`, `assistantMessageId`, `onStreamEnd`.

**Result:** `{ messages, status, error }` where `status` is `'idle' | 'streaming' | 'done' | 'error'`.

### useOpenAIResponsesAdapter

Use for **single, non-streaming** responses: accepts a full response object and returns `TChatMessage[]` (one assistant message).

---

## Examples

### Conversations list for History

```tsx
import {ChatContainer, useOpenAIConversationsAdapter, type ChatType} from '@gravity-ui/aikit';

function ChatWithHistory() {
  const [conversationsResponse, setConversationsResponse] = useState(null);
  const {chats} = useOpenAIConversationsAdapter(conversationsResponse);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);

  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.json())
      .then(setConversationsResponse);
  }, []);

  return (
    <ChatContainer
      chats={chats}
      activeChat={activeChat}
      onSelectChat={setActiveChat}
      messages={[]}
      onSendMessage={() => {}}
    />
  );
}
```

### Streaming with OpenAI SDK

```tsx
import OpenAI from 'openai';
import {
  ChatContainer,
  useOpenAIStreamAdapter,
  type OpenAIStreamSource,
  type TChatMessage,
} from '@gravity-ui/aikit';

const openai = new OpenAI({apiKey: '...'});

function Chat() {
  const [stream, setStream] = useState<OpenAIStreamSource | null>(null);
  const [history, setHistory] = useState<TChatMessage[]>([]);

  const result = useOpenAIStreamAdapter(stream, {
    initialMessages: history,
    onStreamEnd: (messages) => setHistory(messages),
  });

  const send = async (content: string) => {
    const userMessage = {id: 'user-1', role: 'user', content};
    setHistory((prev) => [...prev, userMessage]);

    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [...history, userMessage].map((m) => ({role: m.role, content: m.content})),
      stream: true,
    });
    setStream(response);
  };

  return <ChatContainer messages={result.messages} onSend={send} />;
}
```

### Streaming from fetch (SSE)

```tsx
const [stream, setStream] = useState<OpenAIStreamSource | null>(null);
const result = useOpenAIStreamAdapter(stream, {initialMessages: []});

const response = await fetch('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({messages}),
});
// response.headers.get('content-type') === 'text/event-stream'
setStream(response);
```

### Non-streaming (single response)

```tsx
import {useOpenAIResponsesAdapter} from '@gravity-ui/aikit';

const messages = useOpenAIResponsesAdapter(response);
// response from openai.responses.create({ stream: false })
```

---

## Supported stream content

- **Text:** `response.output_text.delta`, refusal deltas
- **Reasoning (thinking):** `response.output_item.added` (reasoning), `response.reasoning_text.delta` / `.done`, `response.reasoning_summary_text.*`
- **Tools:** `response.output_item.added` / `.done` for `function_call`, `mcp_call`, `mcp_approval_request`, `mcp_submission_request`, `file_search_call`, `web_search_call`, `code_interpreter_call`, `image_generation_call`, `mcp_list_tools`; progress events update tool status

Multiple assistant messages are created only when the API sends `response.output_item.done` with `item.type === 'message'`. MCP/tool/reasoning `.done` events do not split messages.

## Types

Exported types: `OpenAIStreamAdapterOptions`, `OpenAIStreamAdapterResult`, `OpenAIStreamSource`, `OpenAIResponseLike`, `OpenAIStreamEventLike`, `FetchResponseLike`, `OpenAIConversationLike`, `OpenAIConversationsListResponseLike`, `UseOpenAIConversationsAdapterResult`. See `./types` and `./types/openAiTypes`.
