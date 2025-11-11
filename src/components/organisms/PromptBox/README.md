# PromptBox

A flexible input component for chat interfaces with support for simple and full views, attachments, suggestions, and more.

## Features

- **Two View Modes**: Simple view with minimal UI, Full view with header and footer
- **Context Indicator**: Show usage context with percentage or number display
- **Action Icons**: Settings, attachment, and microphone support
- **Suggestions**: Display submit suggestions below the input
- **Custom Content**: Replace header or footer with custom content
- **Keyboard Support**:
  - `Enter` to submit
  - `Shift+Enter` for new line
  - `Ctrl/Cmd+Enter` for new line
- **Streaming Support**: Cancelable streaming state
- **Auto-growing Input**: Textarea automatically adjusts height

## Usage

```tsx
import {PromptBox} from '@gravity-ui/aikit';

// Simple view
<PromptBox
  view="simple"
  onSend={async (data) => {
    console.log('Sending:', data.content);
  }}
  placeholder="Type your message..."
/>

// Full view with all features
<PromptBox
  view="full"
  onSend={async (data) => {
    console.log('Sending:', data.content);
  }}
  onCancel={async () => {
    console.log('Cancelling');
  }}
  placeholder="Type your message..."
  showContextIndicator={true}
  contextIndicatorProps={{
    type: 'percent',
    usedContext: 24,
  }}
  showSettings={true}
  showAttachment={true}
  showMicrophone={true}
  onSettingsClick={() => console.log('Settings')}
  onAttachmentClick={() => console.log('Attachment')}
  onMicrophoneClick={() => console.log('Microphone')}
/>

// With suggestions
<PromptBox
  view="simple"
  onSend={handleSend}
  showSubmitSuggestions={true}
  submitSuggestions={[
    'Write a function',
    'Explain this code',
    'Fix the bug',
  ]}
/>
```

## Props

| Prop                    | Type                                   | Required | Default                                 | Description                         |
| ----------------------- | -------------------------------------- | -------- | --------------------------------------- | ----------------------------------- |
| `view`                  | `'full' \| 'simple'`                   | -        | `'simple'`                              | View variant                        |
| `onSend`                | `(data: TSubmitData) => Promise<void>` | ✓        | -                                       | Callback when message is sent       |
| `onCancel`              | `() => Promise<void>`                  | -        | -                                       | Callback when sending is cancelled  |
| `disabled`              | `boolean`                              | -        | `false`                                 | Disabled state                      |
| `isStreaming`           | `boolean`                              | -        | `false`                                 | Is streaming state                  |
| `placeholder`           | `string`                               | -        | `'Plan, code, build and test anything'` | Placeholder text for textarea       |
| `maxLength`             | `number`                               | -        | -                                       | Maximum length of input             |
| `minRows`               | `number`                               | -        | `1`                                     | Minimum number of textarea rows     |
| `maxRows`               | `number`                               | -        | `15`                                    | Maximum number of textarea rows     |
| `autoFocus`             | `boolean`                              | -        | `false`                                 | Auto focus textarea on mount        |
| `topContent`            | `ReactNode`                            | -        | -                                       | Custom content for header area      |
| `bottomContent`         | `ReactNode`                            | -        | -                                       | Custom content for footer area      |
| `submitSuggestions`     | `string[]`                             | -        | -                                       | Submit suggestions array            |
| `showSubmitSuggestions` | `boolean`                              | -        | `false`                                 | Show submit suggestions             |
| `onSuggestionClick`     | `(suggestion: string) => void`         | -        | -                                       | Callback when suggestion is clicked |
| `showContextIndicator`  | `boolean`                              | -        | `false`                                 | Show context indicator in header    |
| `contextIndicatorProps` | `ContextIndicatorProps`                | -        | -                                       | Props for context indicator         |
| `showSettings`          | `boolean`                              | -        | `false`                                 | Show settings icon in footer        |
| `onSettingsClick`       | `() => void`                           | -        | -                                       | Settings icon click handler         |
| `showAttachment`        | `boolean`                              | -        | `false`                                 | Show attachment icon in footer      |
| `onAttachmentClick`     | `() => void`                           | -        | -                                       | Attachment icon click handler       |
| `showMicrophone`        | `boolean`                              | -        | `false`                                 | Show microphone icon in footer      |
| `onMicrophoneClick`     | `() => void`                           | -        | -                                       | Microphone icon click handler       |
| `className`             | `string`                               | -        | -                                       | Additional CSS class                |
| `qa`                    | `string`                               | -        | -                                       | QA/test identifier                  |

## Component Structure

PromptBox consists of three molecule components:

- **PromptInputHeader**: Contains context indicator or custom content
- **PromptInputBody**: Displays the textarea or custom content
- **PromptInputFooter**: Contains action icons and submit button

All state management is handled internally by the `usePromptBox` hook.

## Styling

The component uses CSS variables for theming:

| Variable                    | Description                       |
| --------------------------- | --------------------------------- |
| `--g-color-line-generic`    | Border color around the component |
| `--g-color-base-background` | Background color of the component |

The component has a rounded border with 12px border-radius.
