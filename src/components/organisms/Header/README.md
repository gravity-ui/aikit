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

Additional actions follow the unified `Action` type and can include label, icon, onClick handler, and view style.

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';
import {Icon} from '@gravity-ui/uikit';
import {Gear} from '@gravity-ui/icons';

<Header
  title="Chat Header"
  baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
  additionalActions={[
    {
      label: 'Settings',
      view: 'outlined',
      onClick: () => console.log('Settings'),
    },
    {
      icon: <Icon data={Gear} size={16} />,
      onClick: () => console.log('Settings icon'),
      view: 'flat',
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

### History button ref

You can get a reference to the history button to anchor popups to it (e.g., `History`):

```tsx
import {useRef} from 'react';
import {Header, HeaderAction} from '@gravity-ui/aikit';

function MyComponent() {
  const historyButtonRef = useRef<HTMLElement>(null);

  return (
    <>
      <Header
        title="Chat Header"
        baseActions={[HeaderAction.History]}
        handleHistoryToggle={() => console.log('Toggle history')}
        historyButtonRef={historyButtonRef}
      />
      {/* Use historyButtonRef to anchor popup */}
    </>
  );
}
```

### Hiding title and preview

You can control the visibility of the title and preview using the `showTitle` prop:

```tsx
import {Header, HeaderAction} from '@gravity-ui/aikit';

// Hide title and preview
<Header
  title="Chat Header"
  preview={<span>Preview</span>}
  showTitle={false}
  baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
  handleNewChat={() => console.log('New chat')}
  handleClose={() => console.log('Close')}
/>;

// Show title and preview (default)
<Header
  title="Chat Header"
  preview={<span>Preview</span>}
  showTitle={true}
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

## Actions

### Base actions

Base actions are predefined header actions with specific handlers and icons. They appear in the order: `newChat` → `history` → `folding` → `close`

Available base actions:

- `HeaderAction.NewChat` - Opens new chat dialog
- `HeaderAction.History` - Toggles chat history sidebar
- `HeaderAction.Folding` - Toggles between collapsed and expanded states
- `HeaderAction.Close` - Closes the chat

Each base action button has a tooltip that shows the action name. Tooltips are internationalized to support multiple languages (English and Russian by default).

Available tooltip keys in i18n:

- `action-tooltip-newChat` - "New chat" / "Новый чат"
- `action-tooltip-history` - "History" / "История"
- `action-tooltip-folding-collapsed` - "Expand" / "Развернуть"
- `action-tooltip-folding-opened` - "Collapse" / "Свернуть"
- `action-tooltip-close` - "Close" / "Закрыть"

### Additional actions

Additional actions follow the unified `Action` type from `src/types/common.ts`. Each action can be:

**Action Config Object:**

- `label?: string` - Button label text (used as tooltip if provided)
- `icon?: React.ReactNode` - Custom icon element
- `onClick?: () => void` - Click handler
- `view?: ButtonView` - Button view variant ('flat', 'outlined', 'normal', etc.)

**Or React.ReactNode:**

You can pass any React element directly for complete customization:

```tsx
<Header
  additionalActions={[
    {label: 'Settings', icon: <Icon data={Gear} />, onClick: handleSettings},
    <Button key="custom" view="outlined" onClick={handleCustom}>
      Custom Button
    </Button>,
  ]}
/>
```

Additional actions appear before base actions in the header's action bar.

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

| Prop                  | Type                                       | Required | Default    | Description                                       |
| --------------------- | ------------------------------------------ | -------- | ---------- | ------------------------------------------------- |
| `icon`                | `React.ReactNode`                          | -        | -          | Icon to the left of the title                     |
| `title`               | `string`                                   | -        | -          | Chat title                                        |
| `preview`             | `React.ReactNode`                          | -        | -          | Preview content after the title                   |
| `baseActions`         | `HeaderAction[]`                           | -        | `[]`       | Array of predefined base actions                  |
| `handleNewChat`       | `() => void`                               | -        | -          | Handler for new chat action                       |
| `handleHistoryToggle` | `() => void`                               | -        | -          | Handler for history toggle action                 |
| `handleFolding`       | `(value: 'collapsed' \| 'opened') => void` | -        | -          | Handler for folding action                        |
| `handleClose`         | `() => void`                               | -        | -          | Handler for close action                          |
| `additionalActions`   | `Action[]`                                 | -        | `[]`       | Array of additional custom actions (unified type) |
| `historyButtonRef`    | `React.RefObject<HTMLElement>`             | -        | -          | Ref for history button (used to anchor popups)    |
| `foldingState`        | `'collapsed' \| 'opened'`                  | -        | `'opened'` | Current folding state                             |
| `titlePosition`       | `'left' \| 'center'`                       | -        | `'left'`   | Title alignment position                          |
| `withIcon`            | `boolean`                                  | -        | `true`     | Whether to show icon area                         |
| `showTitle`           | `boolean`                                  | -        | `true`     | Whether to show title and preview                 |
| `className`           | `string`                                   | -        | -          | Additional CSS class                              |

### HeaderAction

```tsx
enum HeaderAction {
  NewChat = 'newChat',
  History = 'history',
  Folding = 'folding',
  Close = 'close',
}
```
