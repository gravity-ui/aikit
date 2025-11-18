# ChatContainer

A fully assembled chat component - the main exportable component of the library that integrates Header, ChatContent, and History.

## Features

- **Complete Integration**: Seamlessly combines Header, ChatContent, and History components
- **State Management**: Handles chat switching, message display, and history management
- **Flexible Configuration**: Extensive props API for customizing all aspects of the chat
- **I18n Support**: Built-in internationalization with customizable text labels
- **Welcome Screen**: Configurable empty state with suggestions
- **Streaming Support**: Built-in support for streaming responses
- **Chat History**: Integrated popup-based chat history with search and grouping

## Usage

```tsx
import {ChatContainer} from '@gravity-ui/aikit';
import type {ChatType, TMessage, TSubmitData} from '@gravity-ui/aikit';

// Basic usage
<ChatContainer
  messages={messages}
  onSendMessage={async (data) => {
    await handleSendMessage(data.content);
  }}
/>

// With chat history
<ChatContainer
  chats={chats}
  activeChat={activeChat}
  messages={messages}
  onSendMessage={handleSendMessage}
  onSelectChat={handleSelectChat}
  onCreateChat={handleCreateChat}
  onDeleteChat={handleDeleteChat}
/>

// With welcome screen and suggestions
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: "Welcome to AI Assistant",
    description: "How can I help you today?",
    suggestions: [
      {id: '1', content: 'Explain quantum computing', title: 'Science'},
      {id: '2', content: 'Write a poem about nature', title: 'Creative'},
      {id: '3', content: 'Help me debug my code', title: 'Programming'},
    ],
  }}
/>

// Full configuration with streaming and error handling
<ChatContainer
  chats={chats}
  activeChat={activeChat}
  messages={messages}
  onSendMessage={handleSendMessage}
  onCancel={handleCancel}
  onSelectChat={handleSelectChat}
  onCreateChat={handleCreateChat}
  onDeleteChat={handleDeleteChat}
  onClose={handleClose}
  status="streaming"
  error={error}
  showHistory={true}
  showNewChat={true}
  showClose={false}
  i18nConfig={{
    header: {
      defaultTitle: "My AI Assistant",
    },
    emptyState: {
      title: "Start Chatting",
      description: "Ask me anything!",
    },
    promptInput: {
      placeholder: "Type your question...",
    },
  }}
/>

// With message actions on hover
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  showActionsOnHover={true}
/>

// With component props overrides
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  headerProps={{
    icon: <CustomIcon />,
    titlePosition: 'center',
  }}
  promptInputProps={{
    view: 'full',
    maxLength: 1000,
  }}
  historyProps={{
    groupBy: 'date',
    searchable: true,
  }}
/>
```

## Props

| Prop                  | Type                                   | Required | Default   | Description                                                           |
| --------------------- | -------------------------------------- | -------- | --------- | --------------------------------------------------------------------- |
| `messages`            | `TMessage[]`                           | -        | `[]`      | Array of messages in current chat                                     |
| `onSendMessage`       | `(data: TSubmitData) => Promise<void>` | ✓        | -         | Callback when user sends a message                                    |
| `chats`               | `ChatType[]`                           | -        | `[]`      | Array of chats for history                                            |
| `activeChat`          | `ChatType \| null`                     | -        | `null`    | Currently active chat                                                 |
| `onSelectChat`        | `(chat: ChatType) => void`             | -        | -         | Callback when user selects a chat from history                        |
| `onCreateChat`        | `() => void`                           | -        | -         | Callback when user creates a new chat                                 |
| `onDeleteChat`        | `(chat: ChatType) => void`             | -        | -         | Callback when user deletes a chat                                     |
| `onDeleteAllChats`    | `() => Promise<void>`                  | -        | -         | Callback when user deletes all chats                                  |
| `onClose`             | `() => void`                           | -        | -         | Callback when user closes the chat                                    |
| `onCancel`            | `() => Promise<void>`                  | -        | -         | Callback when user cancels streaming                                  |
| `status`              | `ChatStatus`                           | -        | `'ready'` | Chat status: `'submitted'` \| `'streaming'` \| `'ready'` \| `'error'` |
| `error`               | `Error \| null`                        | -        | `null`    | Error state                                                           |
| `onRetry`             | `() => void`                           | -        | -         | Callback to retry after error                                         |
| `showActionsOnHover`  | `boolean`                              | -        | `false`   | Show message actions (copy, like, edit) on hover                      |
| `contextItems`        | `ContextItemConfig[]`                  | -        | `[]`      | Array of context items to display in prompt input header              |
| `transformOptions`    | `OptionsType`                          | -        | -         | Transform options for markdown rendering                              |
| `headerProps`         | `Partial<HeaderProps>`                 | -        | -         | Props override for Header component                                   |
| `contentProps`        | `Partial<ChatContentProps>`            | -        | -         | Props override for ChatContent component                              |
| `emptyContainerProps` | `Partial<EmptyContainerProps>`         | -        | -         | Props override for EmptyContainer                                     |
| `promptInputProps`    | `Partial<PromptInputProps>`            | -        | -         | Props override for PromptInput component                              |
| `historyProps`        | `Partial<HistoryProps>`                | -        | -         | Props override for History component                                  |
| `welcomeConfig`       | `WelcomeConfig`                        | -        | -         | Welcome screen configuration for empty state                          |
| `i18nConfig`          | `ChatContainerI18nConfig`              | -        | -         | I18n configuration for all text labels                                |
| `showHistory`         | `boolean`                              | -        | `true`    | Show chat history feature                                             |
| `showNewChat`         | `boolean`                              | -        | `true`    | Show new chat button                                                  |
| `showClose`           | `boolean`                              | -        | `false`   | Show close button                                                     |
| `className`           | `string`                               | -        | -         | Additional CSS class                                                  |
| `qa`                  | `string`                               | -        | -         | QA/test identifier                                                    |

