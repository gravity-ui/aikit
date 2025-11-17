# AssistantMessage

Component for rendering assistant messages with support for multiple message parts and custom renderers. Built on top of `BaseMessage` component with assistant variant styling.

## Features

- Support for simple text messages (string content)
- Support for structured message parts (text, tool, thinking, etc.)
- Support for multiple message parts in a single message
- Customizable message renderer registry (merges with default registry)
- Markdown rendering support via `MarkdownRenderer`
- Action buttons support (copy, edit, like, etc.)
- Timestamp display support

## Usage

```tsx
import {AssistantMessage} from '@/components/organisms/AssistantMessage';

// Simple text message
<AssistantMessage content="Hello! How can I help you?" />;

// Message with text part
<AssistantMessage
  content={{
    type: 'text',
    data: {
      text: 'This is a **markdown** message.',
    },
  }}
/>;

// Message with multiple parts
<AssistantMessage
  content={[
    {
      type: 'text',
      data: {
        text: 'First part.',
      },
    },
    {
      type: 'tool',
      data: {
        toolName: 'Writing',
        status: 'success',
      },
    },
  ]}
/>;

// With actions
const actions = [
  {type: 'copy', onClick: () => console.log('Copy')},
  {type: 'like', onClick: () => console.log('Like')},
];

<AssistantMessage content="Hello!" actions={actions} showActionsOnHover />;

// With custom renderer registry
import {createMessageRendererRegistry, registerMessageRenderer} from '@/utils/messageTypeRegistry';

const customRegistry = createMessageRendererRegistry();
registerMessageRenderer(customRegistry, 'custom', {
  component: ({part}) => <div>Custom: {part.data}</div>,
});

<AssistantMessage content="Hello!" messageRendererRegistry={customRegistry} />;
```

## Props

| Prop                      | Type                                     | Required | Default | Description                                                                                |
| ------------------------- | ---------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `content`                 | `string \| MessagePart \| MessagePart[]` | ✓        | -       | Message content                                                                            |
| `id`                      | `string`                                 | -        | -       | Message ID (used for generating part keys)                                                 |
| `actions`                 | `Array<Action>`                          | -        | -       | Array of action buttons (copy, edit, like, etc.)                                           |
| `timestamp`               | `string`                                 | -        | -       | Timestamp string                                                                           |
| `messageRendererRegistry` | `MessageRendererRegistry`                | -        | -       | Custom message renderer registry (merged with default registry)                            |
| `transformOptions`        | `OptionsType`                            | -        | -       | Options from [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package |
| `showActionsOnHover`      | `boolean`                                | -        | -       | Show action buttons on hover                                                               |
| `showTimestamp`           | `boolean`                                | -        | -       | Show timestamp in actions area                                                             |
| `className`               | `string`                                 | -        | -       | Additional CSS class                                                                       |
| `qa`                      | `string`                                 | -        | -       | QA/test identifier                                                                         |

### Action Type

```tsx
type Action = {
  type: BaseMessageAction | string;
  onClick: () => void;
  icon?: IconData;
};
```

Available `BaseMessageAction` values: `'copy'`, `'edit'`, `'retry'`, `'like'`, `'unlike'`, `'delete'`

## Message Content Types

The component supports different content formats:

1. **String**: Simple text content that will be converted to a text part

   ```tsx
   content: 'Hello world';
   ```

2. **Single Part**: A single message part object

   ```tsx
   content: {
       type: 'text',
       data: { text: 'Hello world' }
   }
   ```

3. **Multiple Parts**: An array of message parts
   ```tsx
   content: [
     {type: 'text', data: {text: 'First'}},
     {type: 'text', data: {text: 'Second'}},
   ];
   ```

## Default Message Parts

The component includes default renderers for:

- **text**: Renders markdown content using `MarkdownRenderer` component
- **tool**: Renders tool messages using `ToolMessage` component

## Custom Message Parts

You can register custom message part renderers. Custom registries are merged with the default registry, so custom renderers can override default ones:

```tsx
import {
  createMessageRendererRegistry,
  registerMessageRenderer,
  type MessagePartComponentProps,
} from '@/utils/messageTypeRegistry';
import type {BaseMessagePart} from '@/types/messages';

interface CustomData {
  title: string;
  description: string;
}

type CustomMessagePart = BaseMessagePart<CustomData> & {
  type: 'custom';
};

const CustomRenderer: React.FC<MessagePartComponentProps<CustomMessagePart>> = ({part}) => {
  return (
    <div>
      <h3>{part.data.title}</h3>
      <p>{part.data.description}</p>
    </div>
  );
};

const registry = createMessageRendererRegistry();
registerMessageRenderer<CustomMessagePart>(registry, 'custom', {
  component: CustomRenderer,
});

<AssistantMessage
  content={{
    type: 'custom',
    data: {
      title: 'Custom Title',
      description: 'Custom Description',
    },
  }}
  messageRendererRegistry={registry}
/>;
```
