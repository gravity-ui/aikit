# ToolHeader

Header component for tool messages with icon, name, actions, and status indicators

## Features

- **Tool Icon Display**: Shows custom tool icon
- **Tool Name**: Displays tool name with optional additional info
- **Action Buttons**: Supports multiple action buttons with icons
- **Status Indicator**: Displays status
- **Custom Content**: Supports additional content display

## Usage

```tsx
import {ToolHeader} from '@/components/molecules/ToolHeader';
import type {Action} from '@/types/common';
import {Icon} from '@gravity-ui/uikit';
import {CircleInfo, Copy, TrashBin} from '@gravity-ui/icons';

const actions: Action[] = [
  {label: 'Copy', onClick: () => console.log('Copied'), icon: <Icon data={Copy} size={16} />},
  {
    label: 'Delete',
    onClick: () => console.log('Deleted'),
    icon: <Icon data={TrashBin} size={16} />,
  },
];

<ToolHeader
  toolIcon={<Icon data={CircleInfo} size={20} />}
  toolName="My Tool"
  actions={actions}
  status="success"
/>;
```

## Props

| Prop        | Type              | Required | Default | Description                        |
| ----------- | ----------------- | -------- | ------- | ---------------------------------- |
| `toolIcon`  | `React.ReactNode` | -        | -       | Icon to display next to tool name  |
| `toolName`  | `string`          | ✓        | -       | Name of the tool                   |
| `content`   | `React.ReactNode` | -        | -       | Additional information to display  |
| `actions`   | `Action[]`        | -        | -       | Array of action buttons to display |
| `status`    | `ToolStatus`      | -        | -       | Status indicator                   |
| `className` | `string`          | -        | -       | Additional CSS class name          |
| `qa`        | `string`          | -        | -       | Data QA attribute                  |

## Action

| Prop      | Type              | Required | Description               |
| --------- | ----------------- | -------- | ------------------------- |
| `label`   | `string`          | -        | Button label for tooltip  |
| `onClick` | `() => void`      | -        | Handler for button click  |
| `icon`    | `React.ReactNode` | -        | Icon to display in button |
| `view`    | `ButtonView`      | -        | Button view style         |

## ToolStatus

Type: `'success' | 'error' | 'loading'`

| Value     | Description              |
| --------- | ------------------------ |
| `success` | Success status indicator |
| `error`   | Error status indicator   |
| `loading` | Loading status indicator |
