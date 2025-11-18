# ChatContent

Main chat content container with view switching between empty state and message list.

## Features

- **View Switching**: Seamlessly switches between 'empty' (EmptyContainer) and 'chat' (MessageList) states
- **Flexible Configuration**: Accepts props for child components (EmptyContainer, MessageList)
- **Responsive Layout**: Automatically adjusts to available space with scrollable content area
- **Clean Architecture**: Focused on content display, separating concerns from input and footer elements
- **Simple Integration**: Easy to integrate into larger chat applications

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
      {id: '1', title: 'Tell me a joke'},
      {id: '2', title: 'Explain quantum physics'},
    ],
    onSuggestionClick: (content) => console.log(content),
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
/>

// Empty state with custom image
<ChatContent
  view="empty"
  emptyContainerProps={{
    image: <CustomIcon />,
    title: "AI Assistant",
    description: "I'm here to help!",
    alignment: {
      image: 'center',
      title: 'center',
      description: 'center',
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
| `className`           | `string`              | -        | -       | Additional CSS class                                             |
| `qa`                  | `string`              | -        | -       | QA/test identifier                                               |

## View States

### Empty View

When `view="empty"`, the component displays EmptyContainer with:

- Welcome message and description
- Optional custom image or icon
- Optional suggestions for user to choose from

This state is typically used:

- At the start of a new conversation
- When there are no messages to display
- As a landing page with suggested prompts

### Chat View

When `view="chat"`, the component displays MessageList with:

- Conversation history
- Message timestamps (optional)
- User and assistant avatars (optional)
- Message actions (optional)

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

## Styling

The component uses CSS variables for theming:

| Variable                            | Description                            |
| ----------------------------------- | -------------------------------------- |
| `--g-spacing-2`                     | Gap between elements (default: 8px)    |
| `--g-aikit-chat-content-background` | Background color for chat content area |

```css
/* Example: Custom styling */
.custom-chat-content {
  --g-spacing-2: 12px;
  --g-aikit-chat-content-background: #f9f9f9;
}
```

```tsx
/* Example: Inline styles */
<ChatContent
  className="custom-chat-content"
  view="chat"
  messageListProps={{...}}
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
│                                 │
│                                 │
└─────────────────────────────────┘
```

- **Content Area**: Flexible height, scrollable vertically
- **Full Width**: Stretches to fill parent container
- **Overflow Handling**: Properly handles long conversations

## Implementation Details

The component:

- Uses conditional rendering to switch between EmptyContainer and MessageList
- Implements proper overflow handling for long conversations
- Applies custom scrollbar styling for better UX
- Passes through all child component props without modification
- Designed to be used within larger chat container (like ChatContainer)

## Accessibility

- Semantic HTML structure with proper flex layout
- Scrollable content area with keyboard navigation support
- All interactive elements (suggestions, messages) are keyboard accessible
- Child components maintain their own accessibility features

## Integration

ChatContent is designed to be used as part of a larger chat application. For a complete chat solution with header, footer, and history, use the [ChatContainer](../../pages/ChatContainer/README.md) component which includes:

- Header with navigation and controls
- ChatContent for message display
- PromptInput for user input
- Disclaimer for legal text
- Chat history management
