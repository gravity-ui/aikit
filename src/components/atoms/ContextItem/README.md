# ContextItem

A compact component that displays diff statistics showing the number of added and deleted lines.

## Features

- **Visual Indicators**: Displays added and deleted line counts side by side
- **Sign Prefixes**: Automatically adds `+` for added lines and `-` for deleted lines (only when count > 0)
- **Color Coding**: Green for additions, red for deletions
- **Code Font**: Uses monospace font suitable for code contexts

## Usage

```tsx
import {ContextItem} from '@/components/atoms/ContextItem';

// Basic usage
<ContextItem> onClick={handleRemoveContext}My Context</ContextItem>;
```

## Props

| Prop        | Type              | Required | Default | Description          |
| ----------- | ----------------- | -------- | ------- | -------------------- |
| `content`   | `React.ReactNode` | ✓        | -       | Content of label     |
| `className` | `string`          | -        | -       | Additional CSS class |
| `style`     | `CSSProperties`   | -        | -       | Inline styles        |
| `qa`        | `string`          | -        | -       | QA/test identifier   |
