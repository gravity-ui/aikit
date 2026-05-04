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
- **Input Autofocus**: Opt-in autofocus for the prompt input when a new chat is opened or a chat is selected from history

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
      {id: '1', title: 'Explain quantum computing'},
      {id: '2', title: 'Write a poem about nature'},
      {id: '3', title: 'Help me debug my code'},
    ],
  }}
/>

// With suggestions using custom button styling
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: "Welcome to AI Assistant",
    suggestions: [
      {
        id: '1',
        title: 'Explain quantum computing',
        view: 'outlined',
        icon: 'right',
      },
    ],
  }}
/>

// With text wrapping enabled for long suggestions
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: "Welcome to AI Assistant",
    suggestions: [
      {id: '1', title: 'Can you explain quantum computing in simple terms with examples?'},
      {id: '2', title: 'Write a creative poem about nature and seasons'},
    ],
    wrapText: true,
  }}
/>

// With custom React elements for title and description
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: (
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <YourCustomIcon />
        <span>Welcome to AI Assistant</span>
      </div>
    ),
    description: (
      <div>
        <p>Get started by selecting a suggestion below or typing your own message.</p>
        <strong>Available 24/7</strong>
      </div>
    ),
    suggestions: [{id: '1', title: 'Get started'}],
  }}
/>

// With welcome screen and custom alignment
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: "Welcome to AI Assistant",
    description: "How can I help you today?",
    suggestions: [
      {id: '1', title: 'Explain quantum computing'},
    ],
    alignment: {
      image: 'center',
      title: 'center',
      description: 'center',
    },
  }}
/>

// With vertical list layout for suggestions
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    title: "Welcome to AI Assistant",
    description: "Choose an option below:",
    suggestions: [
      {id: '1', title: 'Explain quantum computing'},
      {id: '2', title: 'Write a poem about nature'},
      {id: '3', title: 'Help me debug my code'},
    ],
    layout: 'list',
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
  onFold={handleFolding}
  onClose={handleClose}
  status="streaming"
  error={error}
  showHistory={true}
  showNewChat={true}
  showFolding={false}
  showClose={false}
  texts={{
    headerTitle: "My AI Assistant",
    emptyStateTitle: "Start Chatting",
    emptyStateDescription: "Ask me anything!",
    promptPlaceholder: "Type your question...",
  }}
/>

// With message actions on hover
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  showActionsOnHover={true}
/>

// With default message actions and custom loader statuses
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  messageListConfig={{
    userActions: [
      {
        type: 'copy',
        onClick: (message) => handleCopy(message.content),
        icon: CopyIcon,
      },
      {
        type: 'edit',
        onClick: (message) => handleEdit(message),
        icon: EditIcon,
      },
    ],
    assistantActions: [
      {
        type: 'copy',
        onClick: (message) => handleCopy(message.content),
        icon: CopyIcon,
      },
      {
        type: 'like',
        onClick: (message) => handleLike(message.id),
        icon: LikeIcon,
      },
      {
        type: 'unlike',
        onClick: (message) => handleUnlike(message.id),
        icon: UnlikeIcon,
      },
    ],
    loaderStatuses: ['submitted', 'streaming'],
  }}
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
  disclaimerProps={{
    className: 'custom-disclaimer',
    text: 'Custom disclaimer text',
    variant: 'caption-2',
  }}
  historyProps={{
    groupBy: 'date',
    searchable: true,
  }}
/>

// With custom section classes
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  className="custom-chat"
  headerClassName="custom-header"
  contentClassName="custom-content"
  footerClassName="custom-footer"
/>

// Hide header title when chat is empty
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  hideTitleOnEmptyChat={true}
  headerProps={{
    title: "My Chat Assistant",
  }}
/>
```

## QA (test identifiers)

Use the `qa` prop to set `data-qa` attributes for automated tests.

| Form                                 | Behavior                                                                                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa="my-chat"`                       | Sets **only** the root container `data-qa` (same as before). Child components keep their default test ids (`submit-button-full`, `message-list`, `header-action-newChat`, …). |
| `qa={{ prefix: 'chat' }}`            | Opt-in: applies `${prefix}-${slot}` to major slots (root uses `prefix` if `root` is omitted).                                                                                 |
| `qa={{ root: '…', header: '…', … }}` | Explicit per-slot values. Each key wins over `prefix`.                                                                                                                        |

