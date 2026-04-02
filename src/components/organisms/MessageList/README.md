# MessageList

Component for displaying a list of messages. Supports custom message renderers through MessageRendererRegistry.

## Features

- **Automatic Rendering**: Automatically renders appropriate component based on message type
- **Type Support**: Supports user messages and assistant messages with various content types
- **Extensible**: Supports custom message renderers through MessageRendererRegistry
- **Customizable**: Supports custom className, QA attributes, and display options
- **Smart Action Filtering**: Automatically excludes assistantActions for thinking messages
- **User rating**: `userRating` on assistant messages sets filled state of like/unlike icons

## Usage

### Basic Usage

```tsx
import {MessageList} from '@/components/organisms';
import type {TChatMessage} from '@/types/messages';

const messages: TChatMessage[] = [
  {
    id: '1',
    role: 'user',
    timestamp: '2024-01-01T00:00:00Z',
    content: 'Hello!',
  },
  {
    id: '2',
    role: 'assistant',
    timestamp: '2024-01-01T00:01:00Z',
    content: 'Hi there!',
    userRating: 'like', // optional: 'like' | 'dislike' — affects like/unlike button icons
  },
];

<MessageList messages={messages} />;
```

### With Custom Message Types

```tsx
import {MessageList} from '@/components/organisms';
import {
  createMessageRendererRegistry,
  registerMessageRenderer,
  type MessageRendererRegistry,
  type MessageContentComponentProps,
} from '@/utils/messageTypeRegistry';
import type {TAssistantMessage, TMessageMetadata, TMessageContent} from '@/types/messages';

interface ChartMessageContentData {
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color?: string;
    }>;
  };
  chartType: 'line' | 'bar' | 'pie';
}

type ChartMessageContent = TMessageContent<'chart', ChartMessageContentData>;

const ChartMessageView: React.FC<MessageContentComponentProps<ChartMessageContent>> = ({part}) => {
  const {chartData, chartType} = part.data;
  return (
    <div className="chart-message">
      <Chart data={chartData} type={chartType} />
    </div>
  );
};

const customMessageRenderers: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartMessageContent>(customMessageRenderers, 'chart', {
  component: ChartMessageView,
});

const chartMessage: TAssistantMessage<ChartMessageContent, TMessageMetadata> = {
  id: 'msg-chart-1',
  role: 'assistant',
  timestamp: '2024-01-01T00:00:00Z',
  content: {
    id: 'part-1',
    type: 'chart',
    data: {
      chartData: {
        labels: ['Январь', 'Февраль', 'Март', 'Апрель'],
        datasets: [
          {
            label: 'Продажи',
            data: [12, 19, 3, 5],
            color: '#0077ff',
          },
        ],
      },
      chartType: 'bar',
    },
  },
};

<MessageList<ChartMessageContent>
  messages={[chartMessage]}
  messageRendererRegistry={customMessageRenderers}
/>;
```

### With Default Actions

```tsx
import {MessageList} from '@/components/organisms';
import type {TChatMessage, TUserMessage, TAssistantMessage} from '@/types/messages';
import {BaseMessageAction} from '@/components/molecules/BaseMessage';

const userActions = [
  {
    type: BaseMessageAction.Edit,
    onClick: (message: TUserMessage) => console.log('Edit message', message.id),
  },
  {
    type: BaseMessageAction.Delete,
    onClick: (message: TUserMessage) => console.log('Delete message', message.id),
  },
];

const assistantActions = [
  {
    type: BaseMessageAction.Copy,
    onClick: (message: TAssistantMessage) => console.log('Copy message', message.id),
  },
  {
    type: BaseMessageAction.Like,
    onClick: (message: TAssistantMessage) => console.log('Like message', message.id),
  },
];

<MessageList messages={messages} userActions={userActions} assistantActions={assistantActions} />;
```

**Note:** `assistantActions` will NOT be displayed for messages containing **only** thinking content (type: 'thinking'). For messages with mixed content (thinking + text), `assistantActions` will be shown and the copy action will copy the entire message content. This allows:

- ThinkingMessage copy button → copies only thinking text
- Toolbar copy button → copies entire message (thinking + text)

