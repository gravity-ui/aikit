# PromptInput

A flexible input component for chat interfaces with support for simple and full views, expandable panels, attachments, suggestions, and more.

## Features

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

| Prop               | Type                                   | Required | Default    | Description                                             |
| ------------------ | -------------------------------------- | -------- | ---------- | ------------------------------------------------------- |
| `view`             | `'full' \| 'simple'`                   | -        | `'simple'` | View variant                                            |
| `onSend`           | `(data: TSubmitData) => Promise<void>` | ✓        | -          | Callback when message is sent                           |
| `onCancel`         | `() => Promise<void>`                  | -        | -          | Callback when sending is cancelled                      |
| `disabled`         | `boolean`                              | -        | `false`    | Disabled state                                          |
| `status`           | `ChatStatus`                           | -        | `'ready'`  | Chat status determining input behavior and button state |
| `maxLength`        | `number`                               | -        | -          | Maximum length of input                                 |
| `headerProps`      | `PromptInputHeaderConfig`              | -        | -          | Header-related props                                    |
| `bodyProps`        | `PromptInputBodyConfig`                | -        | -          | Body/textarea-related props                             |
| `footerProps`      | `PromptInputFooterConfig`              | -        | -          | Footer-related props                                    |
| `suggestionsProps` | `PromptInputSuggestionsConfig`         | -        | -          | Suggestions-related props                               |
| `topPanel`         | `PromptInputPanelConfig`               | -        | -          | Top panel configuration                                 |
| `bottomPanel`      | `PromptInputPanelConfig`               | -        | -          | Bottom panel configuration                              |
| `className`        | `string`                               | -        | -          | Additional CSS class                                    |
| `qa`               | `string`                               | -        | -          | QA/test identifier                                      |

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

| Prop          | Type      | Required | Default                                 | Description                     |
| ------------- | --------- | -------- | --------------------------------------- | ------------------------------- |
| `placeholder` | `string`  | -        | `'Plan, code, build and test anything'` | Placeholder text for textarea   |
| `minRows`     | `number`  | -        | `1`                                     | Minimum number of textarea rows |
| `maxRows`     | `number`  | -        | `15`                                    | Maximum number of textarea rows |
| `autoFocus`   | `boolean` | -        | `false`                                 | Auto focus textarea on mount    |

### PromptInputFooterConfig

| Prop                        | Type         | Required | Default                                            | Description                                          |
| --------------------------- | ------------ | -------- | -------------------------------------------------- | ---------------------------------------------------- |
| `bottomContent`             | `ReactNode`  | -        | -                                                  | Custom content for footer area                       |
| `showSettings`              | `boolean`    | -        | `false`                                            | Show settings icon                                   |
| `onSettingsClick`           | `() => void` | -        | -                                                  | Settings icon click handler                          |
| `showAttachment`            | `boolean`    | -        | `false`                                            | Show attachment icon                                 |
| `onAttachmentClick`         | `() => void` | -        | -                                                  | Attachment icon click handler                        |
| `showMicrophone`            | `boolean`    | -        | `false`                                            | Show microphone icon                                 |
| `onMicrophoneClick`         | `() => void` | -        | -                                                  | Microphone icon click handler                        |
| `submitButtonTooltipSend`   | `string`     | -        | -                                                  | Custom tooltip for submit button in enabled state    |
| `submitButtonTooltipCancel` | `string`     | -        | -                                                  | Custom tooltip for submit button in cancelable state |
| `submitButtonQa`            | `string`     | -        | `'submit-button-full'` or `'submit-button-simple'` | QA/test identifier for submit button                 |

### PromptInputSuggestionsConfig

| Prop                   | Type                                     | Required | Default    | Description                       |
| ---------------------- | ---------------------------------------- | -------- | ---------- | --------------------------------- |
| `suggestions`          | `SuggestionsItem[]`                      | -        | -          | Submit suggestions array          |
| `showSuggestions`      | `boolean`                                | -        | `false`    | Show submit suggestions           |
| `suggestTitle`         | `string`                                 | -        | -          | Title for the suggestions section |
| `suggestionsLayout`    | `'grid' \| 'list'`                       | -        | -          | Layout orientation                |
| `suggestionsTextAlign` | `'left' \| 'center' \| 'right'`          | -        | `'center'` | Text alignment                    |
| `onSuggestionClick`    | `(content: string, id?: string) => void` | -        | -          | Callback when suggestion clicked  |

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

| Variable                                  | Description                               | Default Value |
| ----------------------------------------- | ----------------------------------------- | ------------- |
| `--g-color-line-generic`                  | Border color around the component         | -             |
| `--g-color-base-float`                    | Background color of the component         | -             |
| `--g-color-base-simple-hover-solid`       | Background color for panels               | -             |
| `--g-border-radius-xl`                    | Border radius for component & panels      | -             |
| `--g-spacing-1`                           | Small spacing (8px)                       | -             |
| `--g-spacing-2`                           | Medium spacing (12px)                     | -             |
| `--g-spacing-3`                           | Large spacing (16px)                      | -             |
| `--g-aikit-prompt-input-panel-max-height` | Max height for open panel (for animation) | `500px`       |

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