Explicit keys (all optional) on `ChatContainerQa`: `prefix`, `root`, `header`, `headerNewChat`, `headerHistory`, `headerFolding`, `headerClose`, `content`, `emptyState`, `messageList`, `actionPopup`, `promptInput`, `promptInputHeader`, `promptInputBody`, `promptInputFooter`, `submitButton`, `disclaimer`, `history`.

Nested `*Props.qa` (e.g. `promptInputProps.qa`, `messageListConfig.qa`) still work; values from the top-level `qa` object take precedence when both are set.

```tsx
// Root only (backward compatible)
<ChatContainer qa="my-chat" messages={messages} onSendMessage={handleSendMessage} />

// Prefix all major slots
<ChatContainer
  qa={{ prefix: 'chat' }}
  messages={messages}
  onSendMessage={handleSendMessage}
/>

// Fine-grained
<ChatContainer
  qa={{
    root: 'chat',
    messageList: 'chat-messages',
    submitButton: 'chat-send',
    history: 'chat-history',
  }}
  messages={messages}
  onSendMessage={handleSendMessage}
/>
```

## Texts (copy overrides)

Use the `texts` prop with type `ChatContainerTexts` for a **flat** API over user-visible strings that `ChatContainer` wires into its subtree.

**`texts.*` always wins** when set. After that, each area uses the fallback order in the table below (then built-in `i18n()` defaults where applicable):

| Area                                                    | Order after `texts.*`                                      |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Header title                                            | `headerProps.title` → active chat name → default `i18n()`  |
| Header action tooltips                                  | `headerProps.actionTooltips` → Header built-in `i18n()`    |
| Empty / welcome copy                                    | `welcomeConfig` → `emptyContainerProps` → default `i18n()` |
| Prompt placeholder / submit tooltips / cancelable label | `promptInputProps.*` → PromptInput defaults                |
| Prompt suggestions title (above input chips)            | `promptInputProps.suggestionsProps.suggestTitle`           |
| Message list error text                                 | `messageListConfig.errorMessage` or `error.message`        |
| Disclaimer                                              | `disclaimerProps.text` → default `i18n()`                  |
| History empty / filtered / search placeholder           | `historyProps` → HistoryList built-in `i18n()`             |

| Key                               | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `headerTitle`                     | Header title (before `headerProps.title` / active chat name)                     |
| `headerNewChatTooltip`            | Tooltip on the new-chat header action                                            |
| `headerHistoryTooltip`            | Tooltip on the history header action                                             |
| `headerCloseTooltip`              | Tooltip on the close header action                                               |
| `headerFoldingCollapsedTooltip`   | Tooltip when folding is collapsed (expand)                                       |
| `headerFoldingOpenedTooltip`      | Tooltip when folding is opened (collapse)                                        |
| `emptyStateTitle`                 | Welcome / empty state title (`ReactNode`)                                        |
| `emptyStateDescription`           | Welcome description (`ReactNode`)                                                |
| `emptyStateSuggestionsTitle`      | Title above suggestions (`ReactNode`)                                            |
| `emptyStateShowMoreText`          | "Show more" button label                                                         |
| `promptPlaceholder`               | Prompt textarea placeholder                                                      |
| `promptSuggestTitle`              | Title above PromptInput inline suggestions (`promptInputProps.suggestionsProps`) |
| `submitSendTooltip`               | Submit button tooltip (ready / send)                                             |
| `submitCancelTooltip`             | Submit button tooltip (streaming / cancel)                                       |
| `submitButtonCancelableText`      | Visible label next to the stop icon in cancelable submit state                   |
| `errorText`                       | Message list error alert main text                                               |
| `historySearchPlaceholder`        | History list search/filter field placeholder                                     |
| `historyEmptyPlaceholder`         | History list when there are no chats (`ReactNode`)                               |
| `historyEmptyFilteredPlaceholder` | History list when search has no results (`ReactNode`)                            |
| `disclaimerText`                  | Disclaimer body (string; matches `DisclaimerProps.text`)                         |

