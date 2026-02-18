# useOpenAIStreamAdapter

React-хуки для приведения ответов [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) (стриминг и обычный ответ) к формату `TChatMessage[]` для использования с ChatContainer и MessageList.

Требуется опциональная зависимость `openai` (`openai ^6.x`).

## Хуки

### useOpenAIStreamAdapter

Для **стриминга**: принимает SSE-поток или `AsyncIterable` событий и возвращает сообщения, статус и ошибку.

**Источники:**

- Ответ `fetch()` с `Content-Type: text/event-stream` (например, от прокси или своего эндпоинта)
- `AsyncIterable<OpenAIStreamEventLike>` (например, `openai.responses.create({ stream: true })`)

**Опции:** `initialMessages`, `assistantMessageId`, `onStreamEnd`.

**Результат:** `{ messages, status, error }`, где `status` — `'idle' | 'streaming' | 'done' | 'error'`.

### useOpenAIResponsesAdapter

Для **одного ответа без стриминга**: принимает полный объект ответа и возвращает `TChatMessage[]` (одно сообщение ассистента).

---

## Примеры

### Стриминг с OpenAI SDK

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

### Стриминг через fetch (SSE)

```tsx
const result = useOpenAIStreamAdapter(null, {initialMessages: []});

const response = await fetch('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({messages}),
});
// response.headers.get('content-type') === 'text/event-stream'
setStream(response);
```

### Без стриминга (один ответ)

```tsx
import {useOpenAIResponsesAdapter} from '@gravity-ui/aikit';

const messages = useOpenAIResponsesAdapter(response);
// response от openai.responses.create({ stream: false })
```

---

## Поддерживаемый контент стрима

- **Текст:** `response.output_text.delta`, дельты refusal
- **Рассуждения (thinking):** `response.output_item.added` (reasoning), `response.reasoning_text.delta` / `.done`, `response.reasoning_summary_text.*`
- **Инструменты:** `response.output_item.added` / `.done` для `function_call`, `mcp_call`, `mcp_approval_request`, `mcp_submission_request`, `file_search_call`, `web_search_call`, `code_interpreter_call`, `image_generation_call`, `mcp_list_tools`; события прогресса обновляют статус инструмента

Отдельные сообщения ассистента создаются только при `response.output_item.done` с `item.type === 'message'`. События `.done` для MCP/инструментов/reasoning не разбивают сообщения.

## Типы

Экспортируемые типы: `OpenAIStreamAdapterOptions`, `OpenAIStreamAdapterResult`, `OpenAIStreamSource`, `OpenAIResponseLike`, `OpenAIStreamEventLike`, `FetchResponseLike`. См. `./types` и `./types/openAiTypes`.
