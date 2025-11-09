# ToolIndicator

A status indicator component that displays different icons based on the tool execution status. Shows a loader for loading state.

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
