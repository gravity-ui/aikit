# MessageBalloon

Visual wrapper for user's message

## Features

- **Visual Wrapper**: Renders user message content with a styled balloon appearance
- **Content Support**: Accepts any ReactNode as children
- **Theming**: Background color and padding are customizable via CSS variables

## Usage

```tsx
import {MessageBalloon} from '@/components/atoms/MessageBalloon';

// User message
<MessageBalloon>User question</MessageBalloon>;
```

## Props

| Prop        | Type              | Required | Default | Description          |
| ----------- | ----------------- | -------- | ------- | -------------------- |
| `children`  | `React.ReactNode` | ✓        | -       | Content of message   |
| `className` | `string`          | -        | -       | Additional CSS class |
| `qa`        | `string`          | -        | -       | QA/test identifier   |

## Styling

The component uses CSS variables for theming:

| Variable                    | Description                             |
| --------------------------- | --------------------------------------- |
| `--g-color-base-info-light` | Background color of the message balloon |
| `--g-spacing-2`             | Vertical padding                        |
| `--g-spacing-3`             | Horizontal padding and border radius    |