```tsx
<ChatContainer
  messages={messages}
  onSendMessage={onSendMessage}
  texts={{
    headerTitle: 'My AI',
    promptPlaceholder: 'Ask anything...',
    submitSendTooltip: 'Send',
    disclaimerText: 'AI may be wrong.',
  }}
/>
```

## Props

| Prop                   | Type                                   | Required           | Default   | Description                                                                    |
| ---------------------- | -------------------------------------- | ------------------ | --------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| `messages`             | `TMessage[]`                           | -                  | `[]`      | Array of messages in current chat                                              |
| `onSendMessage`        | `(data: TSubmitData) => Promise<void>` | ✓                  | -         | Callback when user sends a message                                             |
| `chats`                | `ChatType[]`                           | -                  | `[]`      | Array of chats for history                                                     |
| `activeChat`           | `ChatType \| null`                     | -                  | `null`    | Currently active chat                                                          |
| `onSelectChat`         | `(chat: ChatType) => void`             | -                  | -         | Callback when user selects a chat from history                                 |
| `onCreateChat`         | `() => void`                           | -                  | -         | Callback when user creates a new chat                                          |
| `onDeleteChat`         | `(chat: ChatType) => void`             | -                  | -         | Callback when user deletes a chat                                              |
| `onDeleteAllChats`     | `() => Promise<void>`                  | -                  | -         | Callback when user deletes all chats                                           |
| `onFold`               | `(value: 'collapsed'                   | 'opened') => void` | -         | -                                                                              | Callback when user folds/unfolds the chat |
| `onClose`              | `() => void`                           | -                  | -         | Callback when user closes the chat                                             |
| `onCancel`             | `() => Promise<void>`                  | -                  | -         | Callback when user cancels streaming                                           |
| `status`               | `ChatStatus`                           | -                  | `'ready'` | Chat status: `'submitted'` \| `'streaming'` \| `'ready'` \| `'error'`          |
| `error`                | `Error \| null`                        | -                  | `null`    | Error state                                                                    |
| `onRetry`              | `() => void`                           | -                  | -         | Callback to retry after error                                                  |
| `showActionsOnHover`   | `boolean`                              | -                  | `false`   | Show message actions (copy, like, edit) on hover                               |
| `contextItems`         | `ContextItemConfig[]`                  | -                  | `[]`      | Array of context items to display in prompt input header                       |
| `transformOptions`     | `OptionsType`                          | -                  | -         | Transform options for markdown rendering                                       |
| `messageListConfig`    | `MessageListConfig`                    | -                  | -         | Configuration for MessageList (actions, loader statuses)                       |
| `headerProps`          | `Partial<HeaderProps>`                 | -                  | -         | Props override for Header component                                            |
| `contentProps`         | `Partial<ChatContentProps>`            | -                  | -         | Props override for ChatContent component                                       |
| `emptyContainerProps`  | `Partial<EmptyContainerProps>`         | -                  | -         | Props override for EmptyContainer                                              |
| `promptInputProps`     | `Partial<PromptInputProps>`            | -                  | -         | Props override for PromptInput component                                       |
| `disclaimerProps`      | `Partial<DisclaimerProps>`             | -                  | -         | Props override for Disclaimer component                                        |
| `historyProps`         | `Partial<HistoryProps>`                | -                  | -         | Props override for History component                                           |
| `welcomeConfig`        | `WelcomeConfig`                        | -                  | -         | Welcome screen configuration for empty state                                   |
| `texts`                | `ChatContainerTexts`                   | -                  | -         | Flat unified copy overrides (see **Texts**)                                    |
| `showHistory`          | `boolean`                              | -                  | `true`    | Show chat history feature                                                      |
| `showNewChat`          | `boolean`                              | -                  | `true`    | Show new chat button                                                           |
| `showFolding`          | `boolean`                              | -                  | `false`   | Show folding button                                                            |
| `showClose`            | `boolean`                              | -                  | `false`   | Show close button                                                              |
| `hideTitleOnEmptyChat` | `boolean`                              | -                  | `false`   | Hide header title and preview when chat is empty                               |
| `className`            | `string`                               | -                  | -         | Additional CSS class                                                           |
| `headerClassName`      | `string`                               | -                  | -         | Additional CSS class for header section                                        |
| `contentClassName`     | `string`                               | -                  | -         | Additional CSS class for content section                                       |
| `footerClassName`      | `string`                               | -                  | -         | Additional CSS class for footer section                                        |
| `qa`                   | `string \| ChatContainerQa`            | -                  | -         | QA/test identifiers: string = root only; object = map or `prefix` (see **QA**) |

