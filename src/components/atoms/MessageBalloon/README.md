# MessageBalloon

Visual wrapper for user's message

## Features

- **Visual**: Render message from user
- **Theming**: Uses custom CSS variables with fallbacks to Gravity UI tokens

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

### Background

```css
--g-color-base-info-light  /* Background for user message*/
```

### Gaps

```css
--g-spacing-2  /* Gap between message and border */
--g-spacing-3  /* Gap between message and border */
```
