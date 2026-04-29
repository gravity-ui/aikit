# UserMessage

Component for rendering a user message in a chat interface.

## Features

- **Avatar support** — optionally display a user avatar next to the message
- **Markdown rendering** — render message content as rich markdown
- **Image attachments** — display one or more images above the text balloon
- **Message actions** — copy, edit, and other action buttons shown inline or on hover
- **Timestamp display** — optionally show the message send time

## Usage

````tsx
import {UserMessage} from '@gravity-ui/aikit';

// Plain text message
<UserMessage content="Analyze the project and suggest improvements." />

// Markdown message
<UserMessage
  content="Explain this:\n\n```js\nconst x = 1;\n```"
  format="markdown"
/>

// With attached images (base64 or URL)
<UserMessage
  content="What is wrong with these screenshots?"
  images={['data:image/png;base64,...', 'https://example.com/screenshot.png']}
/>

// With avatar and timestamp
<UserMessage
  content="Hello!"
  showAvatar
  avatarUrl="https://example.com/avatar.jpg"
  showTimestamp
  timestamp="1705312234567"
/>

// With action buttons
<UserMessage
  content="Help me debug this."
  actions={[
    {actionType: 'copy', onClick: () => navigator.clipboard.writeText('Help me debug this.')},
    {actionType: 'edit', onClick: () => openEditor()},
  ]}
  showActionsOnHover
/>
````

## Props

| Prop                            | Type                    | Required | Default   | Description                                                                                                    |
| ------------------------------- | ----------------------- | -------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `content`                       | `React.ReactNode`       | ✓        | -         | Message content (string for plain/markdown, ReactNode for custom)                                              |
| `format`                        | `'plain' \| 'markdown'` | -        | `'plain'` | Rendering format; `'markdown'` enables rich text via `MarkdownRenderer`                                        |
| `images`                        | `string[]`              | -        | -         | Base64 data URLs or image URLs displayed above the text balloon                                                |
| `showAvatar`                    | `boolean`               | -        | `false`   | Show user avatar beside the message                                                                            |
| `avatarUrl`                     | `string`                | -        | `''`      | Image URL for the avatar                                                                                       |
| `showTimestamp`                 | `boolean`               | -        | `false`   | Show message timestamp                                                                                         |
| `timestamp`                     | `string`                | -        | `''`      | Timestamp value (Unix ms as string or ISO date)                                                                |
| `showActionsOnHover`            | `boolean`               | -        | `false`   | Show action buttons only on hover instead of always                                                            |
| `actions`                       | `BaseMessageAction[]`   | -        | -         | Array of action button configs (copy, edit, custom, etc.)                                                      |
| `transformOptions`              | `OptionsType`           | -        | -         | Options passed to [@diplodoc/transform](https://github.com/diplodoc-platform/transform) for markdown rendering |
| `shouldParseIncompleteMarkdown` | `boolean`               | -        | -         | Allow incomplete markdown to be parsed (useful during streaming)                                               |
| `className`                     | `string`                | -        | -         | Additional CSS class                                                                                           |
| `qa`                            | `string`                | -        | -         | QA/test identifier                                                                                             |

## Styling

The component uses CSS variables for theming:

| Variable              | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `--g-spacing-1`       | Gap between the avatar and the message balloon, and between multiple balloons |
| `--g-border-radius-m` | Border radius applied to attached images                                      |
