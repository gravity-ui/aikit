# ThinkingMessage

A message component that displays AI thinking process with collapsible content and a status indicator.

## Features

- **Expandable/Collapsible**: Click the button to toggle content visibility
- **Status Indicator**: Shows loader animation when status is "thinking"
- **Copy Action**: Optional copy button for completed thoughts
- **Flexible Content**: Supports single string or array of content strings

## Usage

```tsx
import {ThinkingMessage} from '@/components/organisms/ThinkingMessage';

<ThinkingMessage
  type="thinking"
  data={{
    content: [
      'Analyzing your request and considering different approaches.',
      'Evaluating the best solution based on your requirements.',
    ],
    status: 'thinking',
  }}
  defaultExpanded={true}
  showStatusIndicator={true}
  onCopyClick={() => console.log('Copied!')}
/>;
```

### Single Content String

```tsx
<ThinkingMessage
  type="thinking"
  data={{
    content: 'Processing your request...',
    status: 'thinking',
  }}
/>
```

## Props

| Prop                  | Type                  | Required | Default | Description                                             |
| --------------------- | --------------------- | -------- | ------- | ------------------------------------------------------- |
| `type`                | `'thinking'`          | ✓        | -       | Message type identifier                                 |
| `data`                | `ThinkingMessageData` | ✓        | -       | The thinking message data containing content and status |
| `defaultExpanded`     | `boolean`             | -        | `true`  | Initial expanded state                                  |
| `showStatusIndicator` | `boolean`             | -        | `true`  | Whether to show loader when status is "thinking"        |
| `onCopyClick`         | `() => void`          | -        | -       | Callback when copy button is clicked                    |
| `className`           | `string`              | -        | -       | Additional CSS class name                               |
| `qa`                  | `string`              | -        | -       | Data QA attribute for testing                           |
| `style`               | `React.CSSProperties` | -        | -       | Inline styles                                           |

## ThinkingMessageData Type

```typescript
type ThinkingMessageData = {
  content: string | string[];
  status: 'thinking' | 'thought';
};
```

### Status Values

- **thinking**: Active thinking process - shows loader animation and "Thinking" button label
- **thought**: Completed thought - shows copy button and "Thought" button label

## Behavior

### Expand/Collapse

- Click the button to toggle content visibility
- Button label changes based on status: "Thinking" or "Thought"
- Button icon shows chevron down (collapsed) or up (expanded)
- Content is expanded by default (`defaultExpanded={true}`)

### Status Indicator

When `status` is `'thinking'` and `showStatusIndicator` is `true`, a loader animation is displayed next to the button, indicating the AI is actively processing.

### Copy Action

When `onCopyClick` is provided and status is `'thought'` (completed), a copy button appears allowing users to copy the thinking content to clipboard.