## Types

### ChatContainerQa

See **QA (test identifiers)**. Exported as `ChatContainerQa` from `@gravity-ui/aikit`.

### ChatContainerTexts

See **Texts (copy overrides)**. Exported as `ChatContainerTexts` from `@gravity-ui/aikit`.

### WelcomeConfig

Configuration for the welcome screen displayed when there are no messages:

```tsx
interface WelcomeConfig {
  image?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  suggestionTitle?: string;
  suggestions?: SuggestionsItem[];
  alignment?: AlignmentConfig;
  wrapText?: boolean;
  showDefaultTitle?: boolean;
  showDefaultDescription?: boolean;
  showMore?: () => void;
  showMoreText?: string;
}
```

#### WelcomeConfig Properties

- **`image`**: React element to display as welcome image/icon
- **`title`**: Welcome screen title - can be a string or custom React element
- **`description`**: Welcome screen description - can be a string or custom React element
- **`suggestionTitle`**: Title text above the suggestions section
- **`suggestions`**: Array of `SuggestionsItem` objects (see below)
- **`alignment`**: Alignment configuration for image, title, and description (see Alignment section)
- **`layout`**: Layout orientation for suggestions - `'grid'` for horizontal (default), `'list'` for vertical
- **`wrapText`**: Enable text wrapping inside suggestion buttons instead of ellipsis (default: `false`)
- **`showDefaultTitle`**: Enable default title when neither `title` nor `texts.emptyStateTitle` / `emptyContainerProps.title` are provided (default: `true`)
- **`showDefaultDescription`**: Enable default description when neither `description` nor `texts.emptyStateDescription` / `emptyContainerProps.description` are provided (default: `true`)
- **`showMore`**: Callback function for "Show More" button
- **`showMoreText`**: Custom text for the "Show More" button

#### Suggestions Properties

The `suggestions` array uses the `SuggestionsItem` type. When a suggestion is clicked, its `title` value is sent as the message content.

**SuggestionsItem Properties:**

- **`title`** (required): The text displayed on the button and sent as message content
- **`id`** (optional): Unique identifier for the suggestion
- **`view`** (optional): Button styling - `'normal'`, `'action'`, `'outlined'`, `'flat'`, `'flat-secondary'`, `'outlined-info'`
- **`icon`** (optional): Icon position - `'left'` displays ChevronLeft, `'right'` displays ChevronRight

**Text Wrapping:**

By default, long suggestion text is truncated with an ellipsis. Enable `wrapText: true` in `WelcomeConfig` to allow text to wrap to multiple lines within the button.

**Examples:**

```tsx
// Simple suggestion
{
  id: '1',
  title: 'Explain quantum computing',
}

// Suggestion with custom styling and icon
{
  id: '2',
  title: 'Write a creative poem about nature',
  view: 'outlined',
  icon: 'right',
}

// Suggestion with different button view
{
  id: '3',
  title: 'Help me debug my code',
  view: 'flat-secondary',
}
```

### MessageListConfig

Configuration for MessageList component behavior (actions and loader):

```tsx
interface MessageListConfig {
  userActions?: DefaultMessageAction<TUserMessage>[];
  assistantActions?: DefaultMessageAction<TAssistantMessage>[];
  loaderStatuses?: ChatStatus[];
}
```

#### MessageListConfig Properties

- **`userActions`**: Array of default actions for user messages (optional)
- **`assistantActions`**: Array of default actions for assistant messages (optional)
- **`loaderStatuses`**: Array of chat statuses that should display the loader (default: `['submitted']`)

