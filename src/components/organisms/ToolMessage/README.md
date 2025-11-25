# ToolMessage

Complete tool message component with automatic expand/collapse functionality and status-based behavior

## Features

- **Tool Header**: Displays tool name, icon, status, and header actions
- **Tool Footer**: Displays footer actions with optional status message and loader
- **Expandable Content**: Automatically adds expand/collapse action when `bodyContent` is provided
- **Status-Based Behavior**: Automatically configures footer actions and messages based on status
- **Flexible Actions**: Supports multiple header and footer actions with custom handlers

## Usage

```tsx
import {ToolMessage} from '@/components/organisms/ToolMessage';
import type {ToolMessageProps} from '@/types/tool';
import {Icon} from '@gravity-ui/uikit';
import {Copy, Pencil} from '@gravity-ui/icons';

<ToolMessage
  toolName="Writing"
  toolIcon={<Icon data={Pencil} size={16} />}
  bodyContent={<div>Tool execution result</div>}
  status="success"
  autoCollapseOnSuccess={true}
/>;
```

## Props

| Prop                    | Type              | Required | Default                                  | Description                                                                                  |
| ----------------------- | ----------------- | -------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `toolName`              | `string`          | ✓        | -                                        | Name of the tool                                                                             |
| `toolIcon`              | `React.ReactNode` | -        | -                                        | Icon to display next to tool name                                                            |
| `headerActions`         | `Action[]`        | -        | `[]`                                     | Array of header action buttons                                                               |
| `footerActions`         | `Action[]`        | -        | Generated based on status                | Array of footer action buttons (auto-generated if not provided)                              |
| `bodyContent`           | `React.ReactNode` | -        | -                                        | Content to display in expandable body section                                                |
| `headerContent`         | `React.ReactNode` | -        | -                                        | Additional content to display in header                                                      |
| `footerContent`         | `React.ReactNode` | -        | Generated based on status                | Status message to display in footer (auto-generated if not provided)                         |
| `status`                | `ToolStatus`      | -        | -                                        | Status indicator that affects footer actions and messages                                    |
| `expandable`            | `boolean`         | -        | `Boolean(bodyContent)`                   | Whether the component can be expanded/collapsed                                              |
| `initialExpanded`       | `boolean`         | -        | `false` (or `true` for waiting statuses) | Initial expanded state. Defaults to `true` for `waitingConfirmation` and `waitingSubmission` |
| `autoCollapseOnSuccess` | `boolean`         | -        | `false`                                  | Automatically collapse the tool when status changes to `success`                             |
| `onAccept`              | `() => void`      | -        | -                                        | Handler for accept action (used with status presets)                                         |
| `onReject`              | `() => void`      | -        | -                                        | Handler for reject action (used with status presets)                                         |
| `className`             | `string`          | -        | -                                        | Additional CSS class name                                                                    |
| `qa`                    | `string`          | -        | -                                        | Data QA attribute                                                                            |

## Status-Based Behavior

The component automatically configures footer actions and messages based on the `status` prop:

- **`waitingConfirmation`**: Shows footer with "Reject" and "Accept" buttons, displays "Awaiting confirmation" message, shows loader. Content is expanded by default.
- **`waitingSubmission`**: Shows footer with "Cancel" button, displays "Awaiting form submission" message, shows loader. Content is expanded by default.

**Important**: Footer is only displayed for `waitingConfirmation` and `waitingSubmission` statuses. For other statuses, footer is hidden.

If `footerActions` or `footerContent` are explicitly provided, they override the automatic generation.