```tsx
// Example: assistantActions behavior based on message content
const messages = [
  {
    role: 'assistant',
    content: 'Regular text message', // assistantActions WILL be shown
  },
  {
    role: 'assistant',
    content: {
      type: 'thinking',
      data: {content: 'Thinking...', status: 'thought'}, // assistantActions will NOT be shown
    },
  },
  {
    role: 'assistant',
    content: [
      {type: 'thinking', data: {content: 'Thinking...', status: 'thought'}},
      {type: 'text', data: {text: 'Answer'}},
    ], // assistantActions WILL be shown (mixed content)
  },
];
```

### With Dynamic Action Content (render functions)

`children` in `DefaultMessageAction` accept a render function `(message) => ReactNode`, enabling dynamic button content based on message data.

Use `children` for text or composite content (e.g. badges). Use `icon` for SVG icon nodes. When both are provided, `children` takes precedence.

### With Extra Info

Use `assistantExtraInfo` / `userExtraInfo` to render contextual metadata alongside action buttons — for example, token count. These props accept a React component that receives `{message}` as a prop.

```tsx
type AssistantWithMeta = TAssistantMessage & {metadata?: {outputTokens?: number}};

// Renders token count next to action buttons.
// metadata.outputTokens is populated by useOpenAIStreamAdapter when trackTokenUsage: true.
const TokenCount = ({message}: {message: TAssistantMessage}) => {
  const tokens = (message as AssistantWithMeta).metadata?.outputTokens;
  return tokens != null ? <Text variant="caption-2">{tokens} tokens</Text> : null;
};

<MessageList
  messages={messages}
  assistantActions={assistantActions}
  assistantExtraInfo={TokenCount}
/>;
```

### With Action Popups

Actions can have associated popups that open when the action button is clicked. This is useful for collecting feedback, confirmations, or any additional information.

```tsx
import {MessageList, FeedbackForm} from '@gravity-ui/aikit';
import {ThumbsDown, ThumbsUp} from '@gravity-ui/icons';

const assistantActions = [
  {
    type: 'like',
    icon: <ThumbsUp />,
    onClick: (message) => {
      submitRating(message.id, 'like');
    },
  },
  {
    type: 'unlike',
    icon: <ThumbsDown />,
    onClick: (message) => {
      submitRating(message.id, 'dislike');
    },
    popup: {
      title: 'What went wrong?',
      placement: 'bottom-start',
      getContent: (message, {setContent, closePopup}) => {
        const handleSubmit = (reasons: string[], comment: string) => {
          // Submit feedback
          submitFeedback(message.id, reasons, comment);

          // Update popup content to show success
          setContent(
            <div style={{padding: '16px', textAlign: 'center'}}>
              <Text>Thank you for your feedback!</Text>
            </div>,
          );

          // Auto-close after 2 seconds
          setTimeout(closePopup, 2000);
        };

        return (
          <FeedbackForm
            options={[
              {id: 'no-answer', label: 'No answer'},
              {id: 'wrong-info', label: 'Wrong information'},
              {id: 'not-helpful', label: 'Not helpful'},
              {id: 'other', label: 'Other'},
            ]}
            onSubmit={handleSubmit}
            commentPlaceholder="Tell us more..."
            submitLabel="Submit"
          />
        );
      },
    },
  },
];

<MessageList
  messages={messages}
  assistantActions={assistantActions}
  actionPopupProps={{
    placement: 'bottom-start', // Default placement for all popups
    className: 'custom-popup',
  }}
/>;
```

**Popup Context API:**

The `getContent` function receives a context object with the following methods:

- `setContent(newContent: React.ReactNode)` — Update popup content without closing it (useful for form → success state transitions)
- `setTitle(title: string | undefined)` — Update popup title dynamically (pass `undefined` to hide)
- `setSubtitle(subtitle: string | undefined)` — Update popup subtitle dynamically (pass `undefined` to hide)
- `closePopup()` — Programmatically close the popup

**ActionPopup Configuration:**

```typescript
popup?: {
  getContent: (message, context) => React.ReactNode;  // Function that returns popup content
  title?: string;                                     // Optional popup title
  subtitle?: string;                                  // Optional popup subtitle
  placement?: PopupPlacement;                         // Popup placement (default: 'bottom-start')
}
```

**Global Popup Configuration:**

Use `actionPopupProps` to set global defaults for all action popups:

