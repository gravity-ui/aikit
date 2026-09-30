# PromptInputBody

A body component for prompt input that displays a textarea with auto-growing capabilities or custom content.

## Features

- **Auto-growing Textarea**: Automatically adjusts height based on content
- **Min/Max Rows**: Configurable minimum and maximum row constraints
- **Maximum Length**: Optional character limit
- **Custom Content**: Replace default textarea with any custom React content
- **Keyboard Support**: Full keyboard event handling
- **Focus Preservation**: A textarea that was focused when `disabledInput` turned on gets the focus back once it is enabled again, and a textarea mounted with `autoFocus` while already disabled takes the focus as soon as it is enabled — in both cases only while nothing else holds the focus

## Usage

```tsx
import {PromptInputBody} from '@gravity-ui/aikit';

// Basic usage
<PromptInputBody
  value={value}
  onChange={setValue}
  placeholder="Type your message..."
/>

// With configuration
<PromptInputBody
  value={value}
  onChange={setValue}
  placeholder="Type your message..."
  minRows={1}
  maxRows={15}
  maxLength={1000}
  autoFocus={true}
/>

// Disabled state
<PromptInputBody
  value={value}
  onChange={setValue}
  placeholder="Type your message..."
  disabledInput={true}
/>

// With custom content
<PromptInputBody>
  <div>Custom body content</div>
</PromptInputBody>
```

## Props

| Prop            | Type                                                        | Required | Default                       | Description                                    |
| --------------- | ----------------------------------------------------------- | -------- | ----------------------------- | ---------------------------------------------- |
| `value`         | `string`                                                    | -        | -                             | Value of the textarea                          |
| `placeholder`   | `string`                                                    | -        | -                             | Placeholder text                               |
| `maxLength`     | `number`                                                    | -        | -                             | Maximum length of input                        |
| `size`          | `TextAreaProps['size']`                                     | -        | `'l'` (`'xl'` in mobile mode) | Size of the textarea                           |
| `minRows`       | `number`                                                    | -        | `1`                           | Minimum number of rows                         |
| `maxRows`       | `number`                                                    | -        | `15`                          | Maximum number of rows                         |
| `autoFocus`     | `boolean`                                                   | -        | `false`                       | Auto focus on mount                            |
| `disabledInput` | `boolean`                                                   | -        | `false`                       | Disabled state for input                       |
| `onChange`      | `(value: string) => void`                                   | -        | -                             | Change handler                                 |
| `onKeyDown`     | `(event: React.KeyboardEvent<HTMLTextAreaElement>) => void` | -        | -                             | Key down handler                               |
| `children`      | `ReactNode`                                                 | -        | -                             | Custom content to replace the default textarea |
| `className`     | `string`                                                    | -        | -                             | Additional CSS class                           |
| `qa`            | `string`                                                    | -        | -                             | QA/test identifier                             |

## Styling

The component uses CSS variables for theming:

| Variable                                          | Description                                                                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--g-spacing-3`                                   | Padding around content                                                                                                                              |
| `--g-aikit-prompt-input-body-textarea-max-height` | Maximum height of the autosized textarea (default: `none`); caps the field so its text scrolls inside instead of growing further                    |
| `--g-aikit-scroll-overscroll-behavior`            | Overscroll behavior of the textarea (default: `auto`); `contain` stops a scroll gesture from chaining to the page once the textarea reaches its end |

The component uses a clear view style from Gravity UI with no visible borders by default.
