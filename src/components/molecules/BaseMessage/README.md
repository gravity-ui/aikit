# BaseMessage

Base wrapper for message with support rendering buttons group

## Features

- **Different type of messages**: Support different alignment for different types of messages
- **Support group of buttons**: Support rendering default and custom group of buttons
- **Internationalized tooltips**: Action buttons have tooltips that support multiple languages

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

## Action Tooltips

Each action button has a tooltip that shows the action name. Tooltips are implemented using the `ActionTooltip` component from `@gravity-ui/uikit` and are internationalized to support multiple languages (English and Russian by default).

Available action types with tooltips:

- `copy` - "Copy" / "Копировать"
- `edit` - "Edit" / "Редактировать"
- `retry` - "Retry" / "Повторить"
- `like` - "Like" / "Нравится"
- `unlike` - "Dislike" / "Не нравится"
- `delete` - "Delete" / "Удалить"

For custom action types (not in the default list), tooltips will not be displayed unless you add the corresponding i18n keys.

## Props

| Prop                 | Type                                                                              | Required | Default | Description                                |
| -------------------- | --------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------ |
| `children`           | `React.ReactNode`                                                                 | ✓        | -       | Message                                    |
| `variant`            | `'user' \| 'assistant' \| 'system'`                                               | ✓        | -       | Type of message                            |
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
