# PromptInputFooter

A footer component for prompt input that displays action icons (settings, attachment, microphone) and a submit button.

## Features

- **Action Icons**: Optional settings, attachment, and microphone icons
- **Submit Button**: Integrated SubmitButton with multiple states
- **Custom Content**: Replace default footer content (SubmitButton always visible)
- **Flexible Actions**: Configurable click handlers for all actions

## Usage

```tsx
import {PromptInputFooter} from '@gravity-ui/aikit';

// Basic usage
<PromptInputFooter
  submitButton={{
    onClick: async () => handleSubmit(),
    state: 'enabled',
  }}
/>

// With all icons
<PromptInputFooter
  submitButton={{
    onClick: async () => handleSubmit(),
    state: 'enabled',
  }}
  showSettings={true}
  showAttachment={true}
  showMicrophone={true}
  onSettingsClick={() => console.log('Settings')}
  onAttachmentClick={() => console.log('Attachment')}
  onMicrophoneClick={() => console.log('Microphone')}
/>

// With custom content
<PromptInputFooter
  submitButton={{
    onClick: async () => handleSubmit(),
    state: 'enabled',
  }}
>
  <select>
    <option>Model 1</option>
    <option>Model 2</option>
  </select>
</PromptInputFooter>
```

## Props

| Prop                | Type                | Required | Default | Description                                                         |
| ------------------- | ------------------- | -------- | ------- | ------------------------------------------------------------------- |
| `submitButton`      | `SubmitButtonProps` | ✓        | -       | Submit button props                                                 |
| `showSettings`      | `boolean`           | -        | `false` | Show settings icon                                                  |
| `onSettingsClick`   | `() => void`        | -        | -       | Settings icon click handler                                         |
| `showAttachment`    | `boolean`           | -        | `false` | Show attachment icon                                                |
| `onAttachmentClick` | `() => void`        | -        | -       | Attachment icon click handler                                       |
| `showMicrophone`    | `boolean`           | -        | `false` | Show microphone icon                                                |
| `onMicrophoneClick` | `() => void`        | -        | -       | Microphone icon click handler                                       |
| `children`          | `ReactNode`         | -        | -       | Custom content to replace the default footer (SubmitButton remains) |
| `className`         | `string`            | -        | -       | Additional CSS class                                                |
| `qa`                | `string`            | -        | -       | QA/test identifier                                                  |

## SubmitButton States

The submit button supports four states:

- `enabled`: Active and ready to submit
- `disabled`: Inactive state
- `loading`: Showing loading spinner
- `cancelable`: Showing stop icon (for canceling streaming)

## Styling

The component uses CSS variables for theming:

| Variable                   | Description              |
| -------------------------- | ------------------------ |
| `--g-spacing-1`            | Gap between action icons |
| `--g-color-text-secondary` | Default icon color       |
| `--g-color-text-primary`   | Icon color on hover      |