**Example:**

```tsx
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  messageListConfig={{
    userActions: [
      {
        type: 'copy',
        onClick: (message) => navigator.clipboard.writeText(message.content),
        icon: CopyIcon,
      },
      {
        type: 'edit',
        onClick: (message) => handleEdit(message),
        icon: EditIcon,
      },
    ],
    assistantActions: [
      {
        type: 'copy',
        onClick: (message) => navigator.clipboard.writeText(message.content),
        icon: CopyIcon,
      },
      {
        type: 'like',
        onClick: (message) => handleLike(message.id),
        icon: LikeIcon,
      },
    ],
    loaderStatuses: ['submitted', 'streaming'],
  }}
/>
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

## Hiding Title on Empty Chat

The `hideTitleOnEmptyChat` prop allows you to hide the header title and preview when the chat is in empty state (no messages). This is useful for creating a cleaner welcome screen where the title appears only after starting a conversation.

**Example:**

```tsx
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  hideTitleOnEmptyChat={true}
  headerProps={{
    title: 'AI Chat Assistant',
    preview: <span>Beta</span>,
  }}
/>
```

**Behavior:**

- When `hideTitleOnEmptyChat={false}` (default): Title and preview are always visible
- When `hideTitleOnEmptyChat={true}`:
  - Empty chat (no messages): Title and preview are hidden
  - Chat with messages: Title and preview are visible

**Note:** If you explicitly set `showTitle` in `headerProps`, it takes precedence over `hideTitleOnEmptyChat`.

## Chat History Integration

History is integrated through a popup anchored to the history button in the Header:

- Click the history button to open/close the popup
- Select a chat to switch to it
- Delete individual chats with the delete action
- Search and filter chats
- Automatic grouping by date (configurable)

## Message Actions

There are two ways to provide actions for messages:

### 1. Per-Message Actions

Actions can be provided in the `actions` field of each message. These actions appear on hover (when `showActionsOnHover` is enabled) or permanently:

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

### 2. Default Actions (Recommended)

Use `messageListConfig` prop with `userActions` and `assistantActions` to provide default actions for all messages of that role. This is cleaner and more maintainable than adding actions to each message individually:

```tsx
<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  messageListConfig={{
    userActions: [
      {
        type: 'copy',
        onClick: (message) => {
          navigator.clipboard.writeText(message.content);
        },
        icon: CopyIcon,
      },
      {
        type: 'edit',
        onClick: (message) => {
          handleEditMessage(message.id, message.content);
        },
        icon: EditIcon,
      },
    ],
    assistantActions: [
      {
        type: 'copy',
        onClick: (message) => {
          navigator.clipboard.writeText(message.content);
        },
        icon: CopyIcon,
      },
      {
        type: 'like',
        onClick: (message) => {
          handleRating(message.id, 'like');
        },
        icon: LikeIcon,
      },
      {
        type: 'unlike',
        onClick: (message) => {
          handleRating(message.id, 'unlike');
        },
        icon: UnlikeIcon,
      },
    ],
  }}
/>
```

**How Default Actions Work:**

- Default actions are applied to messages that don't have their own `actions` field
- If a message has its own `actions` field, it takes precedence over default actions
- The `onClick` callback receives the entire message object as parameter
- You can access any message property (id, content, metadata, etc.) in the callback

**DefaultMessageAction Type:**

```tsx
type DefaultMessageAction<TMessage> = {
  type: string;
  onClick: (message: TMessage) => void;
  icon?: IconData;
};
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

#### bodyProps autofocus options

Two opt-in flags control automatic focusing of the prompt input:

| Prop                    | Type      | Default | Description                                                  |
| ----------------------- | --------- | ------- | ------------------------------------------------------------ |
| `autoFocusOnNewChat`    | `boolean` | `true`  | Focus the input when the user clicks the new chat (+) button |
| `autoFocusOnChatSelect` | `boolean` | `true`  | Focus the input when the user selects a chat from history    |

```tsx
<ChatContainer
  promptInputProps={{
    bodyProps: {
      autoFocusOnNewChat: true,
      autoFocusOnChatSelect: true,
    },
  }}
/>
```

