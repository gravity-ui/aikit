# PromptInput

A flexible input component for chat interfaces with support for simple and full views, expandable panels, attachments, suggestions, and more.

## Features

- **Application Commands**: Trigger-based and button-based selection with async search and per-message data

- **Two View Modes**: Simple view with minimal UI, Full view with header and footer
- **Expandable Panels**: Top and bottom panels with smooth animation for additional content
- **Context Indicator**: Show usage context with percentage or number display
- **Action Icons**: Settings, attachment, and microphone support
- **Suggestions**: Display submit suggestions below the input
- **Custom Content**: Replace header or footer with custom content
- **Keyboard Support**:
  - `Enter` to submit
  - `Shift+Enter` for new line
  - `Ctrl/Cmd+Enter` for new line
- **Status-based Behavior**: Adapts button state based on chat status (ready, streaming, submitted, error)
- **Auto-growing Input**: Textarea automatically adjusts height

## Usage

```tsx
import {PromptInput} from '@gravity-ui/aikit';

// Simple view
<PromptInput
  view="simple"
  onSend={async (data) => {
    console.log('Sending:', data.content);
  }}
  bodyProps={{
    placeholder: "Type your message..."
  }}
/>

// Full view with all features
<PromptInput
  view="full"
  onSend={async (data) => {
    console.log('Sending:', data.content);
  }}
  onCancel={async () => {
    console.log('Cancelling');
  }}
  bodyProps={{
    placeholder: "Type your message..."
  }}
  headerProps={{
    showContextIndicator: true,
    contextIndicatorProps: {
      type: 'percent',
      usedContext: 24,
    }
  }}
  footerProps={{
    showSettings: true,
    showAttachment: true,
    showMicrophone: true,
    onSettingsClick: () => console.log('Settings'),
    onAttachmentClick: () => console.log('Attachment'),
    onMicrophoneClick: () => console.log('Microphone')
  }}
/>

// With expandable top panel
<PromptInput
  view="simple"
  onSend={handleSend}
  topPanel={{
    isOpen: true,
    children: <CustomTopContent />
  }}
/>

// With expandable bottom panel
<PromptInput
  view="full"
  onSend={handleSend}
  bottomPanel={{
    isOpen: true,
    children: <CustomBottomContent />
  }}
/>

// With both panels
<PromptInput
  view="full"
  onSend={handleSend}
  topPanel={{
    isOpen: isTopPanelOpen,
    children: <TopPanelContent />
  }}
  bottomPanel={{
    isOpen: isBottomPanelOpen,
    children: <BottomPanelContent />
  }}
/>

// With suggestions
<PromptInput
  view="simple"
  onSend={handleSend}
  suggestionsProps={{
    showSuggestions: true,
    suggestTitle: 'Try these prompts:',
    suggestions: [
      {title: 'Write a function', view: 'action'},
      {title: 'Explain this code'},
    ]
  }}
/>
```

## Props

| Prop               | Type                                   | Required | Default    | Description                                                                                     |
| ------------------ | -------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `view`             | `'full' \| 'simple'`                   | -        | `'simple'` | View variant                                                                                    |
| `commands`         | `PromptCommandsConfig`                 | -        | -          | Application command and context sources                                                         |
| `onSend`           | `(data: TSubmitData) => Promise<void>` | ✓        | -          | Callback when message is sent                                                                   |
| `onCancel`         | `() => Promise<void>`                  | -        | -          | Callback when sending is cancelled                                                              |
| `disabled`         | `boolean`                              | -        | `false`    | Disabled state                                                                                  |
| `status`           | `ChatStatus`                           | -        | `'ready'`  | Chat status determining input behavior and button state                                         |
| `maxLength`        | `number`                               | -        | -          | Maximum length of input                                                                         |
| `onValueChange`    | `(value: string) => void`              | -        | -          | Called for accepted input changes, built-in suggestions, inserted newlines, and submit clearing |
| `headerProps`      | `PromptInputHeaderConfig`              | -        | -          | Header-related props                                                                            |
| `bodyProps`        | `PromptInputBodyConfig`                | -        | -          | Body/textarea-related props                                                                     |
| `footerProps`      | `PromptInputFooterConfig`              | -        | -          | Footer-related props                                                                            |
| `suggestionsProps` | `PromptInputSuggestionsConfig`         | -        | -          | Suggestions-related props                                                                       |
| `topPanel`         | `PromptInputPanelConfig`               | -        | -          | Top panel configuration                                                                         |
| `bottomPanel`      | `PromptInputPanelConfig`               | -        | -          | Bottom panel configuration                                                                      |
| `className`        | `string`                               | -        | -          | Additional CSS class                                                                            |
| `qa`               | `string`                               | -        | -          | QA/test identifier                                                                              |

