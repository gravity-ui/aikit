# ContextItem

A label for rendering context

## Features

- Has a callback to remove a context

## Usage

```tsx
import {ContextItem} from '@/components/atoms/ContextItem';

// Basic usage
<ContextItem onClick={handleRemoveContext}>My Context</ContextItem>;
```

## Props

| Prop        | Type                 | Required | Default                     | Description                                                                          |
| ----------- | -------------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `content`   | `React.ReactNode`    | ✓        | -                           | Content of label                                                                     |
| `onClick`   | `() => void`         | ✓        | -                           | Callback use exactly for close/remove contextItem                                    |
| `size`      | `LabelProps['size']` | -        | `'s'` desktop, `'m'` mobile | Size of the label; an explicit value also opts out of the mobile `body-2` typography |
| `className` | `string`             | -        | -                           | Additional CSS class                                                                 |
| `style`     | `CSSProperties`      | -        | -                           | Inline styles                                                                        |
| `qa`        | `string`             | -        | -                           | QA/test identifier                                                                   |
