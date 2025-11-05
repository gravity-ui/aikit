# ButtonGroup

Wrapper for buttons group

## Features

- **Two Orientation Modes**:
  - `horizontal`
  - `vertical`
- **Different Spacing Modes**:
  - `xs`
  - `s`
  - `m`

## Usage

```tsx
import {ButtonGroup} from '@/components/molecules/ButtonGroup';

// Horizontal orientation
<ButtonGroup><Button>Button 1</Button><Button>Button 1</Button></ButtonGroup>

// Vertical orientation
<ButtonGroup orientation="vertical"><Button>Button 1</Button><Button>Button 1</Button></ButtonGroup>

// Different sizes
<ButtonGroup size='xs'></ButtonGroup>
<ButtonGroup size='s'></ButtonGroup>
<ButtonGroup size='m'></ButtonGroup>

```

## Props

| Prop          | Type                         | Required | Default        | Description             |
| ------------- | ---------------------------- | -------- | -------------- | ----------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | -        | `'horizontal'` | Orientation of buttons  |
| `size`        | `'xs' \| 's'\| 'm'`          | -        | `'s'`          | Spacing between buttons |
| `children`    | `React.ReactNode[]`          | ✓        | -              | Spacing between buttons |
| `className`   | `string`                     | -        | -              | Additional CSS class    |
| `qa`          | `string`                     | -        | -              | QA/test identifier      |

## Styling

The component uses CSS variables for theming:

### Spacing

```css
    --g-spacing-1 /* Spacing between buttons */
    --g-spacing-2 /* Spacing between buttons */
    --g-spacing-3 /* Spacing between buttons */
```