### PromptInputPanelConfig

| Prop       | Type        | Required | Default | Description   |
| ---------- | ----------- | -------- | ------- | ------------- |
| `isOpen`   | `boolean`   | ✓        | -       | Is panel open |
| `children` | `ReactNode` | -        | -       | Panel content |

### PromptInputHeaderConfig

| Prop                    | Type                    | Required | Default | Description                    |
| ----------------------- | ----------------------- | -------- | ------- | ------------------------------ |
| `topContent`            | `ReactNode`             | -        | -       | Custom content for header area |
| `showContextIndicator`  | `boolean`               | -        | `false` | Show context indicator         |
| `contextIndicatorProps` | `ContextIndicatorProps` | -        | -       | Props for context indicator    |

### PromptInputBodyConfig

| Prop                    | Type                       | Required | Default                                 | Description                                 |
| ----------------------- | -------------------------- | -------- | --------------------------------------- | ------------------------------------------- |
| `qa`                    | `string`                   | -        | -                                       | QA/test identifier for body wrapper         |
| `inputRef`              | `Ref<HTMLTextAreaElement>` | -        | -                                       | Ref to the textarea input                   |
| `placeholder`           | `string`                   | -        | `'Plan, code, build and test anything'` | Placeholder text for textarea               |
| `size`                  | `TextAreaProps['size']`    | -        | `'l'` (`'xl'` in mobile mode)           | Size of the textarea                        |
| `minRows`               | `number`                   | -        | `1`                                     | Minimum number of textarea rows             |
| `maxRows`               | `number`                   | -        | `15`                                    | Maximum number of textarea rows             |
| `autoFocus`             | `boolean`                  | -        | `false`                                 | Auto focus textarea on mount                |
| `disabledInput`         | `boolean`                  | -        | `false`                                 | Disabled state for textarea                 |
| `autoFocusOnNewChat`    | `boolean`                  | -        | `false`                                 | Auto focus textarea when a new chat is open |
| `autoFocusOnChatSelect` | `boolean`                  | -        | `false`                                 | Auto focus textarea when a chat is selected |

### PromptInputFooterConfig

| Prop                        | Type                                                      | Required | Default                                                         | Description                                           |
| --------------------------- | --------------------------------------------------------- | -------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `bottomContent`             | `ReactNode`                                               | -        | -                                                               | Custom content for footer area                        |
| `className`                 | `string`                                                  | -        | -                                                               | Additional CSS class for the footer wrapper           |
| `contentClassName`          | `string`                                                  | -        | -                                                               | Additional CSS class for the custom content wrapper   |
| `buttonSize`                | `ButtonButtonProps['size']`                               | -        | `'m'` in full view, `'l'` in simple view, `'xl'` in mobile mode | Size of footer action buttons                         |
| `submitButtonProps`         | `Omit<SubmitButtonProps, 'state' \| 'onClick' \| 'size'>` | -        | -                                                               | Submit button customization, including disabled state |
| `showSettings`              | `boolean`                                                 | -        | `false`                                                         | Show settings icon                                    |
| `onSettingsClick`           | `() => void`                                              | -        | -                                                               | Settings icon click handler                           |
| `showAttachment`            | `boolean`                                                 | -        | `false`                                                         | Show attachment icon                                  |
| `onAttachmentClick`         | `() => void`                                              | -        | -                                                               | Attachment icon click handler                         |
| `showMicrophone`            | `boolean`                                                 | -        | `false`                                                         | Show microphone icon                                  |
| `onMicrophoneClick`         | `() => void`                                              | -        | -                                                               | Microphone icon click handler                         |
| `submitButtonTooltipSend`   | `string`                                                  | -        | -                                                               | Custom tooltip for submit button in enabled state     |
| `submitButtonTooltipCancel` | `string`                                                  | -        | -                                                               | Custom tooltip for submit button in cancelable state  |
| `submitButtonQa`            | `string`                                                  | -        | `'submit-button-full'` or `'submit-button-simple'`              | QA/test identifier for submit button                  |