Both flags default to `false`. When enabled, `ChatContainer` remounts the `PromptInput` with `autoFocus` set to `true` at the appropriate moment, so the cursor lands in the textarea without any extra user interaction.

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

## Welcome Screen Alignment

The welcome screen supports custom alignment for the image, title, and description elements through the `alignment` property in `welcomeConfig`:

```tsx
<ChatContainer
  messages={[]}
  onSendMessage={handleSendMessage}
  welcomeConfig={{
    image: <MyIcon />,
    title: 'Welcome!',
    description: 'Get started with AI Chat',
    // Center all elements
    alignment: {
      image: 'center',
      title: 'center',
      description: 'center',
    },
  }}
/>
```

### Alignment Options

Each element can be aligned independently:

- **`image`**: Alignment for the welcome image/icon (`'left'` | `'center'` | `'right'`)
- **`title`**: Alignment for the title text (`'left'` | `'center'` | `'right'`)
- **`description`**: Alignment for the description text (`'left'` | `'center'` | `'right'`)

Default alignment is `'left'` for all elements if not specified.

### Alignment Examples

```tsx
// Left alignment (default)
alignment: {
  image: 'left',
  title: 'left',
  description: 'left',
}

// Centered layout (recommended for hero-style welcome screens)
alignment: {
  image: 'center',
  title: 'center',
  description: 'center',
}

// Right alignment
alignment: {
  image: 'right',
  title: 'right',
  description: 'right',
}

// Mixed alignment (centered image, left-aligned text)
alignment: {
  image: 'center',
  title: 'left',
  description: 'left',
}
```

## Internationalization

Default copy comes from the ChatContainer locale JSON (`i18n('…')`). Override any visible string with the **`texts`** prop (`ChatContainerTexts`); see **Texts (copy overrides)** above.

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

| Variable                                            | Description                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `--g-aikit-chat-container-background`               | Background color of the entire chat container                    |
| `--g-aikit-chat-container-header-background`        | Background color of the header section                           |
| `--g-aikit-chat-container-content-background`       | Background color of the content section (general)                |
| `--g-aikit-chat-container-content-empty-background` | Background color of the content section in empty view            |
| `--g-aikit-chat-container-content-chat-background`  | Background color of the content section in chat view             |
| `--g-aikit-chat-container-footer-background`        | Background color of the footer section (general)                 |
| `--g-aikit-chat-container-footer-empty-background`  | Background color of the footer section in empty view             |
| `--g-aikit-chat-container-footer-chat-background`   | Background color of the footer section in chat view              |
| `--g-aikit-layout-base-padding-m`                   | Padding for header, content, and footer sections (default: 12px) |
| `--g-spacing-1`                                     | Gap between footer elements (default: 4px)                       |
| `--g-spacing-2`                                     | Gap between header elements (default: 8px)                       |
| `--g-spacing-4`                                     | Bottom padding for content section (default: 16px)               |

```css
/* Example: Custom theme */
.custom-chat {
  --g-aikit-chat-container-background: #ffffff;
  --g-aikit-chat-container-header-background: #f5f5f5;
  --g-aikit-chat-container-content-background: #fafafa;
  --g-aikit-chat-container-footer-background: #f5f5f5;
  --g-aikit-layout-base-padding-m: 16px;
}
```

```css
/* Example: Different backgrounds for empty and chat views */
.custom-chat {
  --g-aikit-chat-container-content-empty-background: #f9f9f9;
  --g-aikit-chat-container-content-chat-background: #ffffff;
  --g-aikit-chat-container-footer-empty-background: #f9f9f9;
  --g-aikit-chat-container-footer-chat-background: #ffffff;
}
```

```tsx
/* Example: Inline styles */
<ChatContainer
  className="custom-chat"
  style={{
    '--g-aikit-chat-container-background': '#ffffff',
    '--g-aikit-layout-base-padding-m': '16px',
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
- Tracks an internal `promptInputKey` counter that triggers a `PromptInput` remount with `autoFocus` when `autoFocusOnNewChat` or `autoFocusOnChatSelect` are enabled

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
