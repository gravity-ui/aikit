# ChatHistory

A comprehensive chat history component that displays a list of chats in a popup with integrated search, grouping, and action capabilities.

## Features

- **Popup Interface**: Controlled popup component for displaying chat list
- **Integrated Search**: Built-in search using List component's filter API
- **Date Grouping**: Automatically groups chats by date with relative date display (today, yesterday, N days ago)
- **Pagination**: Supports "Load more" functionality for large chat lists
- **Delete Operations**: Delete individual chats with visible delete buttons on hover
- **Selected State**: Visual indication of the currently selected chat
- **Empty State**: Customizable empty state placeholder
- **Responsive**: Fixed width with scrollable content area
- **Internationalization**: Full i18n support for English and Russian

## Usage

```tsx
import {useRef, useState} from 'react';
import {ChatHistory} from '@gravity-ui/aikit';
import {Button, Icon, ActionTooltip} from '@gravity-ui/uikit';
import {ClockArrowRotateLeft} from '@gravity-ui/icons';

// Basic usage with trigger button
function MyComponent() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <ActionTooltip title="Chat History">
        <Button
          ref={anchorRef}
          view="flat"
          size="m"
          onClick={() => setOpen(!open)}
        >
          <Icon data={ClockArrowRotateLeft} size={16} />
        </Button>
      </ActionTooltip>
      <ChatHistory
        chats={chats}
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
        onSelectChat={handleSelectChat}
      />
    </>
  );
}

// With all features
<ChatHistory
  chats={chats}
  selectedChat={selectedChat}
  onSelectChat={handleSelectChat}
  onDeleteChat={handleDeleteChat}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  searchable={true}
  groupBy="date"
  showActions={true}
  open={open}
  onOpenChange={setOpen}
  anchorRef={anchorRef}
/>

// Custom empty placeholder
<ChatHistory
  chats={[]}
  open={open}
  onOpenChange={setOpen}
  anchorRef={anchorRef}
  emptyPlaceholder={
    <div>Custom empty state</div>
  }
/>
```

## Props

| Prop               | Type                      | Required | Default             | Description                           |
| ------------------ | ------------------------- | -------- | ------------------- | ------------------------------------- |
| `chats`            | `ChatType[]`              | ✓        | -                   | Array of chat items                   |
| `anchorRef`        | `RefObject<HTMLElement>`  | ✓        | -                   | Ref to the anchor element for popup   |
| `open`             | `boolean`                 | -        | `false`             | Control popup open state              |
| `onOpenChange`     | `(open: boolean) => void` | -        | -                   | Callback when popup state changes     |
| `selectedChat`     | `ChatType \| null`        | -        | -                   | Currently selected chat               |
| `onSelectChat`     | `(chat) => void`          | -        | -                   | Callback when a chat is selected      |
| `onDeleteChat`     | `(chat) => void`          | -        | -                   | Callback when a chat is deleted       |
| `onLoadMore`       | `() => void`              | -        | -                   | Callback to load more chats           |
| `hasMore`          | `boolean`                 | -        | `false`             | Whether there are more chats to load  |
| `searchable`       | `boolean`                 | -        | `true`              | Enable search functionality           |
| `groupBy`          | `'date' \| 'none'`        | -        | `'date'`            | Group chats by date or show flat list |
| `showActions`      | `boolean`                 | -        | `true`              | Show action buttons (delete)          |
| `emptyPlaceholder` | `React.ReactNode`         | -        | -                   | Custom empty state placeholder        |
| `className`        | `string`                  | -        | -                   | Additional CSS class                  |
| `qa`               | `string`                  | -        | -                   | QA/test identifier                    |
| `style`            | `CSSProperties`           | -        | -                   | Inline styles                         |
| `filterFunction`   | `ChatFilterFunction`      | -        | `defaultChatFilter` | Custom filter function for search     |

## Chat Type

The component expects chats to conform to the `ChatType` interface:

```typescript
type ChatType = {
  id: string;
  name: string;
  createTime: string | null;
  lastMessage?: string;
  metadata?: Record<string, unknown>;
};
```

## Grouping

When `groupBy` is set to `"date"`, chats are automatically grouped by creation date. Date headers use the `ChatDate` component with `relative` prop, showing:

- "Today" for chats created today
- "Yesterday" for chats created yesterday
- "N days ago" for chats created 2-7 days ago
- Standard date format for older chats

Groups are sorted with newest dates first.

## Search

Search functionality is integrated using the List component's `filterable` and `filterItem` props. The search input appears at the top of the list when `searchable={true}`.

The default filter searches in both chat name and last message (case-insensitive).

### Custom Filter Function

You can provide a custom filter function through the `filterFunction` prop:

```typescript
import {ChatHistory, defaultChatFilter} from '@gravity-ui/aikit';
import type {ChatFilterFunction} from '@gravity-ui/aikit';

// Custom filter that searches only in chat names
const nameOnlyFilter: ChatFilterFunction = (filter) => (item) => {
  if (item.type === 'date-header') {
    return true;
  }
  return item.name.toLowerCase().includes(filter.toLowerCase());
};

<ChatHistory
  chats={chats}
  searchable={true}
  filterFunction={nameOnlyFilter}
/>
```

The filter function should have the following signature:

```typescript
type ChatFilterFunction = (filter: string) => (item: ListItemData<ListItemChatData>) => boolean;
```

The `defaultChatFilter` utility function is exported from `@gravity-ui/aikit` and can be used as reference or extended.