### PromptInputSuggestionsConfig

| Prop                   | Type                            | Required | Default    | Description                                                          |
| ---------------------- | ------------------------------- | -------- | ---------- | -------------------------------------------------------------------- |
| `suggestions`          | `SuggestionsItem[]`             | -        | -          | Submit suggestions array                                             |
| `showSuggestions`      | `boolean`                       | -        | `false`    | Show submit suggestions                                              |
| `suggestTitle`         | `string`                        | -        | -          | Title for the suggestions section                                    |
| `suggestionsLayout`    | `'grid' \| 'list'`              | -        | -          | Layout orientation                                                   |
| `suggestionsTextAlign` | `'left' \| 'center' \| 'right'` | -        | `'center'` | Text alignment. A non-default value also disables the mobile chevron |
| `onSuggestionClick`    | `SuggestionClickHandler`        | -        | -          | Callback when suggestion clicked                                     |

Suggestions always render with text wrapping enabled: full suggestion text wraps to multiple lines instead of being truncated with an ellipsis. This is not configurable, since prompt suggestions are full-length phrases that must stay readable.

## Expandable Panels

The component supports top and bottom expandable panels with smooth animation:

- **Top Panel**: Displayed above the input area with rounded top corners
- **Bottom Panel**: Displayed below the input area with rounded bottom corners
- **Animation**: Smooth expand/collapse animation with opacity and height transitions (300ms)
- **Content**: Uses `PromptInputPanel` component for consistent styling
- **Smart Unmounting**: Uses `useDelayedUnmount` hook to keep elements in DOM during animation

### Animation Behavior

When a panel is opened (`isOpen` changes from `false` to `true`):

- Element is immediately added to DOM
- CSS animation plays automatically

When a panel is closed (`isOpen` changes from `true` to `false`):

- CSS class `_open` is removed, triggering animation
- Element stays in DOM for 300ms (animation duration)
- After animation completes, element is removed from DOM

This ensures smooth animations work correctly even when elements are unmounted from React.

## Component Structure

The PromptInput component has a hierarchical structure:

### Main Component

- **PromptInput**: Main component that orchestrates all sub-components

### Wrapper Components

- **PromptInputWithSuggestions**: Wraps the input and handles suggestions display
- **PromptInputWithPanels**: Wraps the input and handles expandable top/bottom panels
- **PromptInputFull** / **PromptInputSimple**: View-specific implementations

### Molecule Components

- **PromptInputHeader**: Contains context indicator or custom content (full view only)
- **PromptInputBody**: Auto-growing textarea with placeholder
- **PromptInputFooter**: Action icons (settings, attachment, microphone) and submit button
- **PromptInputPanel**: Styled container for panel content
- **Suggestions**: Display clickable suggestion chips

All state management is handled internally by the `usePromptInput` hook.

## Styling

The component uses CSS variables for theming:

| Variable                                  | Description                               | Default Value      |
| ----------------------------------------- | ----------------------------------------- | ------------------ |
| `--g-color-line-generic`                  | Border color around the component         | -                  |
| `--g-color-base-float`                    | Background color of the component         | -                  |
| `--g-color-base-simple-hover-solid`       | Background color for panels               | -                  |
| `--g-border-radius-xl`                    | Border radius for component & panels      | -                  |
| `--g-spacing-1`                           | Small spacing (8px)                       | -                  |
| `--g-spacing-2`                           | Medium spacing (12px)                     | -                  |
| `--g-spacing-3`                           | Large spacing (16px)                      | -                  |
| `--g-aikit-prompt-input-panel-max-height` | Max height for open panel (for animation) | `500px`            |
| `--g-aikit-prompt-input-simple-padding`   | Padding of the `simple` view              | `4px 4px 4px 12px` |
| `--g-aikit-prompt-input-full-padding`     | Padding of the `full` view                | `8px`              |

