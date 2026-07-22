# AIAgentContext

A framework for collecting contextual data from the React tree and exposing it to LLM agents via system prompts.

## Features

- **Declarative registration** — `<AIData />` component registers page context from anywhere in the tree
- **Programmatic registration** — `useProvideAIData` hook for non-JSX use cases
- **On-demand reads** — `getData()` collects fresh values without triggering re-renders
- **Prompt builder** — `buildAIContextSystemPrompt()` formats entries into an LLM-ready system prompt
- **Custom templates** — `AIPrompt` tagged template literals for full prompt customization
- **Zero re-renders** — registry lives in a ref; getters are called only when `getData()` runs

## Usage

```tsx
import {
  AIAgentContextProvider,
  AIData,
  buildAIContextSystemPrompt,
  useAIAgentContext,
} from '@gravity-ui/aikit/utils/aiAgentContext';

function ProductPage({product, user}) {
  return (
    <AIAgentContextProvider>
      <AIData label="Current user" data={user} />
      <AIData label="Current product" data={product} />
      <ChatWithContext />
    </AIAgentContextProvider>
  );
}

function ChatWithContext() {
  const {getData} = useAIAgentContext();

  const handleSend = async (message: string) => {
    const systemPrompt = buildAIContextSystemPrompt(getData());
    await sendToLLM({message, systemPrompt});
  };

  return <ChatContainer onSendMessage={handleSend} />;
}
```

### Custom prompt template

```tsx
import {AIPrompt, buildAIContextSystemPrompt} from '@gravity-ui/aikit/utils/aiAgentContext';

const template = AIPrompt`Page context for the assistant:

${(entries, options) =>
  entries.map((entry) => `## ${entry.label}\n${options.formatData(entry.data)}`)}
`;

const systemPrompt = buildAIContextSystemPrompt(getData(), {template});
```

## Important notes

### When to call `getData()`

Registration happens in `useEffect`, so `getData()` is only meaningful **after mount** of components that register data. Do not call it synchronously during render or in `useLayoutEffect` in the same commit — the registry will be empty until effects run.

Call `getData()` from event handlers, async callbacks, or effects that run after children have mounted (e.g. on send message).

### Why a ref for props

The registry stores a getter `() => propsRef.current` instead of a snapshot of props. This lets `getData()` always return the latest data without re-registering on every render.

### Generic type `T`

`useAIAgentContext<T>()` returns `AIDataEntry<T>[]`, but `T` is the **expected** shape for your consumer — not validated or guaranteed at runtime. Different `AIData` registrations may have different data types.

## API

| Export                           | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| `AIAgentContextProvider`         | Context provider that owns the data registry          |
| `AIData`                         | Side-effect component that registers `{label, data}`  |
| `useProvideAIData`               | Hook equivalent of `<AIData />`                       |
| `useAIAgentContext`              | Returns `{ getData }` to read all registered entries  |
| `buildAIContextSystemPrompt`     | Formats entries into a system prompt string           |
| `AIPrompt`                       | Tagged template helper for custom prompt templates    |
| `DEFAULT_SYSTEM_PROMPT_TEMPLATE` | Default template used by `buildAIContextSystemPrompt` |

### `AIDataProps`

| Prop    | Type     | Required | Description                                             |
| ------- | -------- | -------- | ------------------------------------------------------- |
| `label` | `string` | ✓        | Human-readable description of what this data represents |
| `data`  | `T`      | ✓        | The actual data to expose to the AI agent               |

### `BuildAIContextOptions`

| Prop         | Type                        | Description                            |
| ------------ | --------------------------- | -------------------------------------- |
| `template`   | `PromptBuilderParams`       | Custom prompt template from `AIPrompt` |
| `formatData` | `(data: unknown) => string` | Custom serializer (default: YAML-like) |
