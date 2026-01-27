# ThinkingMessage

A message component that displays AI thinking process with collapsible content and a status indicator.

## Features

- **Expandable/Collapsible**: Click the button to toggle content visibility
- **Status Indicator**: Shows loader animation when status is "thinking"
- **Copy Action**: Optional copy button for completed thoughts with custom or default logic
- **Flexible Content**: Supports single string or array of content strings
- **Backward Compatible**: Supports both custom copy handlers and automatic copy functionality

## Usage

### Basic Usage

```tsx
import {ThinkingMessage} from '@gravity-ui/aikit';

<ThinkingMessage
  content={[
    'Analyzing your request and considering different approaches.',
    'Evaluating the best solution based on your requirements.',
  ]}
  status="thinking"
  defaultExpanded={true}
  showStatusIndicator={true}
/>;
```

### With Default Copy Functionality

```tsx
<ThinkingMessage
  content={['First thinking block', 'Second thinking block']}
  status="thought"
  enabledCopy={true} // Enables default copy logic
/>
```

When user clicks the copy button, the content will be copied as:

```
First thinking block

Second thinking block
```

### With Custom Copy Handler

```tsx
<ThinkingMessage
  content="Processing your request..."
  status="thought"
  onCopyClick={() => {
    // Custom copy logic
    navigator.clipboard.writeText('Custom text');
    showNotification('Copied!');
  }}
/>
```

### Single Content String

```tsx
<ThinkingMessage content="Processing your request..." status="thinking" />
```

## Props

| Prop                  | Type                      | Required | Default | Description                                                                                       |
| --------------------- | ------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `content`             | `string \| string[]`      | ✓        | -       | Thinking content as a string or array of strings                                                  |
| `status`              | `'thinking' \| 'thought'` | ✓        | -       | Current thinking status                                                                           |
| `defaultExpanded`     | `boolean`                 | -        | `true`  | Initial expanded state                                                                            |
| `showStatusIndicator` | `boolean`                 | -        | `true`  | Whether to show loader when status is "thinking"                                                  |
| `onCopyClick`         | `() => void`              | -        | -       | Custom copy handler. Takes priority over `enabledCopy`                                            |
| `enabledCopy`         | `boolean`                 | -        | `false` | Enable default copy functionality. Content is copied as-is (string) or joined with `\n\n` (array) |
| `className`           | `string`                  | -        | -       | Additional CSS class name                                                                         |
| `qa`                  | `string`                  | -        | -       | Data QA attribute for testing                                                                     |
| `style`               | `React.CSSProperties`     | -        | -       | Inline styles                                                                                     |

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

The copy button appears when status is `'thought'` (completed) and either `onCopyClick` or `enabledCopy` is provided.

**Priority:**

1. If `onCopyClick` is provided, it will be used (custom logic)
2. If `enabledCopy={true}`, default copy logic will be used
3. If neither is provided, no copy button is shown

**Default Copy Logic:**

- For string content: copies the string as-is
- For array content: joins items with double newline (`\n\n`)

This matches the visual display format where each array item appears as a separate paragraph.

## CSS Variables

The component uses the following CSS variables for styling, which can be customized via inline styles or CSS:

### Spacing

| Variable        | Default Usage | Description                       |
| --------------- | ------------- | --------------------------------- |
| `--g-spacing-1` | `4px`         | Vertical padding (top and bottom) |
| `--g-spacing-2` | `8px`         | Gap between buttons and content   |
| `--g-spacing-4` | `16px`        | Left padding                      |
| `--g-spacing-6` | `24px`        | Gap between content items         |

### Colors

| Variable                       | Description        |
| ------------------------------ | ------------------ |
| `--g-color-line-generic`       | Left border color  |
| `--g-color-text-complementary` | Content text color |

### Typography

| Variable                      | Description         |
| ----------------------------- | ------------------- |
| `--g-text-body-1-font-size`   | Content font size   |
| `--g-text-body-font-weight`   | Content font weight |
| `--g-text-body-1-line-height` | Content line height |