**Note:** Date headers are automatically hidden when search is active to avoid showing empty date groups. Your filter function should always return `true` for `date-header` items - the component handles their visibility internally during search.

## Pagination

For large chat lists, use the `hasMore` and `onLoadMore` props:

```typescript
const [chats, setChats] = useState(initialChats);
const [hasMore, setHasMore] = useState(true);

const handleLoadMore = () => {
  fetchMoreChats().then(newChats => {
    setChats(prev => [...prev, ...newChats]);
    setHasMore(newChats.length > 0);
  });
};

<ChatHistory
  chats={chats}
  hasMore={hasMore}
  onLoadMore={handleLoadMore}
/>
```

## Actions

### Delete Chat

Show delete buttons on individual chat items (visible on hover):

```typescript
<ChatHistory
  chats={chats}
  onDeleteChat={handleDeleteChat}
  showActions={true}
/>
```

To hide delete buttons, set `showActions={false}`.

## Empty State

When no chats are available, the component displays an empty state. You can customize it with `emptyPlaceholder`:

```typescript
<ChatHistory
  chats={[]}
  emptyPlaceholder={
    <div style={{padding: '40px', textAlign: 'center'}}>
      <div>No conversations yet</div>
      <div>Start a new chat to begin</div>
    </div>
  }
/>
```

## Examples

### Basic Integration

```typescript
import {useState} from 'react';
import {ChatHistory} from '@gravity-ui/aikit';

function ChatApp() {
  const [chats, setChats] = useState([...]);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div>
      <ChatHistory
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
    </div>
  );
}
```

### Full-Featured Example

```typescript
import {useState} from 'react';
import {ChatHistory} from '@gravity-ui/aikit';

function AdvancedChatApp() {
  const [chats, setChats] = useState([...]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleDeleteChat = (chat) => {
    setChats(prev => prev.filter(c => c.id !== chat.id));
    if (selectedChat?.id === chat.id) {
      setSelectedChat(null);
    }
  };

  const handleLoadMore = () => {
    fetchMoreChats().then(newChats => {
      setChats(prev => [...prev, ...newChats]);
      setHasMore(newChats.length > 0);
    });
  };

  return (
    <ChatHistory
      chats={chats}
      selectedChat={selectedChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      searchable={true}
      groupBy="date"
      showActions={true}
    />
  );
}
```

## Styling

The component uses CSS variables for theming:

### Color and Layout Variables

| Variable                         | Description                        |
| -------------------------------- | ---------------------------------- |
| `--g-color-base-background`      | Background color                   |
| `--g-color-line-generic`         | Border color                       |
| `--g-color-text-primary`         | Primary text color                 |
| `--g-color-text-secondary`       | Secondary text color (dates, etc.) |
| `--g-color-base-simple-hover`    | Hover background color             |
| `--g-color-base-selection`       | Selected chat background           |
| `--g-color-base-selection-hover` | Selected chat hover background     |
| `--g-spacing-*`                  | Spacing variables                  |

### Component Size Variables

| Variable                             | Description                                                     |
| ------------------------------------ | --------------------------------------------------------------- |
| `--g-aikit-chat-history-width`       | Width of the chat history container (default: `360px`)          |
| `--g-aikit-chat-history-max-height`  | Maximum height of the chat history container (default: `560px`) |
| `--g-aikit-chat-history-item-height` | Height of chat content item (default: `24px`)                   |

```css
/* Example: Custom dimensions */
.custom-chat-history {
  --g-aikit-chat-history-width: 400px;
  --g-aikit-chat-history-max-height: 600px;
  --g-aikit-chat-history-item-height: 28px;
}
```

```tsx
/* Example: Inline styles */
<ChatHistory
  className="custom-chat-history"
  style={{
    '--g-aikit-chat-history-width': '450px',
  }}
  chats={chats}
  anchorRef={anchorRef}
/>
```

## Accessibility

- Uses semantic HTML with proper button elements
- Keyboard navigation support through Popup and List components
- Click areas are properly sized for touch devices
- Focus management handled by underlying UI kit components

## Internationalization

The component includes translations for:

- English (`en`)
- Russian (`ru`)

Translations cover:

- Search placeholder
- Empty state message
- Load more button text

## Components Structure

The ChatHistory component is composed of several sub-components:

- **ChatHistory**: Main component that manages the popup and list
- **ChatItem**: Individual chat item with hover state and delete button
- **DateHeaderItem**: Date header for grouping chats by date

All these components are exported and can be used independently if needed.

## Utilities

The following utilities are exported from `@gravity-ui/aikit`:

- **`groupChatsByDate(chats: ChatType[]): Map<string, ChatType[]>`**: Groups chats by date
- **`defaultChatFilter(filter: string): FilterFunction`**: Default filter function for searching chats
- **`ChatFilterFunction`**: Type for custom filter functions

## Types

The following types are exported from `@gravity-ui/aikit`:

- **`ChatType`**: Base chat type with id, name, createTime, lastMessage, and metadata
- **`ListItemChatData`**: Union type for list items (chat or date header)

## Dependencies

- `@gravity-ui/uikit`: Button, Icon, List, Popup, ActionTooltip
- `@gravity-ui/icons`: ClockArrowRotateLeft, TrashBin
- Internal components: ChatDate

## Related Components

- **ChatDate**: Used for displaying relative dates in group headers
- **ChatItem**: Individual chat list item (exported from ChatHistory)
- **DateHeaderItem**: Date group header (exported from ChatHistory)
- **Header**: May contain the ChatHistory trigger button
- **PromptBox**: Often used alongside ChatHistory in chat interfaces
