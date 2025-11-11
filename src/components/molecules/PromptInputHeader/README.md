# PromptInputHeader

A header component for prompt input that displays a context indicator or custom content.

## Features

- **Context Indicator**: Optional display of context usage with percentage or number format
- **Custom Content**: Replace default header with any custom React content
- **Flexible Layout**: Automatically adjusts to content type

## Usage

```tsx
import {PromptInputHeader} from '@gravity-ui/aikit';

// With context indicator
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

| Prop                    | Type                    | Required | Default | Description                                  |
| ----------------------- | ----------------------- | -------- | ------- | -------------------------------------------- |
| `showContextIndicator`  | `boolean`               | -        | `false` | Show context indicator                       |
| `contextIndicatorProps` | `ContextIndicatorProps` | -        | -       | Props for the context indicator              |
| `children`              | `ReactNode`             | -        | -       | Custom content to replace the default header |
| `className`             | `string`                | -        | -       | Additional CSS class                         |
| `qa`                    | `string`                | -        | -       | QA/test identifier                           |

## Styling

The component uses CSS variables for theming:

| Variable        | Description                 |
| --------------- | --------------------------- |
| `--g-spacing-1` | Gap between header elements |
