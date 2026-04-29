# AIStudioChat Experiment

A ready-to-use chat component with built-in OpenAI streaming support. Wraps `ChatContainer` and manages all internal state — requires only an API URL to start working.

## Features

- **Zero boilerplate** — pass `apiUrl` and the component handles streaming, messages, and cancellation internally
- **OpenAI streaming** — uses `useOpenAIStreamAdapter` to parse server-sent events in real-time
- **Image attachments** — image files attached to a message are converted to base64 and displayed in the message bubble, and sent to the API as multipart content
- **Multi-chat history** — enable a full history panel with `showHistory={true}`; chats are created and switched automatically
- **Session restore** — pre-populate messages on mount via `initialMessages` (e.g., for rehydrating a stored session)
- **System prompt** — configure a persistent system instruction sent with every request
- **Extra request params** — inject arbitrary fields (e.g., `assistantId`, `promptVariables`) into every request body via `extraRequestParams`
- **Pre-send hook** — use `onBeforeSend` to add per-request params dynamically or cancel a send
- **Fetch customization** — pass auth headers or other fetch options via `requestInit`
- **Full ChatContainer API** — all `ChatContainer` display props (`welcomeConfig`, `i18nConfig`, `promptInputProps`, etc.) are passed through

## Usage

```tsx
import {AIStudioChat} from '@gravity-ui/aikit';

// Minimal usage
<AIStudioChat apiUrl="/api/chat" />

// With welcome screen and system prompt
<AIStudioChat
  apiUrl="/api/chat"
  systemPrompt="You are a helpful coding assistant."
  welcomeConfig={{
    title: 'How can I help you today?',
    suggestions: [
      {id: '1', title: 'Explain async/await'},
      {id: '2', title: 'Review my code'},
    ],
  }}
  showActionsOnHover
/>

// With multi-chat history enabled
<AIStudioChat
  apiUrl="/api/chat"
  showHistory
  showNewChat
  requestInit={{
    headers: {Authorization: `Bearer ${token}`},
  }}
/>

// Passing extra fields to the API on every request (e.g. assistantId)
<AIStudioChat
  apiUrl="/api/chat"
  extraRequestParams={{
    assistantId: 'asst_abc123',
    promptVariables: {language: 'English'},
  }}
/>

// Injecting per-request params dynamically (or cancelling the send)
<AIStudioChat
  apiUrl="/api/chat"
  onBeforeSend={async ({content}) => {
    const token = await getIamToken();
    if (!token) return false; // cancel send
    return {apiKey: token};   // merged into request body
  }}
/>

// Restoring a previous session
<AIStudioChat
  apiUrl="/api/chat"
  initialMessages={savedMessages}
/>
```

## API endpoint contract

The component makes `POST` requests to `apiUrl` with the following body:

```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "previousResponseId": "resp_abc123"
}
```

When `extraRequestParams` or `onBeforeSend` are used, additional fields are merged into the body.

