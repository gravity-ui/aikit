# BaseMessage

Base wrapper for message with support rendering buttons group

## Features

- **Different type of messages**: Support different alignment for different types of messages
- **Support group of buttons**: Support rendering default and custom group of buttons

## Usage

```tsx
import {BaseMessage} from '@/components/molecules/BaseMessage';

// Different type of messages
<BaseMessage type="user">My message</BaseMessage>;
<BaseMessage type="assistant">My message</BaseMessage>;
<BaseMessage type="system">My message</BaseMessage>;

// Group of buttons
<BaseMessage type="user" actions={[{type: 'edit', , onClick: '() => ({})'}]}>
  My message
</BaseMessage>;
```

## Props

| Prop                 | Type                                | Required | Default | Description                                |
| -------------------- | ----------------------------------- | -------- | ------- | ------------------------------------------ |
| `children`           | `React.ReactNode`                   | ✓        | -       | Message                                    |
| `variant`            | `'user' \| 'assistant' \| 'system'` | ✓        | -       | Type of message                            |
| `showActionsOnHover` | `boolean`                           | -        | false   | Should actions be always shown or on hover |
| `actions`            | ``                                  | -        | -       | Buttons array                              |
| `className`          | `string`                            | -        | -       | Additional CSS class                       |
| `qa`                 | `string`                            | -        | -       | QA/test identifier                         |

## Styling

The component uses CSS variables for theming:

### Spacing

```css
    --g-spacing-1 /* Gap between message and buttons */
```
