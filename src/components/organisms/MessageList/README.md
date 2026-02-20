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

| Prop                      | Type                                                             | Required | Default         | Description                                                                                                 |
| ------------------------- | ---------------------------------------------------------------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `messages`                | [TChatMessage[]](../../../types/messages.ts)                     | ✓        | -               | Array of messages to render                                                                                 |
| `status`                  | `ChatStatus`                                                     | -        | -               | Current chat status: `'submitted'` \| `'streaming'` \| `'ready'` \| `'error'`                               |
| `errorMessage`            | `AlertProps`                                                     | -        | -               | Error message to display when status is `'error'`                                                           |
| `onRetry`                 | `() => void`                                                     | -        | -               | Callback when user clicks retry button in error state                                                       |
| `messageRendererRegistry` | [MessageRendererRegistry](../../../utils/messageTypeRegistry.ts) | -        | -               | Custom message renderer registry                                                                            |
| `transformOptions`        | `OptionsType`                                                    | -        | -               | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package                  |
| `showActionsOnHover`      | `boolean`                                                        | -        | -               | Show message actions on hover                                                                               |
| `showTimestamp`           | `boolean`                                                        | -        | -               | Show message timestamp                                                                                      |
| `showAvatar`              | `boolean`                                                        | -        | -               | Show avatar for user messages                                                                               |
| `userActions`             | `DefaultMessageAction<TUserMessage>[]`                           | -        | -               | Array of default actions for user messages. Each action's onClick receives the message as a parameter.      |
| `assistantActions`        | `DefaultMessageAction<TAssistantMessage>[]`                      | -        | -               | Array of default actions for assistant messages. Each action's onClick receives the message as a parameter. |
| `loaderStatuses`          | `ChatStatus[]`                                                   | -        | `['submitted']` | Array of chat statuses that should display the loader                                                       |
| `className`               | `string`                                                         | -        | -               | Additional CSS class                                                                                        |
| `qa`                      | `string`                                                         | -        | -               | QA/test identifier                                                                                          |
