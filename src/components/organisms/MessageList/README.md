# MessageList

Component for displaying a list of messages. Supports custom message renderers through MessageRendererRegistry.

## Features

- **Automatic Rendering**: Automatically renders appropriate component based on message type
- **Type Support**: Supports user messages and assistant messages with various content types
- **Extensible**: Supports custom message renderers through MessageRendererRegistry
- **Customizable**: Supports custom className, QA attributes, and display options

## Usage

### Basic Usage

```tsx
import {MessageList} from '@/components/organisms';
import type {TMessage} from '@/types/messages';

const messages: TMessage[] = [
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
  type MessagePartComponentProps,
} from '@/utils/messageTypeRegistry';
import type {TAssistantMessage, TBaseMessagePart} from '@/types/messages';

interface ChartMessagePartData {
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

type ChartMessagePart = TBaseMessagePart<ChartMessagePartData> & {
  type: 'chart';
};

const ChartMessageView: React.FC<MessagePartComponentProps<ChartMessagePart>> = ({part}) => {
  const {chartData, chartType} = part.data;
  return (
    <div className="chart-message">
      <Chart data={chartData} type={chartType} />
    </div>
  );
};

const customMessageRenderers: MessageRendererRegistry = createMessageRendererRegistry();
registerMessageRenderer<ChartMessagePart>(customMessageRenderers, 'chart', {
  component: ChartMessageView,
});

const chartMessage: TAssistantMessage = {
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

<MessageList messages={[chartMessage]} messageRendererRegistry={customMessageRenderers} />;
```

## Props

| Prop                      | Type                      | Required | Default | Description                      |
| ------------------------- | ------------------------- | -------- | ------- | -------------------------------- |
| `messages`                | `TMessage[]`              | ✓        | -       | Array of messages to render      |
| `messageRendererRegistry` | `MessageRendererRegistry` | -        | -       | Custom message renderer registry |
| `showActionsOnHover`      | `boolean`                 | -        | -       | Show message actions on hover    |
| `showTimestamp`           | `boolean`                 | -        | -       | Show message timestamp           |
| `showAvatar`              | `boolean`                 | -        | -       | Show avatar for user messages    |
| `className`               | `string`                  | -        | -       | Additional CSS class             |
| `qa`                      | `string`                  | -        | -       | QA/test identifier               |

## Message Types

### TMessage

`TMessage` is a union type that can be either `TUserMessage` or `TAssistantMessage`:

```tsx
type TMessage = TUserMessage | TAssistantMessage;
```

### TUserMessage

User message with text content:

```tsx
type TUserMessage = {
  id?: string;
  role: 'user';
  content: string;
  format?: 'plain' | 'markdown';
  avatarUrl?: string;
  actions?: Array<{
    type: BaseMessageAction | string;
    onClick: () => void;
    icon?: IconData;
  }>;
  timestamp?: string;
  status?: 'sending' | 'complete' | 'error' | 'streaming';
  error?: unknown;
  metadata?: Record<string, unknown>;
};
```

### TAssistantMessage

Assistant message with flexible content:

```tsx
type TAssistantMessage = {
  id?: string;
  role: 'assistant';
  content: string | TMessagePart | TMessagePart[];
  actions?: Array<{
    type: BaseMessageAction | string;
    onClick: () => void;
    icon?: IconData;
  }>;
  timestamp?: string;
  status?: 'sending' | 'complete' | 'error' | 'streaming';
  error?: unknown;
  metadata?: Record<string, unknown>;
};
```

### TMessagePart

Message part can be one of the following types:

- **TextMessagePart**: Text content with markdown support
- **ThinkingMessagePart**: Thinking process with steps
- **ToolMessagePart**: Tool execution result
- **TBaseMessagePart**: Custom message part with any data

```tsx
type TextMessagePart = {
  id?: string;
  type: 'text';
  data: {
    text: string;
  };
};

type ThinkingMessagePart = {
  id?: string;
  type: 'thinking';
  data: {
    title?: string;
    content: string;
    steps?: Array<{
      id: string;
      text: string;
      status: 'pending' | 'running' | 'completed' | 'error';
    }>;
  };
};

type ToolMessagePart = {
  id?: string;
  type: 'tool';
  data: ToolMessageProps;
};
```
