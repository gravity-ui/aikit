# BaseMessage

Base wrapper for message with support for rendering action buttons

## Features

- **Different message types**: Support different alignment for different types of messages (user, assistant, system)
- **Action buttons**: Support rendering default and custom action buttons with unified Action type
- **Internationalized tooltips**: Action buttons have tooltips that support multiple languages
- **Flexible styling**: Support for showing actions on hover or always visible
- **Timestamp display**: Optional timestamp display in the actions area

## Usage

```tsx
import {BaseMessage} from '@gravity-ui/aikit';
import {Copy, Pencil, TrashBin} from '@gravity-ui/icons';

// Basic usage - different message types
<BaseMessage role="user">My message</BaseMessage>
<BaseMessage role="assistant">Assistant response</BaseMessage>
<BaseMessage role="system">System message</BaseMessage>

// With action buttons using type (default icons)
<BaseMessage
  role="assistant"
  actions={[
    {type: 'copy', onClick: () => console.log('Copy')},
    {type: 'edit', onClick: () => console.log('Edit')},
    {type: 'delete', onClick: () => console.log('Delete')},
  ]}
>
  My message
</BaseMessage>

// With custom actions using icon and label
<BaseMessage
  role="user"
  actions={[
    {label: 'Copy', icon: Copy, onClick: () => console.log('Copy')},
    {label: 'Edit', icon: Pencil, onClick: () => console.log('Edit'), view: 'outlined'},
  ]}
>
  My message
</BaseMessage>

// Show actions only on hover
<BaseMessage
  role="assistant"
  actions={[{type: 'copy', onClick: () => console.log('Copy')}]}
  showActionsOnHover={true}
>
  My message
</BaseMessage>

// With timestamp
<BaseMessage
  role="user"
  actions={[{type: 'edit', onClick: () => console.log('Edit')}]}
  showTimestamp={true}
  timestamp="1705312234567"
>
  My message
</BaseMessage>
```

## Action Buttons

Actions follow the unified `Action` type from `src/types/common.ts`. Each action can be specified in three ways:

### 1. Using predefined action types (with default icons)

```tsx
const actions = [
  {type: 'copy', onClick: handleCopy},
  {type: 'edit', onClick: handleEdit},
  {type: 'delete', onClick: handleDelete},
];
```

Available action types with default icons and tooltips:

- `copy` - Copy icon, "Copy" / "Копировать"
- `edit` - Pencil icon, "Edit" / "Редактировать"
- `retry` - ArrowRotateLeft icon, "Retry" / "Повторить"
- `like` - ThumbsUp icon (ThumbsUpFill when `userRating === 'like'`), "Like" / "Нравится"
- `unlike` - ThumbsDown icon (ThumbsDownFill when `userRating === 'dislike'`), "Dislike" / "Не нравится"
- `delete` - TrashBin icon, "Delete" / "Удалить"

### 2. Using custom actions with explicit properties

```tsx
const actions = [
  {
    label: 'Custom Action',
    icon: <Icon data={CustomIcon} />,
    onClick: handleCustom,
    view: 'outlined',
  },
];
```

### 3. Using fully custom ReactNode

You can pass any React element directly for complete customization:

```tsx
const actions = [
  {type: 'copy', onClick: handleCopy},
  <Button key="custom" view="outlined-info" size="s" onClick={handleCustom}>
    Custom Button
  </Button>,
  <div key="custom-div" onClick={handleAction}>
    Custom Element
  </div>,
];
```

### Action Properties

Each action config object supports the following properties (extends `ActionConfig` type):

- `type?: string` - Action type identifier (maps to default icon if provided)
- `label?: string` - Button label or tooltip text
- `icon?: React.ReactNode` - Custom icon (overrides default icon from type)
- `onClick?: () => void` - Click handler
- `view?: ButtonView` - Button view variant (e.g., 'flat', 'outlined', 'normal')

**Or** pass any `React.ReactNode` for fully custom rendering.

## Props

| Prop                 | Type                  | Required | Default | Description                                                                                       |
| -------------------- | --------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `children`           | `React.ReactNode`     | ✓        | -       | Message content                                                                                   |
| `role`               | `TMessageRole`        | ✓        | -       | Message role: 'user', 'assistant', or 'system'                                                    |
| `actions`            | `BaseMessageAction[]` | -        | -       | Array of action buttons                                                                           |
| `showActionsOnHover` | `boolean`             | -        | `false` | Show actions only on hover                                                                        |
| `showTimestamp`      | `boolean`             | -        | `false` | Show timestamp in actions area                                                                    |
| `timestamp`          | `string`              | -        | -       | Message timestamp (displayed if showTimestamp=true)                                               |
| `userRating`         | `'like' \| 'dislike'` | -        | -       | Current user rating; switches like/unlike icons to filled variant (ThumbsUpFill / ThumbsDownFill) |
| `className`          | `string`              | -        | -       | Additional CSS class                                                                              |
| `qa`                 | `string`              | -        | -       | QA/test identifier                                                                                |

## Styling

The component uses CSS variables for theming:

### Spacing

```css
    --g-spacing-1 /* Gap between message and buttons */
```
