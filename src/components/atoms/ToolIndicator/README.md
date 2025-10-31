# ToolIndicator

A status indicator component that displays different icons based on the tool execution status.

## Usage

```tsx
import {ToolIndicator} from '@/components/atoms/ToolIndicator';

<ToolIndicator />
<ToolIndicator status="success" />
<ToolIndicator status="error" />
<ToolIndicator status="info" />

<ToolIndicator status="success" qa="tool-status-indicator" />
```

## Props

| Prop        | Type                           | Required | Default | Description                          |
| ----------- | ------------------------------ | -------- | ------- | ------------------------------------ |
| `status`    | `success` \| `error` \| `info` | -        | `info`  | Current status of the tool execution |
| `className` | `string`                       | -        | -       | Additional CSS class                 |
| `qa`        | `string`                       | -        | -       | QA/test identifier                   |
