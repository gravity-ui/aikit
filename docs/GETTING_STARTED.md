# Quick Start

This guide will help you get started with the Aikit library.

## Installation

```bash
npm install aikit
# or
yarn add aikit
# or
pnpm add aikit
```

## Basic Usage

### 1. Simple Chat Out of the Box

The fastest way to get started is to use the ready-made `ChatContainer` component:

```typescript
import React, { useState } from 'react';
import { ChatContainer } from 'aikit';
import type { ChatType, MessageType } from 'aikit';

function App() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [chats, setChats] = useState<ChatType[]>([]);
    const [activeChat, setActiveChat] = useState<ChatType | null>(null);

    const handleSendMessage = async (content: string) => {
        // Your message sending logic
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message: content })
        });
        const data = await response.json();

        // Update state
        setMessages(prev => [...prev, data]);
    };

    return (
        <ChatContainer
            chats={chats}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectChat={setActiveChat}
            onCreateChat={() => {/* Create chat */}}
            onDeleteChat={(chat) => {/* Delete chat */}}
        />
    );
}
```

### 2. Using Individual Components

For more flexible customization, use components separately:

```typescript
import {
    Header,
    MessageList,
    PromptBox,
} from 'aikit';

function CustomChat() {
    return (
        <div className="custom-chat">
            <Header
                title="AI Assistant"
                onNewChat={() => {/* ... */}}
            />

            <MessageList
                messages={messages}
                showTimestamp
            />

            <PromptBox
                onSend={handleSend}
                placeholder="Enter message..."
            />
        </div>
    );
}
```

### 3. Using Hooks for Full Customization

```typescript
import { usePromptBox } from 'aikit';

function MyCustomPromptBox() {
    const {
        value,
        setValue,
        handleSubmit,
        canSubmit
    } = usePromptBox({
        onSend: async (data) => {
            // Your logic
        }
    });

    return (
        <div className="my-prompt">
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
            >
                Send
            </button>
        </div>
    );
}
```

## Working with Message Types

### Built-in Types

The library supports three built-in message types:

1. **Simple** — regular text message
2. **Thinking** — AI thinking process
3. **Tool** — tool execution

```typescript
import type {SimpleMessageType} from 'aikit';

const message: SimpleMessageType = {
  type: 'simple',
  id: 'msg-1',
  author: 'assistant',
  timestamp: new Date().toISOString(),
  state: 'success',
  data: {
    formattedText: 'Hello! How can I help?',
  },
};
```

### Custom Message Types

You can create your own message types:

```typescript
import type { BaseMessage, MessageTypeRegistry } from 'aikit';

// 1. Define data
interface ImageMessageData {
    imageUrl: string;
    caption?: string;
}

// 2. Create message type
type ImageMessage = BaseMessage<ImageMessageData> & {
    type: 'image';
};

// 3. Create display component
const ImageMessageView = ({ message }: { message: ImageMessage }) => {
    return (
        <div>
            <img src={message.data.imageUrl} />
            {message.data.caption && <p>{message.data.caption}</p>}
        </div>
    );
};

// 4. Register type
const customTypes: MessageTypeRegistry = {
    image: {
        component: ImageMessageView,
        validator: (msg) => msg.type === 'image'
    }
};

// 5. Use in ChatContainer
<ChatContainer
    messages={messages}
    messageTypeRegistry={customTypes}
/>
```

## Theming

### Using Built-in Themes

```typescript
<ChatContainer
    theme="dark"  // 'light' | 'dark' | 'auto'
    // ...
/>
```

### Customization via CSS Variables

```css
:root {
  --ai-chat-bg-primary: #ffffff;
  --ai-chat-text-primary: #000000;
  --ai-chat-accent-color: #0077ff;
  --ai-chat-border-radius: 12px;
}

[data-theme='dark'] {
  --ai-chat-bg-primary: #1a1a1a;
  --ai-chat-text-primary: #ffffff;
}
```

## Streaming

The library supports streaming responses:

```typescript
const handleSendMessage = async (content: string) => {
  // Create temporary message in streaming state
  const tempMessage: SimpleMessageType = {
    type: 'simple',
    id: 'temp-' + Date.now(),
    author: 'assistant',
    timestamp: new Date().toISOString(),
    state: 'streaming',
    data: {formattedText: ''},
  };

  setMessages((prev) => [...prev, tempMessage]);

  // Streaming from server
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({message: content}),
  });

  const reader = response.body.getReader();
  let accumulated = '';

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;

    accumulated += new TextDecoder().decode(value);

    // Update message as data arrives
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempMessage.id ? {...msg, data: {formattedText: accumulated}} : msg,
      ),
    );
  }

  // Change state to success
  setMessages((prev) =>
    prev.map((msg) => (msg.id === tempMessage.id ? {...msg, state: 'success' as const} : msg)),
  );
};
```

## Next Steps

- Study the [full architecture](./ARCHITECTURE.md)
- Check out [examples](../plan.md#примеры-использования)
- Review the [API documentation](../plan.md)