## Types

### WelcomeConfig

Configuration for the welcome screen displayed when there are no messages:

```tsx
interface WelcomeConfig {
  image?: React.ReactNode;
  title?: string;
  description?: string;
  suggestionTitle?: string;
  suggestions?: Array<{
    id: string;
    content: string;
    title?: string;
    description?: string;
  }>;
  showMore?: () => void;
  showMoreText?: string;
}
```

### ChatContainerI18nConfig

I18n configuration for customizing all text labels:

```tsx
interface ChatContainerI18nConfig {
  header?: {
    defaultTitle?: string;
    newChatTooltip?: string;
    historyTooltip?: string;
    closeTooltip?: string;
  };
  emptyState?: {
    title?: string;
    description?: string;
    suggestionsTitle?: string;
    showMoreText?: string;
  };
  promptInput?: {
    placeholder?: string;
    sendTooltip?: string;
    cancelTooltip?: string;
  };
  history?: {
    emptyPlaceholder?: string;
    searchPlaceholder?: string;
  };
  disclaimer?: {
    text?: string;
  };
}
```

## States

The component automatically manages different states through the `status` prop:

- **Empty State**: Displayed when there is no active chat and `messages` array is empty, shows welcome screen with suggestions
- **Chat State**: Displayed when there are messages OR when a chat is selected from history (even if messages are not yet loaded), shows message list and input
- **Submitted State** (`status='submitted'`): Shows loading indicator while waiting for response
- **Streaming State** (`status='streaming'`): Shows cancel button during response streaming
- **Ready State** (`status='ready'`): Normal state, ready for user input
- **Error State** (`status='error'`): Displays error message with retry option when combined with `error` prop

### View Logic

The component automatically determines which view to display:

1. If `activeChat` is set (a chat is selected from history), the **Chat State** is shown regardless of whether messages have been loaded yet
2. If `activeChat` is not set and `messages.length === 0`, the **Empty State** is shown
3. If `activeChat` is not set and `messages.length > 0`, the **Chat State** is shown

This ensures that selecting a chat from history immediately switches to the chat view, allowing the parent component to load messages asynchronously.

## Chat History Integration

History is integrated through a popup anchored to the history button in the Header:

- Click the history button to open/close the popup
- Select a chat to switch to it
- Delete individual chats with the delete action
- Search and filter chats
- Automatic grouping by date (configurable)

## Message Actions

Messages can have actions that appear on hover (when `showActionsOnHover` is enabled) or permanently. Actions must be provided in the `actions` field of each message:

```tsx
const messages: TMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello!',
    actions: [
      {type: 'copy', onClick: () => handleCopy('1')},
      {type: 'edit', onClick: () => handleEdit('1')},
    ],
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi there!',
    actions: [
      {type: 'copy', onClick: () => handleCopy('2')},
      {type: 'like', onClick: () => handleLike('2')},
      {type: 'unlike', onClick: () => handleUnlike('2')},
    ],
  },
];

<ChatContainer messages={messages} onSendMessage={handleSendMessage} showActionsOnHover={true} />;
```

### Available Action Types

Built-in action types with predefined icons:

- `copy` - Copy message content
- `edit` - Edit message (typically for user messages)
- `retry` - Retry sending/generating
- `like` - Like the message (typically for assistant messages)
- `unlike` - Dislike the message (typically for assistant messages)
- `delete` - Delete message

You can also provide custom actions with your own icons:

```tsx
{
  type: 'custom-action',
  onClick: () => handleCustom(),
  icon: MyCustomIcon,
}
```

## Component Props Overrides

You can override props for all integrated components:

### headerProps

Override Header component props (icon, title, actions, etc.):

```tsx
<ChatContainer
  headerProps={{
    icon: <CustomIcon />,
    titlePosition: 'center',
    additionalActions: [
      {
        buttonProps: {
          view: 'outlined',
          children: 'Settings',
          onClick: handleSettings,
        },
      },
    ],
  }}
/>
```

### promptInputProps

Override PromptInput component props (view, maxLength, etc.):

```tsx
<ChatContainer
  promptInputProps={{
    view: 'full',
    maxLength: 2000,
    bodyProps: {
      minRows: 3,
      maxRows: 10,
    },
  }}
/>
```

### historyProps

Override History component props (grouping, search, etc.):

```tsx
<ChatContainer
  historyProps={{
    groupBy: 'none',
    searchable: false,
    showActions: true,
  }}
/>
```

## Internationalization

The component supports i18n through the `i18nConfig` prop:

```tsx
<ChatContainer
  i18nConfig={{
    header: {
      defaultTitle: 'AI Assistant',
    },
    emptyState: {
      title: 'Welcome!',
      description: 'Start a conversation',
      suggestionsTitle: 'Try these:',
    },
    promptInput: {
      placeholder: 'Type here...',
    },
    history: {
      emptyPlaceholder: 'No chats yet',
    },
    disclaimer: {
      text: 'AI can make mistakes. Verify important info.',
    },
  }}
/>
```

## Streaming Example

Example with streaming API integration:

```tsx
import {useState} from 'react';
import {ChatContainer} from '@gravity-ui/aikit';
import type {ChatStatus, TMessage, TSubmitData} from '@gravity-ui/aikit';

function App() {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [controller, setController] = useState<AbortController | null>(null);

  const handleSendMessage = async (data: TSubmitData) => {
    // Add user message
    const userMessage: TMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: data.content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start streaming
    setStatus('streaming');
    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: data.content}),
        signal: abortController.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantMessage: TMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const {done, value} = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage.content += chunk;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? {...assistantMessage} : msg)),
        );
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
      }
    } finally {
      setStatus('ready');
      setController(null);
    }
  };

  const handleCancel = async () => {
    controller?.abort();
    setStatus('ready');
  };

  return (
    <ChatContainer
      messages={messages}
      onSendMessage={handleSendMessage}
      onCancel={handleCancel}
      status={status}
    />
  );
}
```

## Styling

The component uses CSS variables for theming:

| Variable                    | Description                             |
| --------------------------- | --------------------------------------- |
| `--g-color-base-background` | Background color of the chat container  |
| `--g-color-line-generic`    | Border color between header and content |

```css
/* Example: Custom theme */
.custom-chat {
  --g-color-base-background: #ffffff;
  --g-color-line-generic: #e0e0e0;
}
```

```tsx
/* Example: Inline styles */
<ChatContainer
  className="custom-chat"
  style={{
    '--g-color-base-background': '#ffffff',
  }}
/>
```

## Implementation Details

The component uses the `useChatContainer` hook for state management:

- Manages chat history popup state
- Switches between empty and chat views based on message count
- Integrates History with Header through refs
- Merges i18n configuration with default texts
- Forwards all callbacks to child components

The component architecture follows atomic design principles:

- **Header** (Organism): Navigation and actions
- **ChatContent** (Template): Message list display area (EmptyContainer or MessageList)
- **Footer**: PromptInput and Disclaimer for user interaction
- **History** (Template): Chat history in popup
- **EmptyContainer** (Template): Welcome screen with suggestions

## Layout Structure

```
┌─────────────────────────────────┐
│          Header                 │ ← Navigation and actions
├─────────────────────────────────┤
│         ChatContent             │
│  (EmptyContainer or MessageList)│
│         (scrollable)            │
│                                 │
├─────────────────────────────────┤
│          Footer                 │ ← PromptInput + Disclaimer
│      (PromptInput)              │
│      (Disclaimer)               │
└─────────────────────────────────┘
```

The footer section contains:

- **PromptInput**: User input area with send/cancel functionality
- **Disclaimer**: Optional legal or informational text
