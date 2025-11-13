# UserMessage

Component for rendering user message

## Features

- Support render avatar of user
- Support rendering markdown
- Support different type of actions
- Support rendering timestamp

## Usage

```tsx
import {UserMessage} from '@/components/organisms/UserMessage';

// Default message
<UserMessage >My message</BaseMessage>;

// Group of buttons
<UserMessage actions={[{type: 'edit', , onClick: '() => ({})'}]}>
  My message
</UserMessage>;

// With avatar
<UserMessage showAvatar avatarUrl="">
  My message
</UserMessage>;

// With timestamp
<UserMessage showTimestamp timestamp="1705312234567">
  My message
</UserMessage>;
```

## Props

| Prop                 | Type                                                                              | Required | Default | Description                                |
| -------------------- | --------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------ |
| `data`               | `string \| React.ReactNode`                                                       | ✓        | -       | Message                                    |
| `format`             | `plain \| markdown`                                                               | -        | `plain` | Type of data                               |
| `timestamp`          | `string`                                                                          | -        | -       | Time of message                            |
| `showTimestamp`      | `boolean`                                                                         | -        | false   | Should be rendered timestamp               |
| `showAvatar`         | `boolean`                                                                         | -        | false   | Should be rendered Avatar of user          |
| `avatarUrl`          | `string`                                                                          | -        | -       | Url of avatar                              |
| `showActionsOnHover` | `boolean`                                                                         | -        | false   | Should actions be always shown or on hover |
| `actions`            | `Array<{type: BaseMessageAction \| string;onClick: () => void;icon?: IconData;}>` | -        | -       | Buttons array                              |
| `className`          | `string`                                                                          | -        | -       | Additional CSS class                       |
| `qa`                 | `string`                                                                          | -        | -       | QA/test identifier                         |

## Styling

The component uses CSS variables for theming:

### Spacing

```css
    --g-spacing-1 /* Gap between message and buttons */
```
