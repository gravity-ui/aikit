# Header

Header component for displaying chat header with navigation and actions.

## Features

- Display chat title
- Navigation (history, new chat, close)
- Additional actions
- Title positioning (left, center)
- Internationalized tooltips for action buttons

## Usage

### Basic usage

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';

<Header
  title="Chat Header"
  baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
  handleNewChat={() => console.log('New chat')}
  handleHistoryToggle={() => console.log('History')}
  handleClose={() => console.log('Close')}
/>;
```

### With icon and preview

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';
import {Icon} from '@gravity-ui/uikit';
import {Bars} from '@gravity-ui/icons';

<Header
  icon={<Icon data={Bars} size={16} />}
  title="Chat Header"
  preview={<StageLabel size="m" stage="preview" />}
  baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
  handleNewChat={() => console.log('New chat')}
  handleHistoryToggle={() => console.log('History')}
  handleClose={() => console.log('Close')}
/>;
```

### With additional actions

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';

<Header
  title="Chat Header"
  baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
  additionalActions={[
    {
      children: 'Settings',
      view: 'outlined',
      onClick: () => console.log('Settings'),
    },
  ]}
  handleNewChat={() => console.log('New chat')}
  handleHistoryToggle={() => console.log('History')}
  handleClose={() => console.log('Close')}
/>;
```

### Title positioning

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';

// Left
<Header
  title="Left Title"
  titlePosition="left"
  baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
  handleNewChat={() => console.log('New chat')}
  handleClose={() => console.log('Close')}
/>;

// Center (default)
<Header
  title="Center Title"
  titlePosition="center"
  baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
  handleNewChat={() => console.log('New chat')}
  handleClose={() => console.log('Close')}
/>;
```

## Using useHeader hook

The `useHeader` hook allows you to use the component logic to create your own view:

```tsx
import {useHeader} from '@gravity-ui/aikit';

function CustomHeader(props) {
  const {title, preview, icon, baseActions, additionalActions, titlePosition} = useHeader(props);

  // Create your own view
  return (
    <div>
      {icon && <div>{icon}</div>}
      {title && <h1>{title}</h1>}
      {/* ... */}
    </div>
  );
}
```

## Base actions

Base actions order: `newChat` → `history` → `folding` → `close`

- `folding` - toggle between collapsed and opened states

### Action Tooltips

Each base action button has a tooltip that shows the action name. Tooltips are implemented using the `ActionTooltip` component from `@gravity-ui/uikit` and are internationalized to support multiple languages (English and Russian by default).

Available tooltip keys in i18n:

- `action-tooltip-newChat` - "New chat" / "Новый чат"
- `action-tooltip-history` - "History" / "История"
- `action-tooltip-folding-collapsed` - "Expand" / "Развернуть"
- `action-tooltip-folding-opened` - "Collapse" / "Свернуть"
- `action-tooltip-close` - "Close" / "Закрыть"

## Styling

The component uses CSS variables for theming:

### Background

```css
--g-aikit-header-background  /* Header background color */
--g-spacing-1                /* Gap between title and preview */
--g-spacing-2                /* Header padding and gap between elements */
```

## API

### HeaderProps

| Prop                  | Type                                       | Description                         |
| --------------------- | ------------------------------------------ | ----------------------------------- |
| `icon`                | `React.ReactNode`                          | Icon to the left of the title       |
| `title`               | `string`                                   | Chat title                          |
| `preview`             | `React.ReactNode`                          | Preview after the title             |
| `baseActions`         | `HeaderAction[]`                           | Array of base actions               |
| `handleNewChat`       | `() => void`                               | New chat handler                    |
| `handleHistoryToggle` | `() => void`                               | History toggle handler              |
| `handleFolding`       | `(value: 'collapsed' \| 'opened') => void` | Folding handler                     |
| `handleClose`         | `() => void`                               | Close handler                       |
| `additionalActions`   | `AdditionalActionsConfig[]`                | Array of additional actions         |
| `foldingState`        | `'collapsed' \| 'opened'`                  | Folding state (default: `'opened'`) |
| `titlePosition`       | `'left' \| 'center'`                       | Title position (default: `'left'`)  |
| `className`           | `string`                                   | Additional CSS class                |

### HeaderAction

```tsx
enum HeaderAction {
  NewChat = 'newChat',
  History = 'history',
  Folding = 'folding',
  Close = 'close',
}
```
