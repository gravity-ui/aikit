# ButtonGroup

Wrapper for buttons group

## Features

- **Two Orientation Modes**: Supports `horizontal` (default) and `vertical` layouts
- **Flexible Wrapping**: Buttons wrap to the next line when there is not enough horizontal space
- **Composable**: Accepts any number of child components

## Usage

```tsx
import {ButtonGroup} from '@/components/molecules/ButtonGroup';

// Horizontal orientation
<ButtonGroup><Button>Button 1</Button><Button>Button 1</Button></ButtonGroup>

// Vertical orientation
<ButtonGroup orientation="vertical"><Button>Button 1</Button><Button>Button 1</Button></ButtonGroup>
```

## Props

| Prop          | Type                         | Required | Default        | Description            |
| ------------- | ---------------------------- | -------- | -------------- | ---------------------- |
| `children`    | `React.ReactNode[]`          | ✓        | -              | Buttons for render     |
| `orientation` | `'horizontal' \| 'vertical'` | -        | `'horizontal'` | Orientation of buttons |
| `className`   | `string`                     | -        | -              | Additional CSS class   |
| `qa`          | `string`                     | -        | -              | QA/test identifier     |

## Styling

The component uses CSS variables for theming:

| Variable        | Description         |
| --------------- | ------------------- |
| `--g-spacing-1` | Gap between buttons |
