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
import type {TAssistantMessage, TMessageMetadata, TMessagePart} from '@/types/messages';

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

type ChartMessagePart = TMessagePart<'chart', ChartMessagePartData>;

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

const chartMessage: TAssistantMessage<TMessageMetadata, ChartMessagePart> = {
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

<MessageList<ChartMessagePart>
  messages={[chartMessage]}
  messageRendererRegistry={customMessageRenderers}
/>;
```

## Props

| Prop                      | Type                                                             | Required | Default | Description                                                                                |
| ------------------------- | ---------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `messages`                | [TMessage[]](../../../types/messages.ts)                         | ✓        | -       | Array of messages to render                                                                |
| `messageRendererRegistry` | [MessageRendererRegistry](../../../utils/messageTypeRegistry.ts) | -        | -       | Custom message renderer registry                                                           |
| `transformOptions`        | `OptionsType`                                                    | -        | -       | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package |
| `showActionsOnHover`      | `boolean`                                                        | -        | -       | Show message actions on hover                                                              |
| `showTimestamp`           | `boolean`                                                        | -        | -       | Show message timestamp                                                                     |
| `showAvatar`              | `boolean`                                                        | -        | -       | Show avatar for user messages                                                              |
| `className`               | `string`                                                         | -        | -       | Additional CSS class                                                                       |
| `qa`                      | `string`                                                         | -        | -       | QA/test identifier                                                                         |
