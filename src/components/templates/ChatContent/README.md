# ChatContent

Main chat content container with view switching between empty state and message list.

## Features

- **View Switching**: Seamlessly switches between 'empty' (EmptyContainer) and 'chat' (MessageList) states
- **Persistent Input**: PromptInput is always visible regardless of the view state
- **Flexible Configuration**: Accepts props for all child components (EmptyContainer, MessageList, PromptInput)
- **Responsive Layout**: Automatically adjusts to available space with scrollable content area
- **Clean Architecture**: Separates content display from input, following chat application patterns

## Usage

```tsx
import {ChatContent} from '@gravity-ui/aikit';

// Empty state with suggestions
<ChatContent
  view="empty"
  emptyContainerProps={{
    title: "Welcome to AI Chat",
    description: "Start a conversation or choose a suggestion below",
    suggestions: [
      {id: '1', content: 'Tell me a joke'},
      {id: '2', content: 'Explain quantum physics'},
    ],
    onSuggestionClick: (content) => console.log(content),
  }}
  promptInputProps={{
    onSend: async (data) => {
      console.log('Sending:', data.content);
    },
  }}
/>

// Chat state with messages
<ChatContent
  view="chat"
  messageListProps={{
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Hello!',
        timestamp: '2024-01-01T12:00:00Z',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi! How can I help you today?',
        timestamp: '2024-01-01T12:00:01Z',
      },
    ],
    showTimestamp: true,
    showAvatar: true,
  }}
  promptInputProps={{
    onSend: async (data) => {
      console.log('Sending:', data.content);
    },
    disabled: false,
  }}
/>

// Empty state with PromptInput features
<ChatContent
  view="empty"
  emptyContainerProps={{
    title: "AI Assistant",
    description: "I'm here to help!",
  }}
  promptInputProps={{
    view: "full",
    onSend: async (data) => {
      console.log('Sending:', data);
    },
    headerProps: {
      showContextIndicator: true,
    },
    footerProps: {
      showAttachment: true,
      showSettings: true,
    },
  }}
/>
```

## Props

| Prop                  | Type                  | Required | Default | Description                                                      |
| --------------------- | --------------------- | -------- | ------- | ---------------------------------------------------------------- |
| `view`                | `'empty' \| 'chat'`   | ✓        | -       | Display mode: 'empty' for EmptyContainer, 'chat' for MessageList |
| `emptyContainerProps` | `EmptyContainerProps` | -        | -       | Props passed to EmptyContainer (used when view='empty')          |
| `messageListProps`    | `MessageListProps`    | -        | -       | Props passed to MessageList (used when view='chat')              |
| `promptInputProps`    | `PromptInputProps`    | -        | -       | Props passed to PromptInput (always visible)                     |
| `className`           | `string`              | -        | -       | Additional CSS class                                             |
| `qa`                  | `string`              | -        | -       | QA/test identifier                                               |

## View States

### Empty View

When `view="empty"`, the component displays:

- EmptyContainer with welcome message, description, and optional suggestions
- PromptInput at the bottom for user input

This state is typically used:

- At the start of a new conversation
- When there are no messages to display
- As a landing page with suggested prompts

### Chat View

When `view="chat"`, the component displays:

- MessageList with conversation history
- PromptInput at the bottom for user input

This state is used:

- During an active conversation
- When displaying message history
- For ongoing chat interactions

## Child Components

### EmptyContainer

Configure the empty state display:

```tsx
emptyContainerProps={{
  image: <MyCustomIcon />,
  title: "Welcome",
  description: "Start chatting",
  suggestions: [...],
  onSuggestionClick: (content) => {...},
  alignment: {
    image: 'center',
    title: 'center',
    description: 'left',
  },
}}
```

See [EmptyContainer documentation](../EmptyContainer/README.md) for full props.

### MessageList

Configure the message display:

```tsx
messageListProps={{
  messages: [...],
  showTimestamp: true,
  showAvatar: true,
  showActionsOnHover: true,
  messageRendererRegistry: customRegistry,
}}
```

See [MessageList documentation](../../organisms/MessageList/README.md) for full props.

### PromptInput

Configure the input area:

```tsx
promptInputProps={{
  view: 'full',
  onSend: async (data) => {...},
  onCancel: async () => {...},
  disabled: false,
  isStreaming: false,
  headerProps: {...},
  bodyProps: {...},
  footerProps: {...},
  suggestionsProps: {...},
}}
```

See [PromptInput documentation](../../organisms/PromptInput/README.md) for full props.

## Styling

The component uses CSS variables for theming:

| Variable                         | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `--g-spacing-3`                  | Padding for prompt input area (default: 12px) |
| `--g-spacing-4`                  | Padding for content area (default: 16px)      |
| `--g-color-line-generic`         | Border color for prompt input separator       |
| `--g-color-base-background`      | Background color for prompt input area        |
| `--g-aikit-chat-content-padding` | Background color for all chat content         |

```css
/* Example: Custom spacing and colors */
.custom-chat-content {
  --g-spacing-3: 16px;
  --g-spacing-4: 20px;
  --g-color-line-generic: #e0e0e0;
  --g-color-base-background: #f5f5f5;
  --g-aikit-chat-content-paddin: #f5f500;
}
```

```tsx
/* Example: Inline styles */
<ChatContent
  className="custom-chat-content"
  view="chat"
  messageListProps={{...}}
  promptInputProps={{...}}
/>
```

## Layout Structure

The component uses a flexbox layout:

```
┌─────────────────────────────────┐
│         Content Area            │
│  (EmptyContainer or MessageList)│
│         (scrollable)            │
│                                 │
│                                 │
├─────────────────────────────────┤ ← Border separator
│       PromptInput               │
│       (fixed at bottom)         │
└─────────────────────────────────┘
```

- **Content Area**: Flexible height, scrollable vertically
- **PromptInput**: Fixed at bottom, always visible
- **Separator**: 1px border between content and input

## Implementation Details

The component:

- Uses conditional rendering to switch between EmptyContainer and MessageList
- Maintains PromptInput visibility across all view states
- Implements proper overflow handling for long conversations
- Applies custom scrollbar styling for better UX
- Passes through all child component props without modification

## Accessibility

- Semantic HTML structure with proper flex layout
- Scrollable content area with keyboard navigation support
- All interactive elements (suggestions, input) are keyboard accessible
- Child components maintain their own accessibility features
