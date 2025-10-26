# Orbit Library Architecture

## Atomic Design Principles

The library is built on **Atomic Design** principles, which ensure:

- Clear component hierarchy
- Element reusability
- Easy maintenance
- Flexible customization

## Component Levels

### 1. Atoms

Minimal indivisible UI elements without business logic.

**Characteristics:**

- Do not contain business logic
- Stateless
- Unaware of usage context
- Accept data only through props

**Examples:** `Loader`, `Button`, `Icon`

### 2. Molecules

Simple groups of atoms forming basic UI blocks.

**Characteristics:**

- Combine multiple atoms
- Minimal internal logic
- Reusable blocks

**Examples:** `ButtonGroup`, `Tabs`, `Suggestions`

### 3. Organisms

Complex self-sufficient components with internal logic.

**Characteristics:**

- Contain business logic
- Have internal state
- Provide ready component + hook
- Can be used independently

**Examples:** `Header`, `MessageList`, `PromptBox`

### 4. Templates

Complete layouts combining organisms.

**Characteristics:**

- Define page structure
- Coordinate organism interactions
- Work with abstract data

**Examples:** `History`, `EmptyContainer`, `ChatContent`

### 5. Pages

Full integrations with specific data.

**Characteristics:**

- Highest level of abstraction
- Manage data and state
- Connect all components together

**Examples:** `ChatContainer`

## Two-Level Approach

Each organism provides two ways of usage:

### 1. Ready Component

Fully assembled component with UI and logic:

```typescript
import { PromptBox } from 'orbit';

<PromptBox
    onSend={handleSend}
    placeholder="Enter message..."
/>
```

### 2. Hook with Logic

Hook for creating custom view:

```typescript
import { usePromptBox } from 'orbit';

function CustomPromptBox() {
    const {
        value,
        setValue,
        handleSubmit,
        canSubmit
    } = usePromptBox({
        onSend: handleSend
    });

    return (
        <div className="custom-prompt">
            {/* Your custom implementation */}
        </div>
    );
}
```

## State Management

### Data Handling Principle

- Library doesn't manage data directly
- All data is passed through props
- State is managed on the client side
- Library provides callback interfaces

### Data Flow Example

```typescript
// Client code manages data
const [messages, setMessages] = useState<MessageType[]>([]);
const [isLoading, setIsLoading] = useState(false);

// Library receives data through props
<ChatContainer
    messages={messages}
    isLoading={isLoading}
    onSendMessage={async (content) => {
        // Client manages requests
        setIsLoading(true);
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        const data = await response.json();
        setMessages(prev => [...prev, data]);
        setIsLoading(false);
    }}
/>
```

## Type System

### Base Message Structure

```typescript
export type BaseMessage<TData = any> = {
  id: string; // Unique identifier
  type: string; // Message type
  author: string; // Author
  timestamp: string; // Timestamp
  state?: MessageState; // State
  data: TData; // Display data
  metadata?: Record<string, any>; // Metadata
};
```

### Data Separation Principle

- Common metadata at the top level
- Specific data in `data` field
- Type safety through generics
- Easy validation and serialization

## Extensibility

### Custom Type Registration

```typescript
const customTypes: MessageTypeRegistry = {
    chart: {
        component: ChartMessageView,
        validator: (msg) => msg.type === 'chart',
        metadata: {
            name: 'Chart Message',
            description: 'Interactive chart',
        }
    }
};

<ChatContainer
    messages={messages}
    messageTypeRegistry={customTypes}
/>
```

## Theming

### CSS Variables

All styles are controlled through CSS variables:

```css
:root {
  --ai-chat-bg-primary: #ffffff;
  --ai-chat-text-primary: #000000;
  --ai-chat-border-radius: 12px;
  /* ... */
}

[data-theme='dark'] {
  --ai-chat-bg-primary: #1a1a1a;
  --ai-chat-text-primary: #ffffff;
  /* ... */
}
```

### Applying Theme

```typescript
<ChatContainer
    theme="dark"  // 'light' | 'dark' | 'auto'
    // ...
/>
```

## Performance

### Optimizations

- `React.memo` for all components
- Virtualization for large lists
- Lazy loading for custom types
- Memoization for heavy computations

### Code Splitting

```typescript
// Automatic code splitting for custom types
const ChartMessage = lazy(() => import('./ChartMessage'));
```

## Accessibility

### ARIA Attributes

All interactive elements have:

- `aria-label` for screen readers
- `role` for semantics
- `aria-live` for dynamic changes

### Keyboard Navigation

- `Enter` — send message
- `Escape` — cancel
- `Tab` — navigation
- `↑/↓` — prompt history

## Testing

### Unit Tests

- Tests for each atom and molecule
- Mock data for isolation

### Integration Tests

- Component interaction tests
- User scenario verification
