# ToolFooter

Footer component for tool messages with action buttons and status message

## Features

- **Status Message Display**: Shows loading indicator with custom message
- **Flexible Actions**: Supports any number of action buttons with custom labels and views
- **Configurable Loader**: Can show or hide loading indicator
- **Custom Button Views**: Each action can have its own button view style

## Usage

```tsx
import {ToolFooter} from '@/components/molecules/ToolFooter';
import type {Action} from '@/types/common';

// Basic usage with multiple actions
const actions: Action[] = [
    {label: 'Accept', onClick: () => console.log('Accepted'), view: 'action'},
    {label: 'Reject', onClick: () => console.log('Rejected'), view: 'outlined'},
];

<ToolFooter
    content="Awaiting confirmation"
    actions={actions}
/>

// With single action
<ToolFooter
    content="Awaiting form submission"
    actions={[{label: 'Cancel', onClick: () => console.log('Cancelled'), view: 'outlined'}]}
/>
```

## Props

| Prop         | Type              | Required | Default | Description                           |
| ------------ | ----------------- | -------- | ------- | ------------------------------------- |
| `content`    | `React.ReactNode` | -        | -       | Status message to display with loader |
| `actions`    | `Action[]`        | ✓        | -       | Array of action buttons to display    |
| `showLoader` | `boolean`         | -        | `true`  | Whether to show loading indicator     |

## Action

| Prop      | Type              | Required | Description                       |
| --------- | ----------------- | -------- | --------------------------------- |
| `label`   | `string`          | -        | Button label text                 |
| `onClick` | `() => void`      | -        | Handler for button click          |
| `view`    | `ButtonView`      | -        | Button view style from Gravity UI |
| `icon`    | `React.ReactNode` | -        | Icon to display in button         |
