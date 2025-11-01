# Loader

A Loader visualizes loading state

## Features

- **Visual loading state**: Show loading state
- **Two View Modes**:
  - `streaming`: Dots loader
  - `loading`: Circle loader

## Usage

```tsx
import {Loader} from '@/components/atoms/Loader';

// Streaming view
<Loader />

// Loading view
<Loader view="loading"/>

// Different sizes
<Loader size="xs"/>
<Loader size="s"/>
<Loader size="m"/>

```

## Props

| Prop        | Type                       | Required | Default       | Description          |
| ----------- | -------------------------- | -------- | ------------- | -------------------- |
| `view`      | `'streaming' \| 'loading'` | -        | `'streaming'` | View                 |
| `size`      | `'xs' \| 's'\| 'm'`        | -        | `'s'`         | Size of element      |
| `className` | `string`                   | -        | -             | Additional CSS class |
| `qa`        | `string`                   | -        | -             | QA/test identifier   |

## Styling

The component uses CSS variables for theming:

### Background

```css
    --g-aikit-color-bg-loader  /* Loading circle background */
    --g-color-text-secondary   /* Streaming dots background */
    --g-spacing-1 /* Streaming dots gap */
```
