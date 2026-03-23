# Loader

A Loader visualizes loading state

## Features

- **Two View Modes**: Supports `streaming` (animated dots) and `loading` (circle spinner) views
- **Multiple Sizes**: Supports three sizes — `xs`, `s` (default), and `m`
- **Animated**: Dots pulse in sequence using CSS animations to indicate an active loading state

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

| Variable                   | Description                 |
| -------------------------- | --------------------------- |
| `--g-color-text-secondary` | Color of the streaming dots |
| `--g-spacing-1`            | Gap between streaming dots  |
