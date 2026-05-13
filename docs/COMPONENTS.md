# Components

49 components organized by Atomic Design level. Each component lives in `src/components/<level>/<Name>/` and ships with its own README and Storybook stories.

Each component also has a dedicated subpath export for tree-shaking — `import {ComponentName} from '@gravity-ui/aikit/ComponentName'` — except `AIStudioChat` (use the main entry).

## Atoms (16)

| Component                                                                        | Description                                                                |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [ActionButton](../src/components/atoms/ActionButton/README.md)                   | Button with integrated tooltip (Button + ActionTooltip from Gravity UI).   |
| [Alert](../src/components/atoms/Alert/README.md)                                 | Alert message with type indicator and optional button.                     |
| [ChatDate](../src/components/atoms/ChatDate/README.md)                           | Formatted date with time and locale support.                               |
| [ContextIndicator](../src/components/atoms/ContextIndicator/README.md)           | Circular progress indicator for context usage (0–100%).                    |
| [ContextItem](../src/components/atoms/ContextItem/README.md)                     | Label for rendering a context chip.                                        |
| [DiffStat](../src/components/atoms/DiffStat/README.md)                           | Diff statistics — added/deleted line counts.                               |
| [Disclaimer](../src/components/atoms/Disclaimer/README.md)                       | Informational or warning message block.                                    |
| [FileIcon](../src/components/atoms/FileIcon/README.md)                           | Icon for a file based on MIME type or extension.                           |
| InlineCitation                                                                   | Citation link rendered inline in markdown.                                 |
| [IntersectionContainer](../src/components/atoms/IntersectionContainer/README.md) | Intersection Observer wrapper (used by `MessageList` for infinite scroll). |
| [Loader](../src/components/atoms/Loader/README.md)                               | Loading-state indicator.                                                   |
| [MarkdownRenderer](../src/components/atoms/MarkdownRenderer/README.md)           | Yandex Flavored Markdown (YFM) → HTML renderer.                            |
| [MessageBalloon](../src/components/atoms/MessageBalloon/README.md)               | Visual wrapper for a user message.                                         |
| [Shimmer](../src/components/atoms/Shimmer/README.md)                             | Shimmer animation overlay for loading state.                               |
| [SubmitButton](../src/components/atoms/SubmitButton/README.md)                   | Submit button with send/cancel state switching.                            |
| [ToolIndicator](../src/components/atoms/ToolIndicator/README.md)                 | Tool-execution status icon.                                                |

## Molecules (19)

| Component                                                                    | Description                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [ActionPopup](../src/components/molecules/ActionPopup/README.md)             | Anchored popup container for action-button content.         |
| [BaseMessage](../src/components/molecules/BaseMessage/README.md)             | Base wrapper with support for action buttons.               |
| [ButtonGroup](../src/components/molecules/ButtonGroup/README.md)             | Wrapper for a button group with orientation support.        |
| [FeedbackForm](../src/components/molecules/FeedbackForm/README.md)           | Reusable feedback form with reason selection and comment.   |
| [FileDropZone](../src/components/molecules/FileDropZone/README.md)           | Drag-and-drop area with hidden file input (native HTML5).   |
| [FileItem](../src/components/molecules/FileItem/README.md)                   | File row: icon, name, size, status, remove button.          |
| [InputContext](../src/components/molecules/InputContext/README.md)           | React context for prompt-input attachments and chips.       |
| [PromptInputBody](../src/components/molecules/PromptInputBody/README.md)     | Textarea body for prompt input with auto-grow.              |
| [PromptInputFooter](../src/components/molecules/PromptInputFooter/README.md) | Footer with action icons and submit button.                 |
| [PromptInputHeader](../src/components/molecules/PromptInputHeader/README.md) | Header with context items / context indicator.              |
| [PromptInputPanel](../src/components/molecules/PromptInputPanel/README.md)   | Panel container for custom prompt content.                  |
| [RatingBlock](../src/components/molecules/RatingBlock/README.md)             | Rating block with title and star rating.                    |
| [StarRating](../src/components/molecules/StarRating/README.md)               | 1–5 star rating component.                                  |
| [Suggestions](../src/components/molecules/Suggestions/README.md)             | Clickable suggestion buttons in grid or list layout.        |
| [Tabs](../src/components/molecules/Tabs/README.md)                           | Section tabs with optional delete (built on uikit `Label`). |
| [ToolFooter](../src/components/molecules/ToolFooter/README.md)               | Tool-message footer with action buttons and status.         |
| [ToolHeader](../src/components/molecules/ToolHeader/README.md)               | Tool-message header with icon, name, actions, indicators.   |
| [ToolStatus](../src/components/molecules/ToolStatus/README.md)               | Tool-status indicator with localized text.                  |

## Organisms (9)

| Component                                                                  | Description                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [AssistantMessage](../src/components/organisms/AssistantMessage/README.md) | Assistant message with multi-part content and custom renderers.            |
| [AttachmentPicker](../src/components/organisms/AttachmentPicker/README.md) | Paperclip button that opens the file upload dialog.                        |
| [FileUploadDialog](../src/components/organisms/FileUploadDialog/README.md) | Dialog with drag-and-drop and queued/uploaded files list.                  |
| [Header](../src/components/organisms/Header/README.md)                     | Chat header with navigation and actions.                                   |
| [MessageList](../src/components/organisms/MessageList/README.md)           | Message list with custom renderer registry support.                        |
| [PromptInput](../src/components/organisms/PromptInput/README.md)           | Flexible chat input — simple/full views, panels, suggestions, attachments. |
| [ThinkingMessage](../src/components/organisms/ThinkingMessage/README.md)   | AI thinking process with collapsible content and status.                   |
| [ToolMessage](../src/components/organisms/ToolMessage/README.md)           | Tool message with automatic expand/collapse and status behavior.           |
| [UserMessage](../src/components/organisms/UserMessage/README.md)           | User message renderer.                                                     |

## Templates (3)

| Component                                                              | Description                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| [ChatContent](../src/components/templates/ChatContent/README.md)       | Chat content container — empty state vs message list switching. |
| [EmptyContainer](../src/components/templates/EmptyContainer/README.md) | Welcome screen with image, title, description, suggestions.     |
| [History](../src/components/templates/History/README.md)               | Chat history popup — list, search, grouping, actions.           |

## Pages (2)

| Component                                                        | Description                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [AIStudioChat](../src/components/pages/AIStudioChat/README.md)   | Ready-to-use chat with built-in OpenAI streaming — needs only an API URL. |
| [ChatContainer](../src/components/pages/ChatContainer/README.md) | Fully assembled chat — integrates Header, ChatContent, and History.       |