```css
/* Example: Custom theme */
.custom-prompt-input {
  --g-color-line-generic: #e0e0e0;
  --g-color-base-float: #ffffff;
  --g-color-base-simple-hover-solid: #f5f5f5;
  --g-border-radius-xl: 16px;
  --g-aikit-prompt-input-panel-max-height: 600px;
}
```

### CSS Classes

The component uses BEM naming convention:

- `.g-aikit-prompt-input` - Main container
- `.g-aikit-prompt-input_view_simple` - Simple view modifier
- `.g-aikit-prompt-input_view_full` - Full view modifier
- `.g-aikit-prompt-input__content` - Content wrapper (body + submit button)
- `.g-aikit-prompt-input__panel-wrapper` - Wrapper for panels
- `.g-aikit-prompt-input__panel` - Panel container
- `.g-aikit-prompt-input__panel_open` - Open panel state
- `.g-aikit-prompt-input__suggestions` - Suggestions container

## Status-based Button States

The component maps `ChatStatus` values to submit button states:

| ChatStatus    | Submit Button State | Description                                            |
| ------------- | ------------------- | ------------------------------------------------------ |
| `'ready'`     | `'enabled'`         | Ready to send message - shows send icon                |
| `'error'`     | `'enabled'`         | Error state - user can retry sending - shows send icon |
| `'streaming'` | `'cancelable'`      | Streaming response - shows stop icon, can cancel       |
| `'submitted'` | `'loading'`         | Message submitted - shows loading indicator            |

When input is empty or disabled, button state is always `'disabled'` regardless of `status`.

## Implementation Details

The component uses the `usePromptInput` hook for state management. The hook:

- Manages textarea value and validation
- Handles keyboard shortcuts (Enter, Shift+Enter, Ctrl/Cmd+Enter)
- Coordinates between header, body, and footer components
- Provides submit and cancel callbacks
- Manages attachments state
- Maps `ChatStatus` to appropriate submit button state

### Animation System

Panels use CSS transitions with `max-height`, `opacity`, and `margin` for smooth animation. The animation duration is 0.3s with `ease-in-out` timing function.

The `useDelayedUnmount` hook is used to delay element removal from DOM:

- When `isOpen` becomes `true`, element is rendered immediately
- When `isOpen` becomes `false`, element stays in DOM for animation duration
- After animation completes, element is safely removed from DOM
- Timeout is automatically cleared if component unmounts

This approach ensures:

- ✅ Smooth opening animations (no delay)
- ✅ Smooth closing animations (element stays during animation)
- ✅ Proper cleanup (no memory leaks)
- ✅ Works with React strict mode and fast refresh

### Using useDelayedUnmount Hook

The `useDelayedUnmount` hook is exported and can be used in your own components that need smooth unmount animations:

```tsx
import {useDelayedUnmount} from '@gravity-ui/aikit';

function MyComponent({isOpen}) {
  const shouldRender = useDelayedUnmount(isOpen, 300); // 300ms delay

  if (!shouldRender) return null;

  return <div className={cn('panel', {open: isOpen})}>{/* Content that should animate out */}</div>;
}
```

**Parameters:**

- `isOpen` (boolean): Current open/close state
- `delayTime` (number, optional): Delay in milliseconds before unmounting (default: 300)

**Returns:**

- `shouldRender` (boolean): Whether the element should be rendered in DOM

The hook is particularly useful when you have CSS transitions that need to complete before removing elements from DOM.

## Commands and context

Pass `commands` directly to `PromptInput`, or through `promptInputProps` on
`ChatContainer` and `AIStudioChat`. Sources are owned by the application and are
scoped to this input. Use unique source IDs and at most one source per trigger.
Item IDs must be unique within a source.

```tsx
import {PromptInput, type PromptCommandSource} from '@gravity-ui/aikit';

const sources: PromptCommandSource[] = [
  {
    id: 'commands',
    title: 'Commands',
    trigger: '/',
    items: [
      {id: 'review', title: '/review', data: {mode: 'review'}},
      {
        id: 'summary',
        title: '/summary',
        insertText: 'Summarize this document.',
        keepSelected: false,
      },
    ],
  },
  {
    id: 'documents',
    title: 'Document context',
    trigger: '@',
    buttonLabel: 'Add context',
    getItems: async (query, {signal}) => {
      const response = await fetch(`/api/documents?q=${encodeURIComponent(query)}`, {signal});
      if (!response.ok) throw new Error('Could not search documents');
      return response.json();
    },
  },
];

<PromptInput
  commands={{sources}}
  onSend={async ({content, selections}) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: content, context: selections}),
    });
    if (!response.ok) throw new Error('Could not send message');
  }}
/>;
```