When the user attaches images, the last user message uses multipart content instead of a plain string:

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What is wrong with this screenshot?"},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
      ]
    }
  ]
}
```

The endpoint must return a Server-Sent Events stream of OpenAI Responses API events (`response.output_text.delta`, `response.output_item.done`, etc.). Each event line must be formatted as:

```
data: {"type":"response.output_text.delta","delta":"Hello"}
```

## Props

| Prop                            | Type                                                                                       | Required | Default       | Description                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| `apiUrl`                        | `string`                                                                                   | ✓        | -             | URL of the OpenAI-compatible streaming endpoint                                                           |
| `initialMessages`               | `TChatMessage[]`                                                                           | -        | `[]`          | Messages to pre-populate on mount                                                                         |
| `showHistory`                   | `boolean`                                                                                  | -        | `false`       | Enable multi-chat history panel                                                                           |
| `showNewChat`                   | `boolean`                                                                                  | -        | `showHistory` | Show new chat button in the header                                                                        |
| `systemPrompt`                  | `string`                                                                                   | -        | -             | System instruction sent with every request                                                                |
| `requestInit`                   | `Omit<RequestInit, 'body' \| 'method' \| 'signal'>`                                        | -        | -             | Additional fetch options (e.g., `headers`)                                                                |
| `extraRequestParams`            | `Record<string, unknown>`                                                                  | -        | -             | Extra fields merged into the request body on every send (e.g., `assistantId`, `promptVariables`)          |
| `onBeforeSend`                  | `(params: {content: string}) => Promise<Record<string, unknown> \| false \| null \| void>` | -        | -             | Called before each request. Return an object to merge into the body, or `false`/`null` to cancel the send |
| `welcomeConfig`                 | `WelcomeConfig`                                                                            | -        | -             | Welcome screen configuration                                                                              |
| `i18nConfig`                    | `ChatContainerI18nConfig`                                                                  | -        | -             | Text label overrides                                                                                      |
| `showActionsOnHover`            | `boolean`                                                                                  | -        | `false`       | Show message copy/like actions on hover                                                                   |
| `promptInputProps`              | `Partial<PromptInputProps>`                                                                | -        | -             | Props passed to the prompt input                                                                          |
| `messageListConfig`             | `MessageListConfig`                                                                        | -        | -             | MessageList configuration                                                                                 |
| `contextItems`                  | `ContextItemConfig[]`                                                                      | -        | -             | Context items shown in prompt header                                                                      |
| `showContextIndicator`          | `boolean`                                                                                  | -        | -             | Show context indicator in prompt header                                                                   |
| `contextIndicatorProps`         | `ContextIndicatorProps`                                                                    | -        | -             | Context indicator customization                                                                           |
| `transformOptions`              | `OptionsType`                                                                              | -        | -             | Markdown transform options                                                                                |
| `shouldParseIncompleteMarkdown` | `boolean`                                                                                  | -        | -             | Parse incomplete markdown during streaming                                                                |
| `headerProps`                   | `Partial<HeaderProps>`                                                                     | -        | -             | Props override for the Header component                                                                   |
| `contentProps`                  | `Partial<ChatContentProps>`                                                                | -        | -             | Props override for the ChatContent component                                                              |
| `emptyContainerProps`           | `Partial<EmptyContainerProps>`                                                             | -        | -             | Props override for the welcome screen                                                                     |
| `disclaimerProps`               | `Partial<DisclaimerProps>`                                                                 | -        | -             | Props override for the Disclaimer component                                                               |
| `historyProps`                  | `Partial<HistoryProps>`                                                                    | -        | -             | Props override for the History component                                                                  |
| `showFolding`                   | `boolean`                                                                                  | -        | -             | Show fold/unfold button                                                                                   |
| `showClose`                     | `boolean`                                                                                  | -        | -             | Show close button                                                                                         |
| `onFold`                        | `(value: 'collapsed' \| 'opened') => void`                                                 | -        | -             | Fold/unfold callback                                                                                      |
| `onClose`                       | `() => void`                                                                               | -        | -             | Close button callback                                                                                     |
| `hideTitleOnEmptyChat`          | `boolean`                                                                                  | -        | `false`       | Hide header title when chat is empty                                                                      |
| `className`                     | `string`                                                                                   | -        | -             | Additional CSS class                                                                                      |
| `headerClassName`               | `string`                                                                                   | -        | -             | Additional CSS class for the header section                                                               |
| `contentClassName`              | `string`                                                                                   | -        | -             | Additional CSS class for the content section                                                              |
| `footerClassName`               | `string`                                                                                   | -        | -             | Additional CSS class for the footer section                                                               |
| `qa`                            | `string`                                                                                   | -        | -             | QA/test identifier                                                                                        |

## Managed state

The following `ChatContainer` props are managed internally and are not available on `AIStudioChat`:

| Prop            | Notes                                                          |
| --------------- | -------------------------------------------------------------- |
| `messages`      | Derived from streaming and committed state                     |
| `status`        | Derived from fetch + stream lifecycle                          |
| `error`         | Derived from `useOpenAIStreamAdapter`                          |
| `onSendMessage` | Makes a `POST` request to `apiUrl`                             |
| `onCancel`      | Aborts the in-flight request                                   |
| `onRetry`       | Re-sends the last user message (including any attached images) |
| `chats`         | Managed when `showHistory={true}`                              |
| `activeChat`    | Managed when `showHistory={true}`                              |
| `onSelectChat`  | Managed when `showHistory={true}`                              |
| `onCreateChat`  | Managed when `showHistory={true}`                              |
| `onDeleteChat`  | Managed when `showHistory={true}`                              |

## Styling

`AIStudioChat` renders `ChatContainer` directly. Refer to `ChatContainer` documentation for the full list of CSS variables. All `ChatContainer` styling props (`className`, `headerClassName`, `contentClassName`, `footerClassName`) are forwarded without modification.

## Implementation details

On every `onSendMessage` call the component:

1. Calls `onBeforeSend` (if provided) to resolve per-request params or cancel the send.
2. Converts any image files in `TSubmitData.attachments` to base64 data URLs via `FileReader`.
3. Appends the user message (with `images` field populated) to the local state — the message is immediately visible in the UI.
4. Sends a `POST` request to `apiUrl` with the full conversation. The last user turn uses multipart content when images are present. `extraRequestParams`, per-request params from `onBeforeSend`, and `previousResponseId` (tracked automatically) are merged into the body.
5. Passes the `Response` body to `useOpenAIStreamAdapter`, which parses SSE events and updates `displayMessages` in real time.
6. On stream completion, commits the final messages and clears the stream state. `previousResponseId` is updated from `streamResult.responseId` for the next request.
7. If `showHistory` is enabled and no active chat exists, a new chat is created automatically using the first message as its name.

On **retry**, the original user message text and stored `images` are re-sent without requiring the user to re-attach files.
