# ToolIndicator

A status indicator component that displays different icons based on the tool execution status. Shows a loader for loading state.

## Features

- **Status Icons**: Displays different icons for `success`, `error`, `info`, and `loading` statuses
- **Loading Animation**: Shows an animated loader component for the `loading` status
- **Color Theming**: Icon colors are customizable via CSS variables

## Usage

```tsx
import {ToolIndicator} from '@/components/atoms/ToolIndicator';

<ToolIndicator status="success" />;
```

## Props

| Prop        | Type                                        | Required | Default | Description                          |
| ----------- | ------------------------------------------- | -------- | ------- | ------------------------------------ |
| `status`    | `success` \| `error` \| `info` \| `loading` | -        | `info`  | Current status of the tool execution |
| `className` | `string`                                    | -        | -       | Additional CSS class                 |
| `qa`        | `string`                                    | -        | -       | QA/test identifier                   |

## Styling

The component uses CSS variables for theming:

| Variable                   | Description                      |
| -------------------------- | -------------------------------- |
| `--g-color-text-positive`  | Color of the success status icon |
| `--g-color-text-danger`    | Color of the error status icon   |
| `--g-color-text-secondary` | Color of the info status icon    |