### Configuration

| Field                | Type                                 | Default        | Description                                    |
| -------------------- | ------------------------------------ | -------------- | ---------------------------------------------- |
| `sources`            | `readonly PromptCommandSource[]`     | Required       | Available command and context sources          |
| `selections`         | `readonly PromptSelection[]`         | Internal state | Controlled draft selections                    |
| `onSelectionsChange` | `(items: PromptSelection[]) => void` | —              | Selection, removal and successful-send updates |

Each source accepts `id`, `title`, optional `/` or `@` `trigger`, optional
`buttonLabel`, `items`, `getItems(query, {signal})`, and synchronous
`onSelect(item, {query, origin})`. `getItems` takes precedence over `items` and
owns filtering; static items are filtered by title, description and keywords.
Keep source objects stable while searching. The search signal is aborted when
the query/source changes or the picker closes. Stale results are ignored even
when the application does not honor cancellation.

Items accept `id`, `title`, `description`, `icon`, `keywords`, `disabled`, `data`,
`insertText` and `keepSelected`. By default, a selection is shown as a removable
chip and passed to `onSend` as `{sourceId, id, title, data}`. Selecting the same
source/item replaces its previous selection. Different items may coexist.
`data` should contain serializable application data, not UI nodes or credentials.

`insertText` replaces the active token, preserving surrounding text. With
`keepSelected: false`, the item only inserts text and/or invokes `onSelect`.
Choosing context via a button preserves the input text. Throwing from `onSelect`
keeps the picker open; asynchronous preparation belongs in `getItems` or the
send handler. Trigger characters inside URLs and email addresses do not open
the picker. The first matching source owns a trigger.

### Sending and lifecycle

`onSend` receives a snapshot of the current selection array. Return `false` to
cancel or reject to report an error and preserve the draft. A resolved send
clears submitted selections; newer selections are retained. Treat selection
objects and their data as immutable. Text is required to submit, including when
only a command or context has been selected.

`ChatContainer` resets uncontrolled selections and closes pending searches on
conversation changes, independently of autofocus settings. Active-conversation
deletion also resets the command state. `AIStudioChat` preserves the draft when
it automatically creates a conversation for the first send.

Applications using controlled `selections` must reset or restore them with their
own conversation state. A standalone `PromptInput` accepts `commandsResetKey`
(`string | number`): changing it clears only uncontrolled command state without
moving focus. `ChatContainer` derives this key from conversation identity and
explicit new/select actions unless the application supplies its own key.

In `AIStudioChat`, `onBeforeSend` receives all submit data, including selections.
Use `transformRequest(request, data)` to map them into any field of the final
request body after file processing. Return a new request object, or `false` to
cancel. No command data is sent automatically. Retries reuse the serialized
request from the original send, without rerunning the mapping callbacks.

```tsx
const transformRequest = (request, {selections = []}) => ({
  ...request,
  metadata: {
    commands: selections.filter((item) => item.sourceId === 'commands'),
  },
  retrieval: {
    documents: selections.filter((item) => item.sourceId === 'documents'),
  },
});
```

See **Commands And Context** in Storybook for a complete `ChatContainer`
integration with request inspection, controlled selections, simulated failures
and both input layouts.

### Picker keyboard support

Arrow keys navigate available options; Enter selects without sending the
message. Escape dismisses suggestions until the text changes. Tab closes the
picker and moves focus normally. Shift+Enter remains a newline. IME composition
never submits or selects a command.

### Command picker styling

The picker uses `--g-spacing-1`, `--g-spacing-2`, `--g-spacing-3`,
`--g-border-radius-m`, `--g-color-base-simple-hover`, `--g-color-text-secondary`
and `--g-text-body-1-font-size` for spacing, corner radius, active background,
description color and description typography respectively. Its width is limited
to the viewport and long result lists scroll.
