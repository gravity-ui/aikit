# PromptInputHeader

A header component for prompt input that displays context items, context indicator, or custom content.

## Features

- **Context Items**: Display removable context items (files, selections, etc.) on the left side
- **Context Indicator**: Optional display of context usage with percentage or number format on the right side
- **Combined Layout**: Show both context items and context indicator simultaneously
- **Custom Content**: Replace default header with any custom React content
- **Flexible Layout**: Automatically adjusts to content type

## Usage

```tsx
import {PromptInputHeader} from '@gravity-ui/aikit';

// With context items
<PromptInputHeader
  contextItems={[
    {
      id: '1',
      content: 'file.tsx',
      onRemove: () => console.log('Remove file.tsx'),
    },
    {
      id: '2',
      content: 'component.tsx',
      onRemove: () => console.log('Remove component.tsx'),
    },
  ]}
/>

// With context items and indicator
<PromptInputHeader
  contextItems={[
    {id: '1', content: 'README.md', onRemove: () => {}},
  ]}
  showContextIndicator={true}
  contextIndicatorProps={{
    type: 'percent',
    usedContext: 75,
  }}
/>

// With context indicator only
<PromptInputHeader
  showContextIndicator={true}
  contextIndicatorProps={{
    type: 'percent',
    usedContext: 24,
  }}
/>

// With number-based context indicator
<PromptInputHeader
  showContextIndicator={true}
  contextIndicatorProps={{
    type: 'number',
    usedContext: 2400,
    maxContext: 10000,
  }}
/>

// With custom content
<PromptInputHeader>
  <div>Custom header content</div>
</PromptInputHeader>
```

## Props

| Prop                    | Type                    | Required | Default | Description                                   |
| ----------------------- | ----------------------- | -------- | ------- | --------------------------------------------- |
| `contextItems`          | `ContextItemConfig[]`   | -        | `[]`    | Array of context items to display on the left |
| `showContextIndicator`  | `boolean`               | -        | `false` | Show context indicator on the right           |
| `contextIndicatorProps` | `ContextIndicatorProps` | -        | -       | Props for the context indicator               |
| `children`              | `ReactNode`             | -        | -       | Custom content to replace the default header  |
| `className`             | `string`                | -        | -       | Additional CSS class                          |
| `qa`                    | `string`                | -        | -       | QA/test identifier                            |

### ContextItemConfig

| Property   | Type         | Required | Description                            |
| ---------- | ------------ | -------- | -------------------------------------- |
| `id`       | `string`     | ✓        | Unique identifier for the context item |
| `content`  | `ReactNode`  | ✓        | Content to display in the context item |
| `onRemove` | `() => void` | ✓        | Callback when context item is removed  |

## Layout

The component uses a flexible layout with the following behavior:

- **Context items** are positioned on the left and wrap if they don't fit
- **Context indicator** is positioned on the right and never wraps
- When both are present, they are separated with a gap and aligned properly
- If only one is present, it takes its natural position

## Styling

The component uses CSS variables for theming:

| Variable        | Description                     |
| --------------- | ------------------------------- |
| `--g-spacing-1` | Gap between context items       |
| `--g-spacing-2` | Gap between items and indicator |