```typescript
actionPopupProps?: {
  title?: string;           // Override title for all popups
  subtitle?: string;        // Override subtitle for all popups
  placement?: PopupPlacement;  // Override placement for all popups
  className?: string;       // Additional CSS class for all popups
  qa?: string;              // QA/test identifier for all popups
}
```

### With Custom Loader Statuses

By default, the loader is displayed when `status` is `'submitted'`. You can customize which statuses show the loader:

```tsx
import {MessageList} from '@/components/organisms';

// Show loader for both 'submitted' and 'streaming' statuses
<MessageList messages={messages} status="streaming" loaderStatuses={['submitted', 'streaming']} />;

// Show loader only for 'ready' status (custom use case)
<MessageList messages={messages} status="ready" loaderStatuses={['ready']} />;

// Disable loader completely
<MessageList messages={messages} status="submitted" loaderStatuses={[]} />;
```

## Props

| Prop                            | Type                                                             | Required | Default                              | Description                                                                                                                                                |
| ------------------------------- | ---------------------------------------------------------------- | -------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages`                      | [TChatMessage[]](../../../types/messages.ts)                     | ✓        | -                                    | Array of messages to render                                                                                                                                |
| `status`                        | `ChatStatus`                                                     | -        | -                                    | Current chat status: `'submitted'` \| `'streaming'` \| `'streaming_loading'` \| `'ready'` \| `'error'`                                                     |
| `errorMessage`                  | `AlertProps`                                                     | -        | -                                    | Error message to display when status is `'error'`                                                                                                          |
| `onRetry`                       | `() => void`                                                     | -        | -                                    | Callback when user clicks retry button in error state                                                                                                      |
| `messageRendererRegistry`       | [MessageRendererRegistry](../../../utils/messageTypeRegistry.ts) | -        | -                                    | Custom message renderer registry                                                                                                                           |
| `transformOptions`              | `OptionsType`                                                    | -        | -                                    | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package                                                                 |
| `shouldParseIncompleteMarkdown` | `boolean`                                                        | -        | -                                    | Parse incomplete markdown (useful during streaming)                                                                                                        |
| `showActionsOnHover`            | `boolean`                                                        | -        | -                                    | Show message actions on hover                                                                                                                              |
| `showTimestamp`                 | `boolean`                                                        | -        | -                                    | Show message timestamp                                                                                                                                     |
| `showAvatar`                    | `boolean`                                                        | -        | -                                    | Show avatar for user messages                                                                                                                              |
| `userActions`                   | `DefaultMessageAction<TUserMessage>[]`                           | -        | -                                    | Array of default actions for user messages. `icon` and `children` accept render functions `(message) => ReactNode`. Actions can include popup config.      |
| `assistantActions`              | `DefaultMessageAction<TAssistantMessage>[]`                      | -        | -                                    | Array of default actions for assistant messages. `icon` and `children` accept render functions `(message) => ReactNode`. Actions can include popup config. |
| `userExtraInfo`                 | `React.ComponentType<{message: TUserMessage}>`                   | -        | -                                    | Component rendered alongside action buttons for each user message. Receives the full message object.                                                       |
| `assistantExtraInfo`            | `React.ComponentType<{message: TAssistantMessage}>`              | -        | -                                    | Component rendered alongside action buttons for each assistant message. Receives the full message object (e.g. for displaying token count from metadata).  |
| `loaderStatuses`                | `ChatStatus[]`                                                   | -        | `['submitted', 'streaming_loading']` | Array of chat statuses that should display the loader                                                                                                      |
| `ratingBlockProps`              | `RatingBlockProps`                                               | -        | -                                    | Rating block configuration (for CSAT or other feedback use cases) - renders after messages list                                                            |
| `actionPopupProps`              | `MessageListActionPopupConfig`                                   | -        | -                                    | Global configuration for action popups (title, subtitle, placement, className, qa)                                                                         |
| `hasPreviousMessages`           | `boolean`                                                        | -        | `false`                              | Whether there are older messages to load (shows scroll trigger with loader)                                                                                |
| `onLoadPreviousMessages`        | `() => void`                                                     | -        | -                                    | Callback to load previous messages when user scrolls to the top                                                                                            |
| `className`                     | `string`                                                         | -        | -                                    | Additional CSS class                                                                                                                                       |
| `qa`                            | `string`                                                         | -        | -                                    | QA/test identifier                                                                                                                                         |
